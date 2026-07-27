import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { SESSION_OPTIONS } from '@/lib/session';
import { checkRateLimit } from '@/lib/rateLimit';
import { saveSessionCookies } from '@/lib/store';
import crypto from 'crypto';
import type { SessionData, Cookie } from '@/types';

function parseManualCookieString(cookieString: string): Cookie[] {
  const pairs = cookieString.split(';').map(c => c.trim()).filter(Boolean);
  const cookies: Cookie[] = [];

  for (const pair of pairs) {
    const splitIdx = pair.indexOf('=');
    if (splitIdx === -1) continue;
    const name = pair.slice(0, splitIdx);
    const value = pair.slice(splitIdx + 1);

    // Heuristically assign domain
    let domain = 'academia.srmist.edu.in';
    if (name.includes('csr') || name.includes('iam') || name === 'IAMASS') {
      domain = '.zoho.in';
    }

    cookies.push({
      name,
      value,
      domain,
      path: '/',
      secure: true,
      httpOnly: false,
      sameSite: 'None',
      expires: -1,
    });
  }

  return cookies;
}

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

  let cookieString: string;
  try {
    const body = await req.json();
    cookieString = (body.cookieString ?? '').toString().trim();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!cookieString) {
    return NextResponse.json({ error: 'Cookie string is required' }, { status: 400 });
  }

  try {
    const sessionCookies = parseManualCookieString(cookieString);
    const studentName = 'Student'; // Cannot scrape name without automated login
    const netId = 'manual-session';

    // --- Store session ---
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, SESSION_OPTIONS);
    
    const sessionId = crypto.randomUUID();
    saveSessionCookies(sessionId, sessionCookies);
    
    session.sessionId = sessionId;
    session.studentName = studentName;
    session.netId = netId;
    session.loginTime = Date.now();
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({ ok: true, studentName });
  } catch (err: unknown) {
    let message = 'Failed to process session cookies.';
    if (err instanceof Error) {
      message = err.message;
    }
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
