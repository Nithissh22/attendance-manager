const fs = require('fs');
const html = fs.readFileSync('debug_academia.html', 'utf8');
const { load } = require('cheerio');
const $ = load(html);
console.log('Iframe count:', $('iframe').length);
console.log('Input count:', $('input').length);
console.log('Input login_id:', $('input#login_id').length);
