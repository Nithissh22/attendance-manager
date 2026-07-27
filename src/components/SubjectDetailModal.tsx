'use client';
import React, { useState, useEffect } from 'react';
import type { AttendanceRecord } from '@/types';
import { computeBunkStats } from '@/lib/session';

interface SubjectDetailModalProps {
  subject: AttendanceRecord | null;
  onClose: () => void;
}

export function SubjectDetailModal({ subject, onClose }: SubjectDetailModalProps) {
  const [projectedClasses, setProjectedClasses] = useState(0);

  // Reset slider when subject changes
  useEffect(() => {
    setProjectedClasses(0);
  }, [subject]);

  if (!subject) return null;

  const target = 75;
  const currentPercentage = Number(subject.percentage) || 0;
  
  // Real stats
  const held = subject.classesHeld ?? 0;
  const attended = subject.classesAttended ?? 0;
  
  // Projected stats
  const projHeld = held + Math.abs(projectedClasses);
  // If positive, we attend them. If negative, we bunk them.
  const projAttended = attended + (projectedClasses > 0 ? projectedClasses : 0);
  const projPercentage = projHeld === 0 ? 0 : (projAttended / projHeld) * 100;

  const stats = computeBunkStats(held, attended, target);
  
  let statusColor = 'var(--color-stamp-safe)';
  if (projPercentage < 65) statusColor = 'var(--color-stamp-risk)';
  else if (projPercentage < target) statusColor = 'var(--color-stamp-watch)';

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Bottom Sheet Modal */}
      <div className="fixed inset-x-0 bottom-0 z-50 transform transition-transform duration-300 translate-y-0 sm:max-w-md sm:mx-auto">
        <div className="bg-card-surface text-text-parchment rounded-t-xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] overflow-hidden border-t-4 border-board-bg">
          
          {/* Header */}
          <div className="p-6 border-b border-black/10 relative">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors"
            >
              <svg className="w-4 h-4 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <p className="font-mono text-[10px] uppercase tracking-widest opacity-60 mb-1">
              {subject.courseCode}
            </p>
            <h2 className="font-display text-xl font-bold uppercase leading-tight pr-8">
              {subject.courseName}
            </h2>
            <div className="flex gap-4 mt-3">
              <span className="font-sans text-[10px] uppercase tracking-wider opacity-60 font-semibold">
                Faculty: <span className="font-mono font-normal opacity-100 text-black">{subject.faculty || 'Unknown'}</span>
              </span>
              <span className="font-sans text-[10px] uppercase tracking-wider opacity-60 font-semibold">
                Slot: <span className="font-mono font-normal opacity-100 text-black">{subject.slot || '—'}</span>
              </span>
            </div>
          </div>

          {/* Bunk Calculator */}
          <div className="p-6 bg-black/5">
            <div className="flex justify-between items-end mb-6">
              <div>
                <p className="font-sans text-[10px] uppercase tracking-widest opacity-50 font-semibold mb-1">Projected Status</p>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-4xl font-bold tracking-tighter" style={{ color: statusColor }}>
                    {projPercentage.toFixed(1)}%
                  </span>
                  <span className="font-mono text-xs opacity-50">
                    ({projAttended}/{projHeld})
                  </span>
                </div>
              </div>
              <div className="text-right pb-1">
                {currentPercentage >= target ? (
                  <span className="font-sans text-[10px] uppercase tracking-wider text-green-700 font-bold bg-green-700/10 px-2 py-1 rounded border border-green-700/20">
                    Safe to bunk {stats.canBunk}
                  </span>
                ) : (
                  <span className="font-sans text-[10px] uppercase tracking-wider text-red-700 font-bold bg-red-700/10 px-2 py-1 rounded border border-red-700/20">
                    Must attend {stats.mustAttend}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <label className="font-sans text-[11px] uppercase tracking-wider opacity-80 font-bold flex justify-between">
                <span>Projection Simulator</span>
                <span className="font-mono bg-board-bg text-text-board px-2 py-0.5 rounded-sm text-[10px]">
                  {projectedClasses > 0 ? `Attending next ${projectedClasses}` : projectedClasses < 0 ? `Bunking next ${Math.abs(projectedClasses)}` : 'Current State'}
                </span>
              </label>
              <input 
                type="range" 
                min="-10" 
                max="10" 
                step="1"
                value={projectedClasses}
                onChange={(e) => setProjectedClasses(Number(e.target.value))}
                className="w-full h-1 bg-black/20 rounded-lg appearance-none cursor-pointer"
                style={{ accentColor: '#12100D' }}
              />
              <div className="flex justify-between font-mono text-[9px] opacity-40 uppercase">
                <span>Bunk 10</span>
                <span>Current</span>
                <span>Attend 10</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
