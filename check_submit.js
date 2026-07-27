const fs = require('fs');
const { load } = require('cheerio');
const html = fs.readFileSync('zoho_next.html', 'utf8');
const $ = load(html);
console.log('Submit buttons:', $('#nextbtn').length);
console.log('Submit button tag:', $('#nextbtn').prop('tagName'));
console.log('Submit button classes:', $('#nextbtn').attr('class'));
