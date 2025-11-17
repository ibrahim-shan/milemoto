'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type StatusBadgeProps = {
  children: ReactNode;
  variant?: 'success' | 'neutral' | 'warning' | 'error' | 'info';
  className?: string;
};

const variantClasses: Record<NonNullable<StatusBadgeProps['variant']>, string> = {
  success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  neutral: 'bg-neutral-200 text-neutral-800 border-neutral-300',
  warning: 'bg-amber-100 text-amber-800 border-amber-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-sky-100 text-sky-800 border-sky-200',
};

export function StatusBadge({ children, variant = 'neutral', className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
