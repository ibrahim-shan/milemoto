// src/features/about/Hero.tsx
'use client';

import Image from 'next/image';

import { CheckCircle, PackageCheck, Tags } from 'lucide-react';

import { Button } from '@/ui/Button';

export function Hero() {
  return (
    <section
      aria-labelledby="about-hero"
      className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8"
    >
      <div className="border-border bg-card/80 relative overflow-hidden rounded-3xl border p-6 md:p-8">
        <div className="bg-primary/10 pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl" />
        <div className="bg-accent/10 pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full blur-3xl" />

        <header
          id="about-hero"
          className="grid items-center gap-8 md:grid-cols-2"
        >
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">About MileMoto</h1>
            <p className="text-muted-foreground mt-3 max-w-prose">
              Dependable auto parts with exact-fit data, clear pricing, and quick delivery. Fix and
              upgrade without friction.
            </p>
            <ul className="text-muted-foreground mt-4 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle
                  className="text-primary h-4 w-4"
                  aria-hidden
                />{' '}
                Exact-fit by VIN
              </li>
              <li className="flex items-center gap-2">
                <PackageCheck
                  className="text-primary h-4 w-4"
                  aria-hidden
                />{' '}
                Same-day packing
              </li>
              <li className="flex items-center gap-2">
                <Tags
                  className="text-primary h-4 w-4"
                  aria-hidden
                />{' '}
                Fair pricing
              </li>
            </ul>
            <div className="mt-6 flex items-center gap-3">
              <Button
                href="/shop"
                variant="solid"
                justify="center"
                size="lg"
              >
                Shop Parts
              </Button>
              <Button
                href="/contact"
                variant="secondary"
                justify="center"
                size="lg"
              >
                Contact Support
              </Button>
            </div>
          </div>

          <div className="border-border relative aspect-16/10 w-full overflow-hidden rounded-2xl border">
            <Image
              src="/images/about/warehouse-hero.webp"
              alt="MileMoto warehouse and packaging"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 560px, 100vw"
              priority
            />
            <div className="pointer-events-none absolute top-4 left-4 flex gap-2">
              <span className="bg-card/90 border-border rounded-full border px-3 py-1 text-xs backdrop-blur">
                Same-day pick
              </span>
              <span className="bg-card/90 border-border rounded-full border px-3 py-1 text-xs backdrop-blur">
                VIN fitment
              </span>
            </div>
            <div className="border-border bg-card/90 pointer-events-none absolute bottom-4 left-4 rounded-xl border px-3 py-2 backdrop-blur">
              <p className="text-sm">
                <span className="font-semibold">Avg. delivery:</span> 2 days
              </p>
            </div>
          </div>
        </header>
      </div>
    </section>
  );
}
