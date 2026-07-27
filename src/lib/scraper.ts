import { load } from 'cheerio';
import type { AttendanceRecord, Cookie } from '@/types';

// ---------------------------------------------------------------------------
// Selector constants — UPDATE HERE if SRM changes their HTML
// ---------------------------------------------------------------------------
const LOGIN_SELECTORS = {
  frame: 'iframe#signinFrame, iframe[name="zohoiam"], iframe.siginiframe',
  usernameField: 'input#login_id, input[name="LOGIN_ID"]',
  passwordField: 'input#password, input[name="PASSWORD"]',
  nextButton: 'button#nextbtn, #nextbtn',
  submitButton: 'button#nextbtn, #nextbtn, button#signin_submit',
  captcha: '#captcha, input[name="captcha"], .g-recaptcha, iframe[src*="recaptcha"]',
} as const;

const ATTENDANCE_SELECTORS = {
  pageUrl: '/srm_university/academia-academic-services/page/My_Attendance',
  table: 'table',
} as const;

const ACADEMIA_BASE = 'https://academia.srmist.edu.in';
const LOGIN_URL = `${ACADEMIA_BASE}/`;

// ---------------------------------------------------------------------------
// Browser factory
// ---------------------------------------------------------------------------
async function getBrowser() {
  const { chromium } = await import('playwright');
  return chromium.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
    ],
  });
}


// ---------------------------------------------------------------------------
// Attendance scraper
// ---------------------------------------------------------------------------
export async function scrapeAttendance(cookies: Cookie[]): Promise<AttendanceRecord[]> {
  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 720 },
  });

  await context.addCookies(cookies);

  const page = await context.newPage();

  // Diagnostic: log every response from academia
  page.on('response', (response) => {
    const url = response.url();
    if (url.includes('academia.srmist') || url.includes('attendance')) {
      console.log(`[scraper] RESPONSE ${response.status()} ${url}`);
    }
  });

  try {
    const targetUrl = `${ACADEMIA_BASE}${ATTENDANCE_SELECTORS.pageUrl}`;
    console.log(`[scraper] Navigating to: ${targetUrl}`);

    try {
      await page.goto(`${ACADEMIA_BASE}/`, { waitUntil: 'networkidle', timeout: 15_000 });
    } catch (e) {
      // Ignore timeout if network doesn't completely idle
    }

    const body = await page.evaluate(async (url) => {
      const res = await fetch(url, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'include',
      });
      return res.text();
    }, targetUrl);

    if (body.includes('Academic Web Services Login') || body.includes('signinFrame')) {
      throw new Error('Session expired — please log in and update your cookie');
    }

    console.log(`[scraper-debug] Body (500 chars): ${body.substring(0, 500)}`);
    console.log(`[scraper-debug] Includes 'Course Code': ${body.includes('Course Code')}`);

    const $ = load(body);
    const tableCount = $('table').length;
    console.log(`[scraper] Tables found: ${tableCount}`);

    const records: AttendanceRecord[] = [];

    $('table').each((tIdx, table) => {
      const rows = $(table).find('tr');
      console.log(`[scraper]   table[${tIdx}] rows: ${rows.length}`);

      rows.each((i, row) => {
        if (i === 0) return; // skip header

        const cells = $(row).find('td');
        if (cells.length < 9) return;

        const rawCodeHtml = $(cells[0]).html() || '';
        const courseCode = rawCodeHtml.split('<br')[0].replace(/<[^>]*>?/gm, '').trim();

        if (!courseCode || !courseCode.match(/^[0-9A-Z]{5,10}$/)) return;

        const courseName = $(cells[1]).text().trim();
        const category = $(cells[2]).text().trim();
        const faculty = $(cells[3]).text().trim();
        const slot = $(cells[4]).text().trim();
        const room = $(cells[5]).text().trim();
        const classesHeld = parseInt($(cells[6]).text().trim(), 10);
        const classesAbsent = parseInt($(cells[7]).text().trim(), 10);
        const percentage = parseFloat($(cells[8]).text().trim());
        const classesAttended = classesHeld - classesAbsent;

        records.push({
          courseCode,
          courseName: courseName || 'Unknown Course',
          category: category || 'Theory',
          faculty,
          slot,
          room,
          classesHeld: isNaN(classesHeld) ? null : classesHeld,
          classesAttended: isNaN(classesAttended) ? null : classesAttended,
          percentage: isNaN(percentage) ? 0 : percentage,
        });
      });
    });

    console.log(`[scraper] Parsed subject count: ${records.length}`);
    if (records.length > 0) {
      console.log(`[scraper] First record:`, JSON.stringify(records[0]));
    }

    if (records.length === 0) {
      require('fs').writeFileSync('academia_attendance_debug.html', body);
      console.log('[scraper] 0 records — wrote academia_attendance_debug.html');
    }

    return records;
  } finally {
    await context.close();
    await browser.close();
  }
}

export async function scrapeTimetable(_cookies: Cookie[]): Promise<any[]> {
  // TODO: Implement timetable scraping
  return [];
}

export async function scrapeMarks(_cookies: Cookie[]): Promise<any[]> {
  // TODO: Implement marks scraping
  return [];
}
