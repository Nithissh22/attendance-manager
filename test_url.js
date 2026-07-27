const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const urls = [
    'https://academia.srmist.edu.in/srm_university/academia-academic-services/page/My_Attendance',
    'https://academia.srmist.edu.in/portal/srm_university/academia-academic-services/page/My_Attendance',
    'https://academia.srmist.edu.in/portal/academia-academic-services/page/My_Attendance'
  ];
  for (const url of urls) {
    console.log('Testing:', url);
    try {
      const res = await page.goto(url, { timeout: 10000 });
      console.log('  Status:', res ? res.status() : 'null');
      console.log('  Content-Type:', res ? res.headers()['content-type'] : 'null');
    } catch(e) {
      console.log('  Error:', e.message.split('\n')[0]);
    }
  }
  await browser.close();
})();
