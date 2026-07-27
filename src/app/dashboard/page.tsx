'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SubjectCard } from '@/components/SubjectCard';
import { SubjectDetailModal } from '@/components/SubjectDetailModal';
import Navbar from '@/components/ui/Navbar';
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
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<AttendanceRecord | null>(null);

  const fetchAttendance = async (forceRefresh = false) => {
    try {
      if (forceRefresh) setRefreshing(true);
      
      // In a real implementation, you might pass a ?refresh=true query param 
      // if the backend supports forcing a cache invalidation.
      const res = await fetch(`/api/attendance${forceRefresh ? '?refresh=true' : ''}`);
      
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
      setError(null);
    } catch {
      setError('Network error — could not fetch attendance data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [router]);

  const handleRefresh = () => {
    fetchAttendance(true);
  };

  const attendance = data?.attendance ?? [];
  const overall = data?.overallPercentage ?? 0;

  // Determine overall status color
  let statusColor = 'var(--color-stamp-safe)';
  if (overall < 65) statusColor = 'var(--color-stamp-risk)';
  else if (overall < 75) statusColor = 'var(--color-stamp-watch)';

  return (
    <div className="min-h-screen bg-board-bg text-text-board flex flex-col">
      <Navbar studentName={data?.studentName} />

      <main className="flex-1 flex flex-col max-w-lg mx-auto w-full px-4 sm:px-6 py-8 page-enter overflow-x-hidden">
        
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-card-surface/20 border-t-card-surface rounded-full animate-spin mb-6" />
            <p className="font-display text-xl font-bold uppercase tracking-widest text-card-surface animate-pulse">
              Reviewing the file...
            </p>
            {/* Fake progress bar */}
            <div className="w-48 h-1 bg-white/10 mt-4 overflow-hidden">
              <div className="h-full bg-card-surface animate-[progress_5s_ease-in-out_infinite]" style={{ width: '60%' }} />
            </div>
          </div>
        ) : error || attendance.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="w-20 h-20 mb-6 border-4 border-stamp-risk text-stamp-risk rounded-full flex items-center justify-center rotate-12 stamp-down">
              <span className="font-display font-bold text-3xl">X</span>
            </div>
            <h2 className="font-display text-2xl font-bold uppercase tracking-widest text-stamp-risk mb-2">
              Case Gone Cold
            </h2>
            <p className="font-sans text-sm opacity-60 mb-8 max-w-xs leading-relaxed">
              {error || 'No records found in the archive. Your session may have expired.'}
            </p>
            <button 
              onClick={() => router.push('/login')}
              className="bg-card-surface text-text-parchment font-display font-bold uppercase tracking-widest px-8 py-3 shadow-lg active:scale-95 transition-transform"
            >
              Reconnect Session
            </button>
          </div>
        ) : (
          <>
            {/* ── Hero Overall Percentage ── */}
            <div className="flex flex-col items-center text-center mb-10 stamp-down relative">
              {/* Classified Stamp decoration */}
              <div className="absolute top-0 right-4 md:-right-8 opacity-10 -rotate-12 pointer-events-none">
                <div className="border-4 border-current p-2 font-display text-2xl font-bold uppercase tracking-widest" style={{ color: statusColor }}>
                  CLASSIFIED
                </div>
              </div>

              <p className="font-sans text-[10px] uppercase tracking-widest opacity-50 font-bold mb-2">Overall Verdict</p>
              <h1 
                className="font-mono text-8xl font-bold tracking-tighter leading-none mb-4"
                style={{ color: statusColor, textShadow: `0 0 40px ${statusColor}40` }}
              >
                {overall.toFixed(1)}%
              </h1>
              <div className="flex gap-6 font-sans text-[10px] uppercase tracking-widest font-bold">
                <span className="opacity-60">
                  <span className="text-white opacity-100">{attendance.filter(r => (Number(r.percentage)||0) >= 75).length}</span> Safe
                </span>
                <span className="opacity-60">
                  <span className="text-white opacity-100">{attendance.filter(r => { const p = Number(r.percentage)||0; return p >= 65 && p < 75; }).length}</span> Watch
                </span>
                <span className="opacity-60">
                  <span className="text-white opacity-100">{attendance.filter(r => (Number(r.percentage)||0) < 65).length}</span> Risk
                </span>
              </div>
            </div>

            {/* ── Subject Carousel ── */}
            <div className="mb-auto">
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="font-display text-sm font-bold uppercase tracking-widest opacity-80">
                  Subject Dossiers
                </h2>
                <span className="font-sans text-[9px] uppercase tracking-widest opacity-40">
                  Swipe →
                </span>
              </div>
              
              {/* Horizontal Scroll Container */}
              <div className="flex overflow-x-auto gap-6 pb-8 pt-4 px-2 snap-x snap-mandatory hide-scrollbar -mx-4 sm:mx-0 sm:px-0">
                {/* Spacer for first item padding */}
                <div className="w-2 shrink-0 sm:hidden" />
                
                {attendance.map((subject, idx) => (
                  <SubjectCard 
                    key={subject.courseCode} 
                    subject={subject} 
                    index={idx}
                    onClick={() => setSelectedSubject(subject)}
                  />
                ))}
                
                {/* Spacer for last item padding */}
                <div className="w-2 shrink-0 sm:hidden" />
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between px-2 pb-6">
              <div className="flex flex-col">
                <span className="font-sans text-[9px] uppercase tracking-widest opacity-40 font-bold mb-1">
                  Last Synced
                </span>
                <span className="font-mono text-xs opacity-70">
                  {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </span>
              </div>
              
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 active:bg-white/20 px-4 py-2 rounded-sm transition-colors disabled:opacity-50"
              >
                <svg 
                  className={`w-3.5 h-3.5 opacity-60 ${refreshing ? 'animate-spin' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="font-display text-[10px] uppercase tracking-widest font-bold">
                  {refreshing ? 'Syncing...' : 'Refresh'}
                </span>
              </button>
            </div>
          </>
        )}
      </main>

      {/* Detail Modal */}
      <SubjectDetailModal 
        subject={selectedSubject} 
        onClose={() => setSelectedSubject(null)} 
      />
    </div>
  );
}
