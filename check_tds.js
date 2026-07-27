const fs = require('fs');
const html = fs.readFileSync('attendance_page_dump.html', 'utf8');
const trs = html.match(/<tr[\s>][\s\S]*?<\/tr>/gi);
trs.forEach(tr => {
  if (tr.includes('21CSC303J')) {
    const tds = tr.match(/<td[\s>][\s\S]*?<\/td>/gi);
    console.log('Row with 21CSC303J has', tds.length, 'tds');
    console.log(tds);
  }
});
