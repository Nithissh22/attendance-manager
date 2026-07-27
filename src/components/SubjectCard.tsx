'use client';
import React from 'react';
import Link from 'next/link';
import type { AttendanceRecord } from '@/types';
import { computeBunkStats } from '@/lib/session';

interface SubjectCardProps {
  subject: AttendanceRecord;
  index: number;
}

export function SubjectCard({ subject, index }: SubjectCardProps) {
  // Deterministic rotation between -3..+2 deg so SSR and client agree
  const rotation = -3 + (index % 6);

  const percentage = Number(subject.percentage) || 0;
  const target = 75;
  const isSafe = percentage >= target;
  const isWatch = percentage >= 65 && percentage < target;

  let stampColor = '#8C1D18'; // at risk red
  let stampText = 'AT RISK';
  if (isSafe) {
    stampColor = '#3F4B3D';
    stampText = 'SAFE';
  } else if (isWatch) {
    stampColor = '#A17F2E';
    stampText = 'WATCH';
  }

  const stats = computeBunkStats(subject.classesHeld, subject.classesAttended, target);
  const req = stats.mustAttend;
  const slug = encodeURIComponent(subject.courseCode);

  return (
    <Link
      href={`/dashboard/${slug}`}
      className="block relative group"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Outer positioning context — needed so absolute children don't escape */}
      <div
        className="relative transition-transform duration-300 group-hover:-translate-y-2"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {/* Pushpin */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-7 h-7 z-30 drop-shadow-md pointer-events-none">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="8" r="6" fill="#8C1D18" stroke="#5a120f" strokeWidth="1" />
            <path d="M12 14L12 22" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="5" r="2" fill="#ef4444" opacity="0.6" />
          </svg>
        </div>

        {/* Torn top edge */}
        <div
          className="absolute -top-2 left-0 right-0 h-3 z-20 pointer-events-none"
          style={{
            background: '#E8DCC0',
            clipPath: 'polygon(0% 100%, 2% 20%, 5% 80%, 10% 10%, 15% 90%, 20% 30%, 25% 70%, 30% 10%, 35% 80%, 40% 20%, 45% 90%, 50% 10%, 55% 80%, 60% 20%, 65% 90%, 70% 30%, 75% 80%, 80% 10%, 85% 90%, 90% 20%, 95% 80%, 100% 10%, 100% 100%)',
          }}
        />

        {/* SVG filter definition for stamp distress */}
        <svg className="absolute w-0 h-0 overflow-hidden" aria-hidden>
          <defs>
            <filter id={`distress-${index}`}>
              <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise" />
              <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 3 -1" in="noise" result="coloredNoise" />
              <feComposite operator="in" in="SourceGraphic" in2="coloredNoise" />
            </filter>
          </defs>
        </svg>

        {/* Card body */}
        <div
          className="relative bg-card-surface text-text-parchment pt-7 pb-5 px-5 shadow-[0_6px_20px_rgba(0,0,0,0.55)] overflow-hidden"
          style={{ minHeight: '240px' }}
        >
          {/* Course code — typewriter label */}
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50 mb-1">
            {subject.courseCode}
          </p>

          {/* Course name */}
          <h3 className="font-display text-base font-bold uppercase leading-tight line-clamp-2 mb-4">
            {subject.courseName}
          </h3>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3 mt-auto">
            <div>
              <p className="font-sans text-[10px] uppercase tracking-wider opacity-50 font-semibold mb-0.5">Attendance</p>
              <p className="font-mono text-3xl font-bold tracking-tighter leading-none">
                {percentage.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="font-sans text-[10px] uppercase tracking-wider opacity-50 font-semibold mb-0.5">Classes</p>
              <p className="font-mono text-lg leading-none">
                {subject.classesAttended ?? '—'}
                <span className="opacity-40 text-sm"> / {subject.classesHeld ?? '—'}</span>
              </p>
            </div>
          </div>

          {/* At-risk margin note */}
          {!isSafe && req > 0 && (
            <p className="mt-3 font-sans text-[11px] leading-snug border-t border-text-parchment/10 pt-2" style={{ color: '#8C1D18' }}>
              * Attend {req} more to reach 75%
            </p>
          )}

          {/* Rubber stamp verdict */}
          <div
            className="absolute bottom-4 right-2 rotate-[-10deg] pointer-events-none"
            style={{
              filter: `url(#distress-${index})`,
            }}
          >
            <div
              className="border-4 px-3 py-0.5 rounded-sm"
              style={{ borderColor: stampColor, color: stampColor }}
            >
              <span className="font-display text-xl font-bold uppercase tracking-widest block">
                {stampText}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
