'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [netId, setNetId] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!netId.trim() || !password) {
      setError('Please enter both your NetID and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ netId: netId.trim(), password }),
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
      setPassword('');
      if (passwordRef.current) passwordRef.current.value = '';
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
          
          {/* Disclaimer */}
          <div className="mb-6 bg-white/5 border border-white/10 p-4" style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}>
            <p className="text-[11px] text-white/50 leading-relaxed font-sans">
              <span className="font-bold text-white/80 uppercase tracking-wider">🔒 Secure Link:</span>{' '}
              Credentials authenticate against SRM Academia directly and are{' '}
              <span className="font-bold text-accent">NEVER STORED</span>. Ephemeral session expires in 20m.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10" autoComplete="off">
            {/* NetID */}
            <div>
              <label htmlFor="netId" className="block text-[10px] font-bold text-accent mb-2 uppercase tracking-widest">
                NetID / Registration Number
              </label>
              <input
                id="netId"
                type="text"
                value={netId}
                onChange={(e) => setNetId(e.target.value)}
                placeholder="ns2400@srmist.edu.in"
                className="w-full px-4 py-3 bg-surface-hover border border-border text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all tracking-wider font-mono"
                style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
                autoFocus
                spellCheck={false}
                autoCapitalize="none"
                autoCorrect="off"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-[10px] font-bold text-accent mb-2 uppercase tracking-widest">
                Academia Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  ref={passwordRef}
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 bg-surface-hover border border-border text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all font-mono"
                  style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-accent transition-colors p-1"
                  tabIndex={-1}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-danger/10 border border-danger p-3 text-danger text-xs font-bold uppercase tracking-wider" style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}>
                {error.toLowerCase().includes('captcha') ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Academia is requesting a CAPTCHA. Please log into the portal manually first, then try again here.
                  </span>
                ) : (
                  error
                )}
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
                'SECURE LOGIN'
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
