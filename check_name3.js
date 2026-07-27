const fs=require('fs');
const html=fs.readFileSync('academia_pw_dump.html', 'utf-8');
const cheerio = require('cheerio');
const $ = cheerio.load(html);

$('*').each((i, el)=>{
  if($(el).children().length===0) {
    const text = $(el).text();
    if (text.toLowerCase().includes('welcome') || text.toLowerCase().includes('nithissh')) {
      console.log(el.tagName, $(el).attr('class'), text.substring(0, 100));
    }
  }
});
