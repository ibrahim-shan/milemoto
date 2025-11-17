// src/components/skeletons/ProductPageSkeleton.tsx
'use client';

import { Skeleton } from '@/features/feedback/Skeleton';

export function ProductPageSkeleton() {
  return (
    <main className="bg-background text-foreground mx-auto grid min-h-dvh max-w-7xl gap-8 px-4 py-10 md:grid-cols-2">
      {/* Gallery */}
      <section>
        <Skeleton className="aspect-square w-full rounded-xl" />
        <div className="mt-3 grid grid-cols-5 gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              className="aspect-square rounded-lg"
            />
          ))}
        </div>
      </section>

      {/* Details */}
      <section className="space-y-4">
        <Skeleton className="h-8 w-5/6" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-6 w-32" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-36 rounded-full" />
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>
        <div className="space-y-2 pt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-3 w-full"
            />
          ))}
        </div>
      </section>
    </main>
  );
}
