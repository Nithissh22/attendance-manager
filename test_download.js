const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();
  
  const url = 'https://academia.srmist.edu.in/srm_university/academia-academic-services/page/My_Attendance';
  
  try {
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
    await page.goto(url, { timeout: 10000 }).catch(e => console.log('Goto error (expected):', e.message));
    
    const download = await downloadPromise;
    const path = await download.path();
    const content = fs.readFileSync(path, 'utf8');
    console.log('Download content length:', content.length);
    console.log('First 500 chars:', content.substring(0, 500));
  } catch(e) {
    console.log('Download Error:', e.message);
  }
  
  await browser.close();
})();
