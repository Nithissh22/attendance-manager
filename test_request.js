const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  
  const url = 'https://academia.srmist.edu.in/srm_university/academia-academic-services/page/My_Attendance';
  
  try {
    const response = await context.request.get(url);
    const body = await response.text();
    console.log('Status:', response.status());
    console.log('Headers:', response.headers()['content-disposition']);
    console.log('Body length:', body.length);
    console.log('Body start:', body.substring(0, 200));
  } catch(e) {
    console.log('Fetch Error:', e.message);
  }
  
  await browser.close();
})();
