import { SessionOptions } from 'iron-session';
import type { SessionData } from '@/types';

// Validate session secret at module load time
const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET || SESSION_SECRET.length < 32) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('[AttendX] SESSION_SECRET must be at least 32 characters. Set it in your .env file.');
  }
}

export const SESSION_OPTIONS: SessionOptions = {
  password: SESSION_SECRET || 'fallback-dev-secret-replace-in-production-32chars',
  cookieName: 'attendx_session',
  ttl: 20 * 60, // 20 minutes in seconds
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
  },
};

/** Check if a session is still valid (within 20-min TTL) */
export function isSessionValid(session: SessionData): boolean {
  if (!session.isLoggedIn || !session.loginTime) return false;
  const elapsed = Date.now() - session.loginTime;
  return elapsed < 20 * 60 * 1000; // 20 minutes
}

/** 
 * Recompute "Safe / Watch / At Risk" counts from the freshly parsed per-subject percentages 
 * Thresholds: <65% At Risk, 65-75% Watch, >75% Safe
 */
export function getAttendanceStatus(percentage: number): 'Safe' | 'Watch' | 'Risk' {
  if (percentage >= 75) return 'Safe';
  if (percentage >= 65) return 'Watch';
  return 'Risk';
}

/** Compute bunk stats for a given attendance record */
export function computeBunkStats(
  classesHeld: number | null | undefined,
  classesAttended: number | null | undefined,
  target = 75
): { canBunk: number; mustAttend: number; isSafe: boolean; missingData?: boolean } {
  const held = classesHeld ?? 0;
  const attended = classesAttended ?? 0;

  if (held === 0) {
    return { canBunk: 0, mustAttend: 0, isSafe: true, missingData: true };
  }

  const current = (attended / held) * 100;
  const isSafe = current >= target;
  
  if (isSafe) {
    // Floor of (attended - target%*held) / target% gives how many can be missed
    const canBunk = Math.floor(
      (attended - (target / 100) * held) / (target / 100)
    );
    return { canBunk: Math.max(0, canBunk), mustAttend: 0, isSafe: true };
  } else {
    // Standard formula: classes needed = ceil((target% * held - attended) / (1 - target%))
    const mustAttend = Math.ceil(
      ((target / 100) * held - attended) / (1 - target / 100)
    );
    return { canBunk: 0, mustAttend: Math.max(0, mustAttend), isSafe: false };
  }
}
