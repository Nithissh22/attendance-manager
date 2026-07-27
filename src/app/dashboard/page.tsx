'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SubjectCard } from '@/components/SubjectCard';
import AttendanceTrend from '@/components/ui/AttendanceTrend';
import Navbar from '@/components/ui/Navbar';
import { CardSkeleton } from '@/components/ui/LoadingSpinner';
import type { AttendanceRecord } from '@/types';

interface DashboardData {
  attendance: AttendanceRecord[];
  overallPercentage: number;
  studentName: string;
  lastUpdated: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'trend'>('grid');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/attendance');
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        if (!res.ok) {
          const err = await res.json();
          setError(err.error ?? 'Failed to load attendance data');
          return;
        }
        const json: DashboardData = await res.json();
        setData(json);
      } catch {
        setError('Network error — could not fetch attendance data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const attendance = data?.attendance ?? [];
  // percentage is a number on AttendanceRecord, no parseFloat needed
  const atRisk  = attendance.filter((r) => Number(r.percentage) < 65).length;
  const warning = attendance.filter((r) => Number(r.percentage) >= 65 && Number(r.percentage) < 75).length;
  const safe    = attendance.length - atRisk - warning;

  return (
    <div className="min-h-screen bg-board-bg text-text-board">
      <Navbar studentName={data?.studentName} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 page-enter">

        {/* ── Case Summary Folder ── */}
        <div className="relative w-full max-w-lg mx-auto mb-12 md:mx-0 md:max-w-sm">
          {/* Folder Tab */}
          <div className="absolute -top-7 left-0 bg-card-surface text-text-parchment px-6 py-1.5 rounded-t-sm shadow-md z-10">
            <span className="font-display font-bold uppercase tracking-widest text-xs">Case Summary</span>
          </div>

          {/* Paperclip */}
          <div className="absolute -top-5 right-8 w-5 h-10 border-2 border-slate-400 rounded-full z-20 rotate-[15deg]">
            <div className="absolute inset-x-1 top-1.5 bottom-0.5 border-2 border-slate-400 rounded-full" />
          </div>

          {/* Folder body */}
          <div className="bg-card-surface text-text-parchment p-6 shadow-2xl relative z-0">
            <h1 className="font-display text-2xl font-bold uppercase tracking-tight mb-0.5">
              {loading ? '...' : (data?.studentName?.split(' ')[0] ?? 'Student')}
            </h1>
            <p className="font-sans text-[10px] uppercase tracking-widest opacity-50 font-semibold mb-6">
              {data?.lastUpdated
                ? `Case synced ${new Date(data.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Awaiting sync...'}
            </p>

            {loading ? (
              <div className="h-36 animate-pulse bg-text-parchment/10 rounded-sm" />
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="font-sans text-[10px] uppercase tracking-widest opacity-50 font-semibold mb-0.5">Overall Verdict</p>
                  <p className="font-mono text-5xl font-bold tracking-tighter">
                    {(data?.overallPercentage ?? 0).toFixed(1)}%
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-text-parchment/10 pt-4">
                  <div>
                    <p className="font-sans text-[10px] uppercase tracking-widest opacity-50 font-semibold mb-0.5">Total Subjects</p>
                    <p className="font-mono text-xl font-bold">{attendance.length}</p>
                  </div>
                  <div>
                    <p className="font-sans text-[10px] uppercase tracking-widest opacity-50 font-semibold mb-0.5">Status</p>
                    {atRisk > 0 ? (
                      <p className="font-display font-bold text-base uppercase" style={{ color: '#8C1D18' }}>At Risk ({atRisk})</p>
                    ) : warning > 0 ? (
                      <p className="font-display font-bold text-base uppercase" style={{ color: '#A17F2E' }}>Watch ({warning})</p>
                    ) : (
                      <p className="font-display font-bold text-base uppercase" style={{ color: '#3F4B3D' }}>Safe</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between border-t border-text-parchment/10 pt-4 font-mono text-sm">
                  <div className="flex flex-col" style={{ color: '#3F4B3D' }}>
                    <span className="text-[10px] opacity-70 uppercase font-sans tracking-wider">Safe</span>
                    <span className="text-xl font-bold">{safe}</span>
                  </div>
                  <div className="flex flex-col" style={{ color: '#A17F2E' }}>
                    <span className="text-[10px] opacity-70 uppercase font-sans tracking-wider">Watch</span>
                    <span className="text-xl font-bold">{warning}</span>
                  </div>
                  <div className="flex flex-col" style={{ color: '#8C1D18' }}>
                    <span className="text-[10px] opacity-70 uppercase font-sans tracking-wider">At Risk</span>
                    <span className="text-xl font-bold">{atRisk}</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 border-2 border-stamp-risk text-stamp-risk p-3 font-mono text-xs uppercase font-bold text-center">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* ── View tabs ── */}
        {!loading && data && (
          <div className="flex gap-2 mb-0 ml-1">
            <button
              onClick={() => setView('grid')}
              className={`px-5 py-2 rounded-t-sm font-display tracking-widest text-xs uppercase transition-all ${
                view === 'grid'
                  ? 'bg-card-surface text-text-parchment shadow-md relative z-10'
                  : 'bg-card-surface/30 text-text-board/50 hover:bg-card-surface/50 hover:text-text-board'
              }`}
            >
              Case Files
            </button>
            <button
              onClick={() => setView('trend')}
              className={`px-5 py-2 rounded-t-sm font-display tracking-widest text-xs uppercase transition-all ${
                view === 'trend'
                  ? 'bg-card-surface text-text-parchment shadow-md relative z-10'
                  : 'bg-card-surface/30 text-text-board/50 hover:bg-card-surface/50 hover:text-text-board'
              }`}
            >
              Trend Analysis
            </button>
          </div>
        )}

        {/* ── Content area ── */}
        <div className="relative w-full">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 pt-10">
              {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : view === 'grid' ? (
            attendance.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="font-display text-2xl font-bold uppercase tracking-widest opacity-40 mb-2">No Records Found</p>
                <p className="font-sans text-sm opacity-30">Academia returned 0 subjects. Try logging out and back in.</p>
              </div>
            ) : (
              /* 
                The corkboard grid. Extra top padding so pushpins (position:absolute, -top-4)
                don't clip at the container boundary.
              */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 pt-10 stagger">
                {attendance.map((r, i) => (
                  <SubjectCard key={r.courseCode} subject={r} index={i} />
                ))}
              </div>
            )
          ) : (
            <div className="bg-card-surface text-text-parchment p-8 shadow-xl min-h-[400px] relative">
              <div
                className="absolute top-4 right-4 w-14 h-14 rounded-full border-4 flex items-center justify-center opacity-20 -rotate-12 pointer-events-none"
                style={{ borderColor: '#8C1D18', color: '#8C1D18' }}
              >
                <span className="font-display font-bold text-[9px] uppercase text-center leading-tight">CONF</span>
              </div>
              <h2 className="font-display text-xl font-bold uppercase tracking-widest mb-8 border-b-2 border-text-parchment/20 pb-2 inline-block">
                Attendance Deficit Report
              </h2>
              <AttendanceTrend records={attendance} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
