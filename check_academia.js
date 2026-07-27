const fs = require('fs');
const { load } = require('cheerio');
const html = fs.readFileSync('academia_dump.html', 'utf8');
const $ = load(html);

console.log('Forms:', $('form').length);
$('form').each((i, el) => {
  console.log('Form ' + i + ' action:', $(el).attr('action'));
  $(el).find('input').each((j, inEl) => {
    console.log('  Input:', $(inEl).attr('name') || $(inEl).attr('id'), $(inEl).attr('type'));
  });
});

console.log('Captcha:', html.toLowerCase().includes('captcha'));
console.log('Recaptcha Class:', $('.g-recaptcha').length > 0);
