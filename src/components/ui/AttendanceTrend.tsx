'use client';
import type { AttendanceRecord } from '@/types';

interface AttendanceTrendProps {
  records: AttendanceRecord[];
}

export default function AttendanceTrend({ records }: AttendanceTrendProps) {
  const sorted = [...records].sort((a, b) => a.percentage - b.percentage);

  return (
    <div className="space-y-3">
      {sorted.map((r, i) => {
        const color =
          r.percentage >= 75
            ? { bar: 'bg-teal-400', text: 'text-teal-400' }
            : r.percentage >= 65
            ? { bar: 'bg-amber-400', text: 'text-amber-400' }
            : { bar: 'bg-red-400', text: 'text-red-400' };

        return (
          <div key={r.courseCode} className="flex items-center gap-3 group">
            <div className="w-32 shrink-0">
              <p className="text-xs text-white/50 truncate" title={r.courseName}>
                {r.courseName}
              </p>
              <p className="text-[10px] text-white/20 font-mono">{r.courseCode}</p>
            </div>
            <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${color.bar} transition-all duration-1000`}
                style={{ width: `${Math.min(r.percentage, 100)}%`, transitionDelay: `${i * 80}ms` }}
              />
            </div>
            <span className={`text-xs font-bold font-mono w-12 text-right ${color.text}`}>
              {r.percentage.toFixed(1)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
