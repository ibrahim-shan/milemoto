// src/components/skeletons/ProductCardSkeleton.tsx
'use client';

import { Skeleton } from '@/features/feedback/Skeleton';
import { cn } from '@/lib/utils';

export function ProductCardSkeleton({ variant = 'overlay' }: { variant?: 'overlay' | 'inline' }) {
  return (
    <article
      className={cn(
        'border-border/60 bg-card relative rounded-xl border p-4 dark:border-white/15 dark:bg-[--surface-elevated-dark]',
      )}
      aria-busy
      aria-label="Loading product"
    >
      <Skeleton className="relative mx-auto aspect-4/3 w-full rounded-lg" />
      <div className="mt-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-6 w-24" />
        {variant === 'inline' ? (
          <Skeleton className="h-10 w-full rounded-full" />
        ) : (
          <div className="mt-3">
            <Skeleton className="h-10 w-full rounded-full" />
          </div>
        )}
      </div>
    </article>
  );
}
