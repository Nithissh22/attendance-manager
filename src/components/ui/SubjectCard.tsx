'use client';
import Link from 'next/link';
import ProgressRing from './ProgressRing';
import BunkCalculator from './BunkCalculator';
import type { AttendanceRecord } from '@/types';

interface SubjectCardProps {
  record: AttendanceRecord;
  index: number;
}

const categoryColors: Record<string, string> = {
  Theory: 'bg-accent/10 text-accent border border-accent/20',
  Lab: 'bg-safe/10 text-safe border border-safe/20',
  Project: 'bg-white/5 text-white/50 border border-white/10',
};

export default function SubjectCard({ record, index }: SubjectCardProps) {
  const { courseCode, courseName, category, classesHeld, classesAttended, percentage } = record;
  const slug = encodeURIComponent(courseCode);

  const borderColor =
    percentage >= 75
      ? 'border-safe/20 hover:border-safe/40'
      : percentage >= 65
      ? 'border-watch/20 hover:border-watch/40'
      : 'border-danger/20 hover:border-danger/40';

  return (
    <Link
      href={`/dashboard/${slug}`}
      className={`block rounded-xl bg-surface border ${borderColor} p-5 transition-all duration-300 hover:bg-surface-hover hover:-translate-y-1 shadow-xl shadow-black/20 group relative overflow-hidden`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Subtle texture/noise effect using radial gradient */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--color-border)_0%,_transparent_100%)] pointer-events-none mix-blend-overlay" />
      
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4 relative z-10">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-mono text-white/40 mb-1 uppercase tracking-widest">{courseCode}</p>
          <h3 className="font-bold text-white/90 text-sm leading-snug line-clamp-2 font-sans tracking-wide uppercase">{courseName}</h3>
        </div>
        <ProgressRing percentage={percentage} size={72} strokeWidth={6} />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 mb-4 relative z-10">
        <div className="flex flex-col">
          <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">Attended</p>
          <p className="text-xl font-bold text-white/90 font-mono">{classesAttended ?? '-'}</p>
        </div>
        <div className="w-px h-8 bg-border/50" />
        <div className="flex flex-col">
          <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">Held</p>
          <p className="text-xl font-bold text-white/90 font-mono">{classesHeld ?? '-'}</p>
        </div>
        <div className="ml-auto">
          <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded-[4px] ${categoryColors[category] ?? 'bg-white/5 text-white/40 border-white/10'}`}>
            {category}
          </span>
        </div>
      </div>

      {/* Bunk calculator */}
      <div className="relative z-10">
        <BunkCalculator classesHeld={classesHeld} classesAttended={classesAttended} />
      </div>
    </Link>
  );
}
