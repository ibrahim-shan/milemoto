// src/features/about/BrandsStrip.tsx
'use client';

import Image from 'next/image';

export function BrandsStrip() {
  return (
    <section
      aria-labelledby="brands"
      className="border-border/60 bg-card/50 hidden md:block"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h2
          id="brands"
          className="sr-only"
        >
          Partner brands
        </h2>
        <div className="grid grid-cols-2 items-center gap-6 md:grid-cols-5">
          {['bmw', 'nissan', 'mpower', 'mercedes', 'volkswagen'].map(name => (
            <div
              key={name}
              className="group relative mx-auto h-10 w-36 opacity-80"
            >
              <Image
                src={`/images/brands/${name}.webp`}
                alt={`${name} logo`}
                fill
                className="object-contain grayscale transition hover:grayscale-0"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
