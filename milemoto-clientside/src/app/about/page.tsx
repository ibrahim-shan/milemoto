// src/app/about/page.tsx
import type { Metadata } from 'next';

import { BrandsStrip } from '@/features/about/components/BrandsStrip';
import { CTABand } from '@/features/about/components/CTABand';
import { Hero } from '@/features/about/components/Hero';
import { MediaMosaic } from '@/features/about/components/MediaMosaic';
import { Milestones } from '@/features/about/components/Milestones';
import { MissionGrid } from '@/features/about/components/MissionGrid';
import { Stats } from '@/features/about/components/Stats';
import { ValuesGrid } from '@/features/about/components/ValuesGrid';
import { Breadcrumbs } from '@/features/navigation/Breadcrumbs';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'How MileMoto delivers quality auto parts with fast checkout, trusted brands, and reliable support.',
};

export default function AboutPage() {
  return (
    <main className="bg-background text-foreground min-h-dvh">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'About Us' }]} />
      </section>

      <Hero />
      <MediaMosaic />
      <Stats />
      <MissionGrid />
      <ValuesGrid />
      <Milestones />
      <BrandsStrip />
      <CTABand />
    </main>
  );
}
