'use client';
import { useMemo } from 'react';
import { computeBunkStats } from '@/lib/session';

interface BunkCalculatorProps {
  classesHeld: number | null | undefined;
  classesAttended: number | null | undefined;
  courseName?: string;
}

export default function BunkCalculator({ classesHeld, classesAttended, courseName }: BunkCalculatorProps) {
  const stats = useMemo(
    () => computeBunkStats(classesHeld, classesAttended),
    [classesHeld, classesAttended]
  );

  if (stats.missingData) {
    return (
      <div className="bg-surface-hover border border-border p-3" style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}>
        <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold mb-1 font-sans">Details Unavailable</p>
        <p className="text-xl font-bold text-white/40 font-display tracking-wide">
          NO DATA
        </p>
        <p className="text-[11px] text-white/30 mt-1 font-sans">Cannot calculate safe bunks</p>
      </div>
    );
  }

  if (stats.isSafe) {
    return (
      <div className="bg-safe/10 border border-safe/30 p-3" style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}>
        <p className="text-[11px] text-safe/70 uppercase tracking-wider font-semibold mb-1 font-sans">Can Bunk</p>
        <p className="text-2xl font-bold text-safe font-display tracking-wide">
          {stats.canBunk}
          <span className="text-sm font-normal text-safe/70 ml-1 font-sans">more {stats.canBunk === 1 ? 'class' : 'classes'}</span>
        </p>
        <p className="text-[11px] text-white/30 mt-1 font-sans">while staying above 75%</p>
      </div>
    );
  }

  return (
    <div className="bg-danger/10 border border-danger/40 p-3" style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}>
      <p className="text-[11px] text-danger/80 uppercase tracking-wider font-bold mb-1 font-sans">Must Attend</p>
      <p className="text-2xl font-bold text-danger font-display tracking-wide" style={{ filter: 'drop-shadow(0 0 4px rgba(230, 57, 80, 0.4))' }}>
        {stats.mustAttend}
        <span className="text-sm font-normal text-danger/70 ml-1 font-sans">more {stats.mustAttend === 1 ? 'class' : 'classes'}</span>
      </p>
      <p className="text-[11px] text-white/40 mt-1 font-sans">to reach 75% minimum</p>
    </div>
  );
}
