const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('https://academia.srmist.edu.in', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('iframe#signinFrame, iframe[name="zohoiam"], iframe.siginiframe', { timeout: 10000 });
  
  const frame = page.frameLocator('iframe#signinFrame, iframe[name="zohoiam"], iframe.siginiframe');
  
  await frame.locator('input#login_id, input[name="LOGIN_ID"]').first().waitFor({ state: 'attached', timeout: 15000 });
  await frame.locator('input#login_id, input[name="LOGIN_ID"]').first().fill('ns2400');
  
  const nextBtn = frame.locator('button#nextbtn, #nextbtn, button#signin_submit');
  
  if (await nextBtn.count() > 0 && await nextBtn.first().isVisible()) {
    await nextBtn.first().click();
    await page.waitForTimeout(3000);
  }
  
  await page.screenshot({ path: 'login_error.png' });
  
  const html = await frame.locator('body').innerHTML();
  require('fs').writeFileSync('login_error.html', html);
  
  await browser.close();
})();
