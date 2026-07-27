import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { SESSION_OPTIONS } from '@/lib/session';
import { checkRateLimit } from '@/lib/rateLimit';
import { loginToAcademia } from '@/lib/scraper';
import type { SessionData } from '@/types';

export async function POST(req: NextRequest) {
  // --- Rate limiting ---
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1';

  const rateCheck = checkRateLimit(ip, 5, 60_000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        error: 'Too many login attempts. Please wait 1 minute before trying again.',
        resetAt: rateCheck.resetAt,
      },
      { status: 429 }
    );
  }

  // --- Parse body ---
  let netId: string;
  let password: string;
  try {
    const body = await req.json();
    netId = (body.netId ?? '').toString().trim();
    if (netId && !netId.includes('@')) {
      netId = `${netId}@srmist.edu.in`;
    }
    password = (body.password ?? '').toString();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!netId || !password) {
    return NextResponse.json({ error: 'NetID and password are required' }, { status: 400 });
  }

  // --- Attempt login via Playwright ---
  try {
    const { cookies: sessionCookies, studentName } = await loginToAcademia(netId, password);
    // Password is discarded by the scraper — not echoed here
    password = ''; // Belt-and-suspenders: zero out in this scope too

    // --- Store session ---
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, SESSION_OPTIONS);
    session.cookies = sessionCookies;
    session.studentName = studentName;
    session.netId = netId;
    session.loginTime = Date.now();
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({ ok: true, studentName });
  } catch (err: unknown) {
    // Return a safe error — never reveal the password or raw error details
    let message = 'Login failed — please check your credentials';
    if (err instanceof Error) {
      message = err.message.replace(netId, '[netid]'); // strip any accidental netid leak
      
      // Sanitize raw Playwright errors (timeouts, locator failures, etc)
      if (message.includes('Timeout') || message.includes('locator.') || message.includes('page.')) {
        message = 'Academia portal is currently unresponsive or heavily loaded. Please try again later.';
      }
    }
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
