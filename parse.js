const html = require('fs').readFileSync('attendance_page_dump.html', 'utf8');
const cheerio = require('cheerio');
const $ = cheerio.load(html);

const tables = $('table.table, table[id*="attendance"], table[class*="attendance"]');
console.log('Number of tables found:', tables.length);

tables.each((i, table) => {
  const rows = $(table).find('tbody tr');
  console.log(`Table ${i} has ${rows.length} rows`);
  rows.each((j, tr) => {
    const cells = $(tr).find('td');
    console.log(`  Row ${j} has ${cells.length} cells`);
    if (cells.length >= 5) {
      console.log('    ', cells.map((k, td) => $(td).text().trim()).get());
    }
  });
});
