const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.route('**/*', async (route) => {
    try {
      const response = await route.fetch();
      const headers = { ...response.headers() };
      if (headers['content-disposition']) {
        delete headers['content-disposition'];
      }
      await route.fulfill({ response, headers });
    } catch(e) {
      await route.continue();
    }
  });
  
  const url = 'https://academia.srmist.edu.in/srm_university/academia-academic-services/page/My_Attendance';
  
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
    console.log('Title:', await page.title());
    const html = await page.content();
    console.log('HTML length:', html.length);
  } catch(e) {
    console.log('Goto Error:', e.message);
  }
  
  await browser.close();
})();
