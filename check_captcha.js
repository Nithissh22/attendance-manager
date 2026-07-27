const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('https://academia.srmist.edu.in', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('iframe#signinFrame', { timeout: 10000 });
  const frame = page.frameLocator('iframe#signinFrame');
  
  await frame.locator('input#login_id').first().waitFor({ state: 'attached', timeout: 15000 });
  
  console.log('Checking for captcha before fill...');
  let captchaCount = await frame.locator('#captcha, input[name="captcha"], .g-recaptcha, iframe[src*="recaptcha"]').count();
  console.log('Captcha count before:', captchaCount);
  
  await frame.locator('input#login_id').first().fill('ns2400@srmist.edu.in');
  const nextBtn = frame.locator('#nextbtn');
  await nextBtn.click();
  
  await page.waitForTimeout(3000);
  
  console.log('Checking for captcha after next...');
  captchaCount = await frame.locator('#captcha, input[name="captcha"], .g-recaptcha, iframe[src*="recaptcha"]').count();
  console.log('Captcha count after:', captchaCount);
  
  await browser.close();
})();
