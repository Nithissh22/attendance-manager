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
// Login
// ---------------------------------------------------------------------------
export async function loginToAcademia(
  netId: string,
  password: string
): Promise<{ cookies: Cookie[]; studentName: string }> {
  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();

  // Stealth script to bypass basic headless detection
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  try {
    // Navigate to login page
    try {
      await page.goto(LOGIN_URL, { waitUntil: 'commit', timeout: 30_000 });
    } catch (e: any) {
      throw new Error('SRM Academia is taking too long to respond. The portal might be down or heavily loaded.');
    }

    // Wait for the iframe to appear before checking
    await page.waitForSelector(LOGIN_SELECTORS.frame, { timeout: 30000 }).catch(() => {});

    // Try to get the login iframe, if it exists
    const frame = page.frameLocator(LOGIN_SELECTORS.frame);

    // Check if iframe exists by checking its count, if 0 fallback to page
    const frameCount = await page.locator(LOGIN_SELECTORS.frame).count();
    const loginContext = frameCount > 0 ? frame : page;

    // Check for CAPTCHA
    const hasCaptcha = await loginContext.locator(LOGIN_SELECTORS.captcha).count();
    if (hasCaptcha > 0) {
      const captchaVisible = await loginContext.locator(LOGIN_SELECTORS.captcha).first().isVisible();
      if (captchaVisible) throw new Error('CAPTCHA_REQUIRED');
    }

    // Wait for the iframe DOM to load and the input to appear
    const usernameEl = loginContext.locator(LOGIN_SELECTORS.usernameField);
    await usernameEl.first().waitFor({ state: 'attached', timeout: 30000 }).catch(() => {});

    if ((await usernameEl.count()) === 0) {
      throw new Error('Login form not found — SRM portal may have changed its structure');
    }

    await usernameEl.first().fill(netId);

    // Fill password — we clear the reference ASAP
    const passwordEl = loginContext.locator(LOGIN_SELECTORS.passwordField);

    // Zoho is a two-step login (Email -> Next -> Password -> Sign In)
    const nextBtn = loginContext.locator(LOGIN_SELECTORS.nextButton);
    if (await nextBtn.count() > 0 && await nextBtn.first().isVisible()) {
      await nextBtn.first().click();

      // wait for password field to appear
      try {
        await passwordEl.first().waitFor({ state: 'visible', timeout: 5000 });
      } catch (e) {
        // If it fails to appear, there might be an inline error (like "Enter a valid email")
        const errorLocators = ['.error_message', '.alert_message', '#error', '.fielderror'];
        let extractedError = '';
        for (const selector of errorLocators) {
          const texts = await loginContext.locator(selector).allTextContents();
          const validText = texts.find(t => t && t.trim().length > 0);
          if (validText) {
            extractedError = validText.trim();
            break;
          }
        }
        if (extractedError) {
          throw new Error(`Login error: ${extractedError}`);
        }
        throw new Error('Password field did not appear. Is your NetID correct?');
      }
    }

    if ((await passwordEl.count()) === 0) {
      throw new Error('Password field not found');
    }

    // Check if it's visible (it might be a single-page login where next wasn't clicked)
    if (!(await passwordEl.first().isVisible())) {
      throw new Error('Password field is hidden. NetID may be invalid.');
    }

    await passwordEl.first().fill(password);
    // Immediately discard password from scope
    password = '';

    // Submit the form
    const submitEl = loginContext.locator(LOGIN_SELECTORS.submitButton);
    if ((await submitEl.count()) === 0) throw new Error('Submit button not found');

    await submitEl.first().click();

    // Wait for the login to process and redirect to the dashboard
    // We check for the URL to NOT include "accounts" or "signin" or "zoho", or wait until timeout
    try {
      await page.waitForFunction(() => {
        return !window.location.href.includes('accounts') && !window.location.href.includes('signin');
      }, { timeout: 15_000 });
    } catch (e) {
      // It might have failed, we'll check indicators below
    }

    // Check for login failure indicators
    const currentUrl = page.url();
    const pageText = await page.textContent('body') ?? '';

    // Check captcha again post-submission
    const postCaptchaCount = await loginContext.locator(LOGIN_SELECTORS.captcha).count();
    if (postCaptchaCount > 0) {
      const isVisible = await loginContext.locator(LOGIN_SELECTORS.captcha).first().isVisible();
      if (isVisible) throw new Error('CAPTCHA_REQUIRED');
    }

    if (
      currentUrl.includes('zoho') && (
        pageText.includes('Invalid') ||
        pageText.includes('incorrect') ||
        pageText.includes('failed')
      )
    ) {
      throw new Error('Invalid credentials — please check your NetID and password');
    }

    // Extract student name from page
    let studentName = 'Student';
    const nameEl = await page.$('.user-name, [class*="welcome"], [class*="student"]');
    if (nameEl) {
      const text = (await nameEl.textContent()) ?? '';
      studentName = text.replace(/welcome[,!]?/i, '').trim() || 'Student';
    }

    // Collect session cookies
    const cookies = await context.cookies();

    return { cookies, studentName };
  } finally {
    await context.close();
    await browser.close();
  }
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
