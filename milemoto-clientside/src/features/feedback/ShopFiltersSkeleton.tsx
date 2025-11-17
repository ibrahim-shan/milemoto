// src/components/skeletons/ShopFiltersSkeleton.tsx
'use client';

import { ProductsGridSkeleton } from './ProductsGridSkeleton';

import { Skeleton } from '@/features/feedback/Skeleton';

export function ShopFiltersSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <aside className="space-y-4">
        <Skeleton className="h-9 w-40 rounded-full" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-6 w-full"
          />
        ))}
      </aside>

      {/* Content */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <Skeleton className="h-10 w-72 rounded-full" />
          <Skeleton className="h-10 w-36 rounded-full" />
        </div>
        <ProductsGridSkeleton count={8} />
      </section>
    </div>
  );
}
