'use client';
import { useEffect, useState } from 'react';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  label?: string;
}

export default function ProgressRing({
  percentage,
  size = 80,
  strokeWidth = 8,
  showLabel = true,
  label,
}: ProgressRingProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = mounted ? circumference - (Math.min(percentage, 100) / 100) * circumference : circumference;

  const colorClass =
    percentage >= 75
      ? 'text-safe shadow-safe/50'
      : percentage >= 65
      ? 'text-watch'
      : 'text-danger';

  // Apply Bat-yellow glow if safe/accent
  const glowStyle = percentage >= 75 ? { filter: 'drop-shadow(0 0 4px var(--color-safe))' } : {};

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-surface-hover)"
          strokeWidth={strokeWidth}
        />
        <circle
          className={`${colorClass} transition-all duration-1000 ease-out`}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="square"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={glowStyle}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-sm font-bold font-display ${colorClass}`} style={glowStyle}>
            {percentage.toFixed(1)}%
          </span>
          {label && (
            <span className="text-[10px] text-white/40 mt-0.5">{label}</span>
          )}
        </div>
      )}
    </div>
  );
}
