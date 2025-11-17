// src/features/about/ValuesGrid.tsx
import { BadgeCheck, Bolt, Clock, Flag } from 'lucide-react';

import { ValueItem } from '@/features/about/components/ui';

export function ValuesGrid() {
  return (
    <section
      aria-labelledby="values"
      className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8"
    >
      <h2
        id="values"
        className="text-2xl font-semibold tracking-tight"
      >
        What we value
      </h2>
      <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <ValueItem
          icon={
            <BadgeCheck
              aria-hidden
              className="h-5 w-5"
            />
          }
          title="Accuracy"
          body="Specs, not hype."
        />
        <ValueItem
          icon={
            <Bolt
              aria-hidden
              className="h-5 w-5"
            />
          }
          title="Speed"
          body="Fast pick and ship."
        />
        <ValueItem
          icon={
            <Clock
              aria-hidden
              className="h-5 w-5"
            />
          }
          title="Reliability"
          body="Parts that last."
        />
        <ValueItem
          icon={
            <Flag
              aria-hidden
              className="h-5 w-5"
            />
          }
          title="Accountability"
          body="We own mistakes."
        />
      </ul>
    </section>
  );
}
