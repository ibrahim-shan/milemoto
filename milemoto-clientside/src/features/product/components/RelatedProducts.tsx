// src/components/product/RelatedProducts.tsx
'use client';

import { ProductCard } from '@/ui/cards/ProductCard';

type Item = {
  title: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  priceMinor: number;
};

export function RelatedProducts({ items }: { items: Item[] }) {
  if (!items?.length) return null;

  return (
    <section
      aria-label="Similar products"
      className="mt-10"
    >
      <h2 className="mb-4 text-base font-semibold">Similar Products You Might Like</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.map(p => (
          <ProductCard
            key={p.href}
            title={p.title}
            href={p.href}
            imageSrc={p.imageSrc}
            imageAlt={p.imageAlt}
            priceMinor={p.priceMinor}
            variant="overlay" // default card behavior
            imgPriority={false} // not LCP
            imgLoading="lazy"
          />
        ))}
      </div>
    </section>
  );
}
