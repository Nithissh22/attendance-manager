'use client';
import type { TimetableSlot } from '@/types';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const PERIODS = [
  { label: 'P1', time: '08:00–08:50' },
  { label: 'P2', time: '09:00–09:50' },
  { label: 'P3', time: '10:00–10:50' },
  { label: 'P4', time: '11:00–11:50' },
  { label: 'P5', time: '12:00–12:50' },
  { label: 'P6', time: '13:00–13:50' },
  { label: 'P7', time: '14:00–14:50' },
  { label: 'P8', time: '15:00–15:50' },
];

const DAY_COLORS: Record<string, string> = {
  MON: 'border-indigo-500/30',
  TUE: 'border-violet-500/30',
  WED: 'border-teal-500/30',
  THU: 'border-cyan-500/30',
  FRI: 'border-purple-500/30',
  SAT: 'border-pink-500/30',
};

interface TimetableGridProps {
  slots: TimetableSlot[];
  view?: 'today' | 'week';
}

export default function TimetableGrid({ slots, view = 'week' }: TimetableGridProps) {
  const today = DAYS[new Date().getDay() - 1] ?? 'MON';
  const days = view === 'today' ? [today] : DAYS;

  const getSlot = (day: string, period: number) =>
    slots.find((s) => s.day === day && s.period === period);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="py-2 px-3 text-left text-white/30 text-xs font-medium w-24">Period</th>
            {days.map((day) => (
              <th
                key={day}
                className={`py-2 px-3 text-center text-xs font-semibold ${
                  day === today ? 'text-teal-400' : 'text-white/50'
                }`}
              >
                {day}
                {day === today && (
                  <span className="ml-1 text-[9px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded-full">
                    Today
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERIODS.map((period, pIdx) => (
            <tr key={pIdx} className="border-t border-white/[0.04]">
              <td className="py-2 px-3">
                <p className="text-xs font-mono text-white/50">{period.label}</p>
                <p className="text-[10px] text-white/20">{period.time}</p>
              </td>
              {days.map((day) => {
                const slot = getSlot(day, pIdx + 1);
                return (
                  <td key={day} className="py-1.5 px-2">
                    {slot ? (
                      <div
                        className={`rounded-lg border ${DAY_COLORS[day] ?? 'border-white/10'} bg-white/[0.03] p-2 h-full`}
                      >
                        <p className="text-xs font-semibold text-white/80 leading-snug line-clamp-2">
                          {slot.courseName || slot.courseCode}
                        </p>
                        {slot.roomNo && (
                          <p className="text-[10px] text-white/30 mt-0.5">{slot.roomNo}</p>
                        )}
                      </div>
                    ) : (
                      <div className="h-full min-h-[48px]" />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
