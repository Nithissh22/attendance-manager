const fs = require('fs');
const { load } = require('cheerio');
const html = fs.readFileSync('zoho_next.html', 'utf8');
const $ = load(html);
console.log('Alert:', $('.Alert').text().trim());
console.log('Error:', $('.Errormsg').text().trim());
console.log('Fielderror:', $('.fielderror').text().trim());
console.log('Password Visible:', $('#password').attr('style'));
