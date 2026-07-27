const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function run() {
  const store = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'session-store.json'), 'utf-8'));
  const sessions = Object.values(store);
  const cookies = sessions.sort((a, b) => b.savedAt - a.savedAt)[0].cookies;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.addCookies(cookies);
  const page = await context.newPage();

  console.log('Navigating to academia...');
  await page.goto('https://academia.srmist.edu.in/', { waitUntil: 'networkidle', timeout: 60000 });
  
  console.log('Waiting for .user-name or .welcome...');
  await page.waitForTimeout(5000);
  
  const html = await page.content();
  fs.writeFileSync('academia_pw_dump.html', html);
  
  const name1 = await page.evaluate(() => {
    const el = document.querySelector('.user-name, [class*="welcome"], [class*="student"]');
    return el ? el.innerText : null;
  });
  console.log('Playwright found name:', name1);

  await browser.close();
}
run().catch(console.error);
