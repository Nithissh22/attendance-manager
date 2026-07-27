'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

interface NavbarProps {
  studentName?: string;
}

export default function Navbar({ studentName }: NavbarProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0c0f1d]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-teal-500/20">
            A
          </div>
          <span className="text-white font-bold tracking-tight text-sm">
            Attend<span className="text-teal-400">X</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden sm:flex items-center gap-1">
          {[
            { href: '/dashboard', label: 'Attendance' },
            { href: '/timetable', label: 'Timetable' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 rounded-lg text-white/50 hover:text-white/90 hover:bg-white/[0.05] text-sm transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {studentName && (
            <span className="hidden sm:block text-xs text-white/30 max-w-[140px] truncate">
              {studentName}
            </span>
          )}
          <button
            onClick={handleLogout}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/50 hover:text-white hover:bg-white/[0.07] border border-white/[0.08] transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging out…' : 'Log out'}
          </button>
        </div>
      </div>
    </nav>
  );
}
