# AttendX 🎓

An unofficial, personal web app that lets SRMIST students view their attendance, timetable, and marks in a beautifully designed dashboard.

> ⚠️ **Disclaimer**: AttendX is an unofficial personal tool and is **not affiliated with, endorsed by, or connected to SRM Institute of Science and Technology (SRMIST)**. It is intended for personal academic use only. Your credentials are used solely to authenticate with your own SRM Academia account and are **never stored on any server**.

---

## Features

- 📊 **Overall attendance gauge** with animated radial chart (75% target line)
- 🎯 **Per-subject cards** with circular progress rings (green/amber/red)
- 🧮 **Bunk calculator** — know exactly how many classes you can skip (or must attend)
- 📈 **Trend view** — subjects sorted worst to best
- 🗓️ **Timetable** — today's and full week view
- 📝 **Internal marks** — CAT 1, CAT 2, assignments
- 🔒 **Secure** — session-based, credentials discarded after login, auto-expires in 20 min
- 📱 **Mobile-first** responsive design

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 |
| Animations | Framer Motion |
| Session | iron-session (encrypted cookie, 20-min TTL) |
| Scraping | Playwright (headless Chromium) |
| Rate Limiting | In-memory (5 login attempts/min per IP) |

## Setup

### 1. Prerequisites

- Node.js 18+
- npm 9+

### 2. Clone and install

```bash
git clone <your-repo>
cd attendx
npm install
```

### 3. Install Playwright browsers

```bash
npx playwright install chromium
```

### 4. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and set a strong session secret (≥32 characters):

```env
SESSION_SECRET=your-random-32-plus-character-secret-here
```

Generate one quickly:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/login`.

## Usage

1. Go to `/login`
2. Enter your SRM NetID (registration number) and Academia password
3. Click **Sign in securely** — this launches a headless browser to authenticate with SRM's servers (takes 15–30 seconds)
4. View your attendance dashboard, timetable, and marks

## Security Model

| Concern | How it's handled |
|---|---|
| Password storage | **Never stored** — discarded from memory immediately after Playwright submits the login form |
| Session | Encrypted iron-session cookie (HttpOnly, SameSite=Strict), 20-minute TTL |
| Credentials in logs | No credential is ever logged or included in error messages |
| Rate limiting | 5 login attempts per IP per 60 seconds to prevent SRM account lockout |
| Client-side exposure | All scraping is server-side only — password never touches client JS |

## Adapting to SRM Portal Changes

SRM's portal DOM changes periodically. All selectors are isolated in **`src/lib/scraper.ts`** at the top of each function in clearly named `*_SELECTORS` constants:

```ts
const LOGIN_SELECTORS = {
  usernameField: '#txtUserName',      // ← update this if login breaks
  passwordField: '#txtPassword',
  submitButton: '#btnSignIn',
  // ...fallback selectors...
};
```

If scraping breaks after an SRM portal update:
1. Open browser DevTools on the SRM login page
2. Inspect the form fields to find the new selector names
3. Update the relevant `*_SELECTORS` object in `src/lib/scraper.ts`

## Project Structure

```
src/
├── app/
│   ├── login/page.tsx          # Login form with disclaimer
│   ├── dashboard/page.tsx      # Gauge + subject grid
│   ├── dashboard/[subject]/    # Per-subject detail + bunk calc
│   ├── timetable/page.tsx      # Today/week timetable
│   └── api/
│       ├── auth/login/         # POST: Playwright login, set session
│       ├── auth/logout/        # POST: destroy session
│       ├── attendance/         # GET: scrape attendance
│       ├── timetable/          # GET: scrape timetable
│       └── marks/              # GET: scrape marks
├── lib/
│   ├── scraper.ts              # ← All Playwright scraping logic + selectors
│   ├── session.ts              # iron-session config, bunk calculator
│   └── rateLimit.ts            # In-memory rate limiter
├── components/ui/              # Reusable React components
└── types/index.ts              # Shared TypeScript types
```

## Known Limitations

- **SRM CAPTCHA**: If SRM enables CAPTCHA on the login page, automated login will fail. Currently SRM's portal does not consistently enforce CAPTCHA for regular logins.
- **Session scope**: Sessions are in-memory per server process. Restarting the dev server logs out all users.
- **Portal availability**: If SRM's portal is down for maintenance, scraping will fail with a timeout error.

## License

MIT — personal use only. Not for commercial use or redistribution without permission.

---

*Built with ❤️ for SRMians. Not affiliated with SRMIST.*
