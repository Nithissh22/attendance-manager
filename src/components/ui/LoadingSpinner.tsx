export function LoadingSpinner({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 animate-pulse">
      <div className="flex gap-3 mb-4">
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-white/[0.07] rounded-full w-1/3" />
          <div className="h-4 bg-white/[0.05] rounded-full w-4/5" />
        </div>
        <div className="w-16 h-16 rounded-full bg-white/[0.06]" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-white/[0.05] rounded-full" />
        <div className="h-8 bg-white/[0.04] rounded-xl" />
      </div>
    </div>
  );
}
