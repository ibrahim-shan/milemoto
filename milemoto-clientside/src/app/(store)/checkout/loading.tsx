// src/app/checkout/loading.tsx
import { Skeleton } from '@/features/feedback/Skeleton';

export default function Loading() {
  return (
    <main className="bg-background text-foreground mx-auto grid min-h-dvh max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1fr_420px]">
      <section className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-10 w-full rounded-lg"
          />
        ))}
      </section>
      <aside className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-full" />
      </aside>
    </main>
  );
}
