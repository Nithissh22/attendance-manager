'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import TimetableGrid from '@/components/ui/TimetableGrid';
import { CardSkeleton } from '@/components/ui/LoadingSpinner';
import type { TimetableSlot } from '@/types';

export default function TimetablePage() {
  const router = useRouter();
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'today' | 'week'>('today');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/timetable');
        if (res.status === 401) { router.push('/login'); return; }
        if (!res.ok) { const e = await res.json(); setError(e.error ?? 'Failed to load timetable'); return; }
        const data = await res.json();
        setSlots(data.slots ?? []);
      } catch { setError('Network error'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [router]);

  const dayNames: Record<string, string> = { MON: 'Monday', TUE: 'Tuesday', WED: 'Wednesday', THU: 'Thursday', FRI: 'Friday', SAT: 'Saturday' };
  const todayKey = ['SUN','MON','TUE','WED','THU','FRI','SAT'][new Date().getDay()];
  const todaySlots = slots.filter(s => s.day === todayKey);

  return (
    <div className="min-h-screen"><Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 page-enter">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white/90">Timetable</h1>
            <p className="text-sm text-white/30 mt-0.5">{dayNames[todayKey] ?? ''}, {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</p>
          </div>
          <div className="flex bg-white/[0.04] rounded-xl p-1 gap-1">
            {(['today','week'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${view === v ? 'bg-white/[0.08] text-white' : 'text-white/40 hover:text-white/70'}`}>
                {v === 'today' ? 'Today' : 'Full Week'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({length:4}).map((_,i)=><CardSkeleton key={i} />)}</div>
        ) : error ? (
          <div className="glass rounded-2xl p-8 text-center"><p className="text-red-400">{error}</p></div>
        ) : slots.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-4xl mb-4">📅</p>
            <p className="text-white/40">No timetable data found.</p>
            <p className="text-white/20 text-sm mt-1">The SRM portal may not have timetable data available yet.</p>
          </div>
        ) : view === 'today' ? (
          <div className="space-y-3">
            {todaySlots.length === 0 ? (
              <div className="glass rounded-2xl p-10 text-center"><p className="text-white/30 text-sm">No classes today — enjoy your day! 🎉</p></div>
            ) : todaySlots.sort((a,b)=>a.period-b.period).map((slot,i) => (
              <div key={i} className="glass rounded-xl p-4 flex items-center gap-4">
                <div className="text-center shrink-0 w-14">
                  <p className="text-xs font-mono text-white/30">{slot.startTime}</p>
                  <p className="text-xs text-white/15">—</p>
                  <p className="text-xs font-mono text-white/30">{slot.endTime}</p>
                </div>
                <div className="w-px h-10 bg-teal-500/30" />
                <div>
                  <p className="font-semibold text-white/80 text-sm">{slot.courseName || slot.courseCode}</p>
                  <p className="text-xs text-white/30 mt-0.5">{[slot.roomNo, slot.facultyName].filter(Boolean).join(' · ')}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass rounded-2xl p-6 overflow-hidden">
            <TimetableGrid slots={slots} view="week" />
          </div>
        )}
      </main>
    </div>
  );
}
