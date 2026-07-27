'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import ProgressRing from '@/components/ui/ProgressRing';
import BunkCalculator from '@/components/ui/BunkCalculator';
import type { AttendanceRecord } from '@/types';

export default function SubjectPage() {
  const router = useRouter();
  const { subject } = useParams<{ subject: string }>();
  const courseCode = decodeURIComponent(subject);
  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch('/api/attendance');
        if (res.status === 401) { router.push('/login'); return; }
        if (!res.ok) { setError('Failed to load data'); return; }
        const data = await res.json();
        const found = data.attendance?.find((r: AttendanceRecord) => r.courseCode === courseCode);
        if (!found) { setError(`Course '${courseCode}' not found`); return; }
        setRecord(found);
      } catch { setError('Network error'); }
      finally { setLoading(false); }
    };
    fetch_();
  }, [courseCode, router]);

  if (loading) return (
    <div className="min-h-screen"><Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="glass rounded-2xl p-8 animate-pulse flex flex-col items-center gap-6">
          <div className="w-32 h-32 rounded-full bg-white/[0.06]" />
          <div className="space-y-3 w-full"><div className="h-4 bg-white/[0.06] rounded-full" /><div className="h-3 bg-white/[0.04] rounded-full w-2/3 mx-auto" /></div>
        </div>
      </main>
    </div>
  );

  if (error || !record) return (
    <div className="min-h-screen"><Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-red-400 mb-4">{error ?? 'Course not found'}</p>
          <Link href="/dashboard" className="text-teal-400 text-sm hover:underline">← Back to Dashboard</Link>
        </div>
      </main>
    </div>
  );

  const { courseName, category, classesHeld, classesAttended, percentage } = record;
  const color = percentage >= 75 ? 'text-teal-400' : percentage >= 65 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="min-h-screen"><Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 page-enter">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors mb-6">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Dashboard
        </Link>

        {/* Header card */}
        <div className="glass rounded-2xl p-8 mb-5">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <ProgressRing percentage={percentage} size={140} strokeWidth={12} />
            <div className="text-center sm:text-left">
              <p className="text-xs font-mono text-white/30 mb-1">{courseCode}</p>
              <h1 className="text-xl font-bold text-white/90 mb-2">{courseName}</h1>
              <span className="text-xs px-2 py-1 rounded-full bg-white/[0.06] text-white/40">{category}</span>
              <div className="flex gap-6 mt-5">
                <div><p className="text-3xl font-bold font-mono" style={{color: percentage >= 75 ? '#2dd4bf' : percentage >= 65 ? '#f59e0b' : '#f87171'}}>{classesAttended}</p><p className="text-xs text-white/30">Attended</p></div>
                <div><p className="text-3xl font-bold font-mono text-white/50">/</p></div>
                <div><p className="text-3xl font-bold font-mono text-white/50">{classesHeld}</p><p className="text-xs text-white/30">Held</p></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bunk calculator */}
        <div className="glass rounded-2xl p-6 mb-5">
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">Bunk Calculator</h2>
          <BunkCalculator classesHeld={classesHeld} classesAttended={classesAttended} courseName={courseName} />
          <div className="mt-4 pt-4 border-t border-white/[0.06] text-xs text-white/25 leading-relaxed">
            Minimum requirement at SRMIST is 75% attendance per subject. Missing below this threshold may lead to not being allowed to appear in exams.
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Attended', value: (classesAttended ?? 0).toString(), color: 'text-teal-400' },
            { label: 'Held', value: (classesHeld ?? 0).toString(), color: 'text-white/60' },
            { label: 'Missed', value: ((classesHeld ?? 0) - (classesAttended ?? 0)).toString(), color: (classesHeld ?? 0) - (classesAttended ?? 0) > 0 ? 'text-red-400' : 'text-white/40' }
          ].map((s) => (
            <div key={s.label} className="glass rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>
              <p className="text-xs text-white/25 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
