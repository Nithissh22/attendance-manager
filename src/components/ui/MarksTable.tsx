'use client';
import type { MarkRecord } from '@/types';

interface MarksTableProps {
  marks: MarkRecord[];
}

function Cell({ value, max }: { value: number | null; max?: number }) {
  if (value === null) return <span className="text-white/20">—</span>;
  const pct = max ? (value / max) * 100 : null;
  const color = pct !== null ? (pct >= 75 ? 'text-teal-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400') : 'text-white/70';
  return <span className={`font-mono font-semibold ${color}`}>{value}</span>;
}

export default function MarksTable({ marks }: MarksTableProps) {
  if (marks.length === 0) {
    return <p className="text-white/30 text-sm text-center py-8">No marks data available yet.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {['Course', 'CAT 1', 'CAT 2', 'Assignment', 'Total'].map((h) => (
              <th key={h} className="py-3 px-4 text-left text-xs text-white/30 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {marks.map((m, i) => (
            <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
              <td className="py-3 px-4">
                <p className="font-medium text-white/80 text-sm">{m.courseName}</p>
                <p className="text-[11px] text-white/30 font-mono">{m.courseCode}</p>
              </td>
              <td className="py-3 px-4"><Cell value={m.cat1} max={25} /></td>
              <td className="py-3 px-4"><Cell value={m.cat2} max={25} /></td>
              <td className="py-3 px-4"><Cell value={m.assignment} max={10} /></td>
              <td className="py-3 px-4"><Cell value={m.total} max={m.maxTotal} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
