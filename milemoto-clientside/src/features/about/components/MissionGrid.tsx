// src/features/about/MissionGrid.tsx
import { HeartHandshake, ShieldCheck, Truck } from 'lucide-react';

import { InfoCard } from '@/features/about/components/ui';

export function MissionGrid() {
  return (
    <section
      aria-labelledby="mission"
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
    >
      <h2
        id="mission"
        className="text-2xl font-semibold tracking-tight"
      >
        Our mission
      </h2>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <InfoCard
          icon={
            <ShieldCheck
              aria-hidden
              className="h-6 w-6"
            />
          }
          title="Quality guaranteed"
        >
          We list exact-fit specs and verify suppliers before a product ships.
        </InfoCard>
        <InfoCard
          icon={
            <Truck
              aria-hidden
              className="h-6 w-6"
            />
          }
          title="Fast fulfillment"
        >
          Orders pack the same day when placed before cutoff.
        </InfoCard>
        <InfoCard
          icon={
            <HeartHandshake
              aria-hidden
              className="h-6 w-6"
            />
          }
          title="Clear support"
        >
          We answer with part numbers, compatibility, and steps.
        </InfoCard>
      </div>
    </section>
  );
}
