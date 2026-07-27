import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { SESSION_OPTIONS, isSessionValid } from '@/lib/session';
import { scrapeMarks } from '@/lib/scraper';
import { getSessionCookies } from '@/lib/store';
import type { SessionData } from '@/types';

export async function GET(_req: NextRequest) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, SESSION_OPTIONS);

  if (!isSessionValid(session)) {
    return NextResponse.json({ error: 'Not authenticated or session expired' }, { status: 401 });
  }

  try {
    if (!session.sessionId) {
      throw new Error('Session ID is missing. Please log in again.');
    }
    const sessionCookies = getSessionCookies(session.sessionId);
    if (!sessionCookies) {
      throw new Error('Session data not found on server. Please log in again.');
    }
    const marks = await scrapeMarks(sessionCookies);
    return NextResponse.json({ marks });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch marks';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
