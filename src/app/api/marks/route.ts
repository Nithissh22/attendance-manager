import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { SESSION_OPTIONS, isSessionValid } from '@/lib/session';
import { scrapeMarks } from '@/lib/scraper';
import type { SessionData } from '@/types';

export async function GET(_req: NextRequest) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, SESSION_OPTIONS);

  if (!isSessionValid(session)) {
    return NextResponse.json({ error: 'Not authenticated or session expired' }, { status: 401 });
  }

  try {
    const marks = await scrapeMarks(session.cookies);
    return NextResponse.json({ marks });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch marks';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
