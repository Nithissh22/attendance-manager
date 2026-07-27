'use client';
import { useEffect, useState } from 'react';

interface GaugeChartProps {
  percentage: number;
  size?: number;
}

export default function GaugeChart({ percentage, size = 260 }: GaugeChartProps) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const duration = 1400;
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      setDisplayed(Math.round(percentage * eased * 10) / 10);
      if (t < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [percentage]);

  const cx = size / 2;
  const cy = size * 0.58;
  const r = size * 0.38;
  const strokeWidth = size * 0.055;

  // Arc goes from 210° to -30° (240° sweep)
  const startAngle = 210;
  const endAngle = -30;
  const sweepAngle = 240;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const arcPath = (start: number, end: number, reverse = false) => {
    const s = toRad(start);
    const e = toRad(end);
    const x1 = cx + r * Math.cos(s);
    const y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e);
    const y2 = cy + r * Math.sin(e);
    const largeArc = Math.abs(end - start) > 180 ? 1 : 0;
    const sweep = reverse ? 0 : 1;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} ${sweep} ${x2} ${y2}`;
  };

  const progressAngle = startAngle - (Math.min(displayed, 100) / 100) * sweepAngle;
  const color = displayed >= 75 ? '#2dd4bf' : displayed >= 65 ? '#f59e0b' : '#f87171';

  // Target marker at 75%
  const targetAngle = toRad(startAngle - 0.75 * sweepAngle);
  const markerOuter = { x: cx + (r + strokeWidth) * Math.cos(targetAngle), y: cy + (r + strokeWidth) * Math.sin(targetAngle) };
  const markerInner = { x: cx + (r - strokeWidth) * Math.cos(targetAngle), y: cy + (r - strokeWidth) * Math.sin(targetAngle) };

  const bgPath = arcPath(startAngle, -30);
  const progressPath = arcPath(startAngle, progressAngle);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.7} viewBox={`0 0 ${size} ${size * 0.7}`}>
        {/* Gradient defs */}
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="40%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#2dd4bf" />
          </linearGradient>
        </defs>
        {/* Background track */}
        <path
          d={bgPath}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <path
          d={progressPath}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{ transition: 'all 0.05s linear', filter: `drop-shadow(0 0 8px ${color}88)` }}
        />
        {/* 75% target marker */}
        <line
          x1={markerInner.x} y1={markerInner.y}
          x2={markerOuter.x} y2={markerOuter.y}
          stroke="#ffffff"
          strokeWidth={2.5}
          strokeLinecap="round"
          opacity={0.7}
        />
        {/* Center label */}
        <text x={cx} y={cy - 8} textAnchor="middle" fill={color} fontSize={size * 0.14} fontWeight="700" fontFamily="monospace">
          {displayed.toFixed(1)}
        </text>
        <text x={cx} y={cy + size * 0.045} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={size * 0.048}>
          Overall Attendance %
        </text>
        {/* 75% label */}
        <text
          x={markerOuter.x + (Math.cos(targetAngle) > 0 ? 6 : -6)}
          y={markerOuter.y + 4}
          textAnchor={Math.cos(targetAngle) > 0 ? 'start' : 'end'}
          fill="rgba(255,255,255,0.5)"
          fontSize={size * 0.038}
        >
          75%
        </text>
      </svg>
    </div>
  );
}
