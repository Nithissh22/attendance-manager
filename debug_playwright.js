const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('Navigating...');
  await page.goto('https://academia.srmist.edu.in', { waitUntil: 'domcontentloaded', timeout: 30000 });
  console.log('Waiting 5s...');
  await page.waitForTimeout(5000);
  
  const iframe = page.frameLocator('iframe#signinFrame, iframe[name="zohoiam"], iframe.siginiframe');
  
  console.log('Checking iframe count...');
  const iframeCount = await page.locator('iframe#signinFrame, iframe[name="zohoiam"], iframe.siginiframe').count();
  console.log('Iframe count:', iframeCount);
  
  if (iframeCount > 0) {
    const count = await iframe.locator('input#login_id').count();
    console.log('Username field count inside iframe:', count);
    
    if (count === 0) {
      console.log('Checking all inputs in iframe:');
      const inputs = await iframe.locator('input').all();
      for (const input of inputs) {
        console.log(await input.getAttribute('id'), await input.getAttribute('name'));
      }
    }
  } else {
    console.log('Checking all inputs in main page:');
    const inputs = await page.locator('input').all();
    for (const input of inputs) {
      console.log(await input.getAttribute('id'), await input.getAttribute('name'));
    }
  }
  
  await page.screenshot({ path: 'academia_debug.png' });
  await browser.close();
})();
