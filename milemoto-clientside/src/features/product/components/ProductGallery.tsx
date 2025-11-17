// src/components/product/ProductGallery.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';

type Props = { images: { src: string; alt: string }[] };

export function ProductGallery({ images }: Props) {
  const [idx, setIdx] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);

  // derive a safe index instead of setState in an effect
  const maxIndex = Math.max(0, images.length - 1);
  const viewIdx = Math.min(idx, maxIndex);

  // keyboard arrows
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') setIdx(i => Math.min(i + 1, maxIndex));
      if (e.key === 'ArrowLeft') setIdx(i => Math.max(i - 1, 0));
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [maxIndex]);

  if (images.length === 0) {
    return (
      <section
        aria-label="Product images"
        className="space-y-4"
      >
        <div className="border-border/60 bg-card relative aspect-4/3 w-full rounded-xl border" />
      </section>
    );
  }

  if (!images[viewIdx]) return null;
  const current = images[viewIdx];

  return (
    <section
      aria-label="Product images"
      className="space-y-4"
    >
      <div className="border-border/60 bg-card relative aspect-4/3 w-full overflow-hidden rounded-xl border">
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt}
          fill
          priority
          loading="eager"
          sizes="(min-width:1024px) 640px, 100vw"
          decoding="async"
          className="object-cover"
        />
      </div>

      <div
        ref={listRef}
        className="grid grid-cols-5 gap-3"
      >
        {images.map((img, i) => {
          const active = i === viewIdx;
          return (
            <button
              key={img.src + i}
              type="button"
              aria-label={`Thumbnail ${i + 1}`}
              aria-pressed={active}
              onClick={() => setIdx(i)}
              className={cn(
                'relative aspect-4/3 overflow-hidden rounded-lg border',
                active ? 'border-primary ring-ring ring-0' : 'border-border/60 hover:border-border',
              )}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                loading="lazy"
                decoding="async"
                sizes="120px"
                className="object-cover"
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
