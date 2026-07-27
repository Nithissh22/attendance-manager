'use client';
import React from 'react';
import type { AttendanceRecord } from '@/types';

interface SubjectCardProps {
  subject: AttendanceRecord;
  index: number;
  onClick?: () => void;
}

export function SubjectCard({ subject, index, onClick }: SubjectCardProps) {
  // Deterministic slight rotation for the asymmetrical look
  const rotation = -2 + (index % 5);
  const percentage = Number(subject.percentage) || 0;
  const target = 75;
  const isSafe = percentage >= target;
  const isWatch = percentage >= 65 && percentage < target;

  let statusColor = 'var(--color-stamp-risk)';
  let statusText = 'AT RISK';
  let badgeClass = 'pulse-slow';
  
  if (isSafe) {
    statusColor = 'var(--color-stamp-safe)';
    statusText = 'SAFE';
    badgeClass = '';
  } else if (isWatch) {
    statusColor = 'var(--color-stamp-watch)';
    statusText = 'WATCH';
    badgeClass = '';
  }

  return (
    <button
      onClick={onClick}
      className="block relative group text-left flex-shrink-0 snap-center focus:outline-none"
      style={{ animationDelay: `${index * 80}ms`, width: '280px' }}
    >
      <div
        className="relative transition-transform duration-300 active:scale-95"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {/* Torn top edge / Folder Tab look */}
        <div
          className="absolute -top-3 left-4 right-12 h-4 z-20 pointer-events-none bg-card-surface border-t border-x border-black/10"
          style={{
            clipPath: 'polygon(0% 100%, 5% 0%, 95% 0%, 100% 100%)',
          }}
        />

        {/* Paperclip */}
        {index % 3 === 0 && (
          <div className="absolute -top-4 right-6 w-4 h-8 border-2 border-slate-400 rounded-full z-30 rotate-[20deg] pointer-events-none">
            <div className="absolute inset-x-0.5 top-1 bottom-0.5 border-2 border-slate-400 rounded-full" />
          </div>
        )}

        {/* Card body */}
        <div className="relative bg-card-surface text-text-parchment pt-6 pb-5 px-5 shadow-lg border border-black/5">
          {/* Status Badge */}
          <div className="absolute top-4 right-4 flex items-center justify-end">
            <div 
              className={`border-2 px-2 py-0.5 rounded-sm font-display text-[10px] font-bold uppercase tracking-widest ${badgeClass}`}
              style={{ borderColor: statusColor, color: statusColor }}
            >
              {statusText}
            </div>
          </div>

          {/* Course code */}
          <p className="font-mono text-[9px] uppercase tracking-widest opacity-60 mb-2 max-w-[70%] truncate">
            {subject.courseCode}
          </p>

          {/* Course name */}
          <h3 className="font-display text-lg font-bold uppercase leading-tight line-clamp-2 mb-6 min-h-[2.5rem]">
            {subject.courseName}
          </h3>

          {/* Stats */}
          <div className="flex items-end justify-between border-t border-text-parchment/10 pt-3">
            <div>
              <p className="font-sans text-[9px] uppercase tracking-wider opacity-60 font-semibold mb-0.5">Record</p>
              <p className="font-mono text-sm leading-none opacity-80">
                {subject.classesAttended ?? '—'}/{subject.classesHeld ?? '—'}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-3xl font-bold tracking-tighter leading-none" style={{ color: statusColor }}>
                {percentage.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
