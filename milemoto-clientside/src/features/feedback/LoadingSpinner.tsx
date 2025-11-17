// src/components/feedback/LoadingSpinner.tsx
'use client';

import { cn } from '@/lib/utils';

export function LoadingSpinner({
  size = 24,
  strokeWidth = 2,
  label = 'Loading',
  className = '',
}: {
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn('text-foreground/70 inline-flex items-center gap-2', className)}
    >
      <svg
        className="animate-spin"
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.2}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeDasharray={`${c * 0.25} ${c}`}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
        />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}
