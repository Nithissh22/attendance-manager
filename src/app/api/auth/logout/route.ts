import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { SESSION_OPTIONS } from '@/lib/session';
import type { SessionData } from '@/types';

export async function POST(_req: NextRequest) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, SESSION_OPTIONS);
  session.destroy();
  return NextResponse.json({ ok: true });
}
