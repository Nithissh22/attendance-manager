const fs = require('fs');
const { load } = require('cheerio');
const html = fs.readFileSync('iframe_dump.html', 'utf8');
const $ = load(html);
console.log('Inputs:');
$('input').each((i, el) => console.log($(el).attr('type'), $(el).attr('name'), $(el).attr('id')));
$('button').each((i, el) => console.log('Button:', $(el).attr('type'), $(el).attr('name'), $(el).attr('id')));
