const fs = require('fs');
const { load } = require('cheerio');
const html = fs.readFileSync('zoho_next.html', 'utf8');
const $ = load(html);
$('.fielderror').each((i, el) => {
  console.log('fielderror ' + i + ':', $(el).text().trim());
});
