// src/features/about/Stats.tsx
import { StatCard } from '@/features/about/components/ui';

export function Stats() {
  return (
    <section
      aria-labelledby="about-stats"
      className="border-border/60 bg-card/50"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h2
          id="about-stats"
          className="sr-only"
        >
          Key metrics
        </h2>
        <dl className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <StatCard
            label="Happy drivers"
            value="1,000+"
          />
          <StatCard
            label="Avg. delivery"
            value="2 days"
          />
          <StatCard
            label="Positive ratings"
            value="99.2%"
          />
          <StatCard
            label="Support"
            value="24/7"
          />
        </dl>
      </div>
    </section>
  );
}
