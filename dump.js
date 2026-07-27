const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('https://academia.srmist.edu.in/');
  await page.waitForTimeout(5000); // Wait for iframe and JS to load
  
  // Try to find the iframe
  const iframeElement = await page.$('iframe#signinFrame');
  if (iframeElement) {
    const frame = await iframeElement.contentFrame();
    if (frame) {
      console.log('Iframe HTML:', await frame.content());
    } else {
      console.log('Main HTML:', await page.content());
    }
  } else {
    console.log('Main HTML:', await page.content());
  }

  await browser.close();
})();
