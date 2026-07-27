import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { SESSION_OPTIONS, isSessionValid } from '@/lib/session';
import { scrapeAttendance } from '@/lib/scraper';
import { getSessionCookies } from '@/lib/store';
import type { SessionData } from '@/types';

export async function GET(_req: NextRequest) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, SESSION_OPTIONS);

  if (!isSessionValid(session)) {
    return NextResponse.json({ error: 'Not authenticated or session expired' }, { status: 401 });
  }

  try {
    let attendance = session.attendanceCache;
    const now = Date.now();
    const cacheAge = session.attendanceCacheTime ? now - session.attendanceCacheTime : Infinity;

    if (!attendance || cacheAge > 15 * 60 * 1000) { // 15 minutes cache
      if (!session.sessionId) {
        throw new Error('Session ID is missing. Please log in again.');
      }
      const sessionCookies = getSessionCookies(session.sessionId);
      if (!sessionCookies) {
        throw new Error('Session data not found on server. Please log in again.');
      }
      
      const result = await scrapeAttendance(sessionCookies);
      attendance = result.records;
      
      let sessionUpdated = false;

      if (attendance && attendance.length < 20) {
        session.attendanceCache = attendance;
        session.attendanceCacheTime = now;
        sessionUpdated = true;
      }

      if (result.studentName && result.studentName !== session.studentName) {
        session.studentName = result.studentName;
        sessionUpdated = true;
      }

      if (sessionUpdated) {
        await session.save();
      }
    }

    const overall =
      attendance && attendance.length > 0
        ? Math.round(
            (attendance.reduce((s, r) => s + (r.classesAttended ?? 0), 0) /
              Math.max(1, attendance.reduce((s, r) => s + (r.classesHeld ?? 0), 0))) *
              100 *
              10
          ) / 10
        : 0;

    return NextResponse.json({
      attendance,
      overallPercentage: overall,
      studentName: session.studentName,
      lastUpdated: new Date(session.attendanceCacheTime || now).toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch attendance';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
