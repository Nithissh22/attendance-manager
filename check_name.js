const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

async function run() {
  const storePath = path.join(__dirname, 'data', 'session-store.json');
  if (!fs.existsSync(storePath)) {
    console.log('No session store found');
    return;
  }
  const store = JSON.parse(fs.readFileSync(storePath, 'utf-8'));
  const sessions = Object.values(store);
  if (sessions.length === 0) {
    console.log('No sessions found');
    return;
  }
  
  // Get latest session
  const latestSession = sessions.sort((a, b) => b.savedAt - a.savedAt)[0];
  const cookies = latestSession.cookies;
  const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');
  
  console.log('Fetching academia with cookies...');
  const res = await fetch('https://academia.srmist.edu.in/', {
    headers: { 'Cookie': cookieString }
  });
  
  const html = await res.text();
  console.log('Response length:', html.length);
  
  const $ = cheerio.load(html);
  const nameText1 = $('.user-name').text();
  const nameText2 = $('[class*="welcome"]').text();
  const nameText3 = $('[class*="student"]').text();
  
  console.log('Selector .user-name:', nameText1);
  console.log('Selector [class*="welcome"]:', nameText2);
  console.log('Selector [class*="student"]:', nameText3);
  
  const scriptMatch = html.match(/loginName\s*:\s*['"]([^'"]+)['"]/i);
  if (scriptMatch) {
    console.log('Found in script loginName:', scriptMatch[1]);
  }
  
  const userNameMatch = html.match(/userName\s*:\s*['"]([^'"]+)['"]/i);
  if (userNameMatch) {
    console.log('Found in script userName:', userNameMatch[1]);
  }
  
  fs.writeFileSync('academia_homepage_dump.html', html);
  console.log('Dumped HTML to academia_homepage_dump.html');
}

run().catch(console.error);
