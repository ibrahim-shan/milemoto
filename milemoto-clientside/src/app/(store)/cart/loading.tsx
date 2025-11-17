// src/app/cart/loading.tsx
import { Skeleton } from '@/features/feedback/Skeleton';

export default function Loading() {
  return (
    <main className="bg-background text-foreground mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6">
        <Skeleton className="h-7 w-40" />
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_360px]">
        <section className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[96px_1fr_96px] items-center gap-4"
            >
              <Skeleton className="aspect-square w-24 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-10 w-24 rounded-full" />
            </div>
          ))}
        </section>
        <aside className="space-y-3">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-full" />
        </aside>
      </div>
    </main>
  );
}
