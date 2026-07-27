import type { Metadata } from 'next';
import { Special_Elite, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const specialElite = Special_Elite({ weight: '400', subsets: ['latin'], variable: '--font-display' });
const plexSans = IBM_Plex_Sans({ weight: ['400', '600', '700'], subsets: ['latin'], variable: '--font-sans' });
const plexMono = IBM_Plex_Mono({ weight: ['400', '600', '700'], subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'AttendX — SRM Academia Portal',
  description: 'Track your SRM attendance, timetable, and marks in a beautifully designed dashboard. Unofficial.',
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${specialElite.variable} ${plexSans.variable} ${plexMono.variable} font-sans`} suppressHydrationWarning>
      <body className="bg-board-bg text-text-board min-h-screen selection:bg-card-surface selection:text-text-parchment font-sans" suppressHydrationWarning>
        {/* Corkboard Noise Overlay */}
        <div className="fixed inset-0 pointer-events-none z-0 opacity-20 mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')]" />
        
        <main className="relative z-10 flex flex-col min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
