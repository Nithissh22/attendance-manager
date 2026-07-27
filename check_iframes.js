const fs=require('fs');
const html=fs.readFileSync('academia_pw_dump.html', 'utf-8');
const cheerio = require('cheerio');
const $ = cheerio.load(html);
console.log('iframes:', $('iframe').length);
