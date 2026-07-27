'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [cookieString, setCookieString] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!cookieString.trim()) {
      setError('Please paste your cookie string.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookieString: cookieString.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Login failed. Please check your credentials.');
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Network error — please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 page-enter">
      {/* Background grid */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="w-16 h-16 rounded-[4px] bg-accent flex items-center justify-center text-black text-3xl font-display font-bold shadow-[0_0_20px_rgba(255,213,0,0.5)] mb-4" style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}>
            A
          </div>
          <h1 className="text-3xl font-bold tracking-widest uppercase font-display">
            Attend<span className="text-accent">X</span>
          </h1>
          <p className="text-white/30 text-[11px] mt-2 uppercase tracking-widest font-semibold">SRM Academia Link</p>
        </div>

        {/* Card */}
        <div className="bg-surface rounded-none border border-border p-6 shadow-2xl relative z-10" style={{ clipPath: 'polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)' }}>
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--color-border)_0%,_transparent_100%)] pointer-events-none mix-blend-overlay" />
          
          {/* Instructions */}
          <div className="mb-6 bg-white/5 border border-white/10 p-4" style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}>
            <p className="text-[11px] text-white/80 leading-relaxed font-sans mb-2">
              <span className="font-bold text-accent uppercase tracking-wider block mb-1">How to connect:</span>
              1. Log into academia.srmist.edu.in normally in Chrome.<br/>
              2. Open DevTools (F12) → Application tab → Cookies.<br/>
              3. Select academia.srmist.edu.in, then copy all cookie name=value pairs as a single semicolon-separated string and paste below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10" autoComplete="off">
            {/* Cookie String */}
            <div>
              <label htmlFor="cookieString" className="block text-[10px] font-bold text-accent mb-2 uppercase tracking-widest">
                Session Cookie String
              </label>
              <textarea
                id="cookieString"
                value={cookieString}
                onChange={(e) => setCookieString(e.target.value)}
                placeholder="JSESSIONID=...; _zcsr_tmp=...; iamcsr=..."
                className="w-full px-4 py-3 bg-surface-hover border border-border text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all font-mono h-32 resize-none"
                style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
                autoFocus
                spellCheck={false}
                disabled={loading}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-danger/10 border border-danger p-3 text-danger text-xs font-bold uppercase tracking-wider" style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-accent text-black font-display text-lg tracking-widest uppercase hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(255,213,0,0.3)] flex items-center justify-center gap-3 mt-2"
              style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
            >
              {loading ? (
                <><LoadingSpinner size={18} /> INITIALIZING UPLINK…</>
              ) : (
                'CONNECT SESSION'
              )}
            </button>
          </form>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-white/20 mt-6 px-4 leading-relaxed">
          AttendX is an unofficial personal tool and is not affiliated with SRMIST.
          Your data is fetched live from SRM Academia and is never stored on any server.
        </p>
      </div>
    </div>
  );
}
