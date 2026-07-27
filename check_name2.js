const fs = require('fs');
const html = fs.readFileSync('academia_homepage_dump.html', 'utf-8');
const cheerio = require('cheerio');
const $ = cheerio.load(html);

console.log('Searching for elements containing Name or Welcome...');
$('*').each((i, el) => {
  if ($(el).children().length === 0) {
    const text = $(el).text();
    if (text.toLowerCase().includes('nithissh') || text.toLowerCase().includes('welcome')) {
      console.log('Found in tag:', el.tagName, 'Class:', $(el).attr('class'), 'Text:', text.trim().substring(0, 50));
    }
  }
});

const scripts = $('script').map((i, el) => $(el).html()).get();
for (const script of scripts) {
  if (script && (script.toLowerCase().includes('nithissh') || script.toLowerCase().includes('welcome'))) {
    console.log('Found in script snippet:', script.substring(0, 100).replace(/\n/g, ' '));
  }
}
