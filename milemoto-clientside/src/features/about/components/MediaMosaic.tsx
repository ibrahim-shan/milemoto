// src/features/about/MediaMosaic.tsx
'use client';

import Image from 'next/image';

export function MediaMosaic() {
  return (
    <section
      aria-labelledby="media"
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <h2
        id="media"
        className="sr-only"
      >
        Behind the scenes
      </h2>
      <div className="grid gap-4 md:grid-cols-3">
        <Figure
          src="/images/about/packing.webp"
          alt="Order packing"
        />
        <Figure
          src="/images/about/shelves.webp"
          alt="Shelves with labeled bins"
          tall
        />
        <Figure
          src="/images/about/scan.webp"
          alt="Barcode scanning for accuracy"
        />
      </div>
    </section>
  );
}

function Figure({ src, alt, tall = false }: { src: string; alt: string; tall?: boolean }) {
  return (
    <figure
      className={`group border-border relative overflow-hidden rounded-2xl border ${
        tall ? 'aspect-4/3 md:row-span-2' : 'aspect-4/3'
      }`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(min-width:1024px) 33vw, 100vw"
      />
      <figcaption className="bg-linear-gradient-to-t pointer-events-none absolute inset-x-0 bottom-0 from-black/50 to-transparent p-3 text-xs text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        {alt}
      </figcaption>
    </figure>
  );
}
