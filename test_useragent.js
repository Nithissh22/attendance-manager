const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  const url = 'https://academia.srmist.edu.in/srm_university/academia-academic-services/page/My_Attendance';
  
  try {
    await page.goto(url, { timeout: 10000 });
    console.log('Title:', await page.title());
  } catch(e) {
    console.log('Goto error:', e.message);
  }
  
  await browser.close();
})();
