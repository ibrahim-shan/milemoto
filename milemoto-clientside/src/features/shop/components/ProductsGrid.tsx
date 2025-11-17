// src/components/shop/ProductsGrid.tsx
'use client';

import { ProductCard } from '@/ui/cards/ProductCard';

export type Product = {
  title: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  priceMinor: number;
};

const demoProducts: Product[] = [
  {
    title: 'Spark Plug Set',
    href: '/product/spark-plug',
    imageSrc: '/images/deals/brake.webp',
    imageAlt: 'Spark plugs',
    priceMinor: 4_500_000,
  },
  {
    title: 'Brake Pads',
    href: '/product/brake-pads',
    imageSrc: '/images/deals/brake.webp',
    imageAlt: 'Brake pads',
    priceMinor: 4_500_000,
  },
  {
    title: 'Engine Assembly',
    href: '/product/engine',
    imageSrc: '/images/cta/engine.webp',
    imageAlt: 'Engine',
    priceMinor: 4_500_000,
  },
  {
    title: 'Spark Plug Set',
    href: '/product/spark-plug-2',
    imageSrc: '/images/deals/brake.webp',
    imageAlt: 'Spark plugs',
    priceMinor: 4_500_000,
  },
  {
    title: 'Brake Pads',
    href: '/product/brake-pads-2',
    imageSrc: '/images/deals/brake.webp',
    imageAlt: 'Brake pads',
    priceMinor: 4_500_000,
  },
  {
    title: 'Engine Assembly',
    href: '/product/engine-2',
    imageSrc: '/images/cta/engine.webp',
    imageAlt: 'Engine',
    priceMinor: 4_500_000,
  },
];

type SortKey = 'default' | 'price-asc' | 'price-desc' | 'title-asc';

export function ProductsGrid({
  query = '',
  sort = 'default',
  cardVariant = 'overlay', // NEW
  onAdd, // NEW
}: {
  query?: string;
  sort?: SortKey;
  cardVariant?: 'overlay' | 'inline';
  onAdd?: (p: Product) => void;
}) {
  const q = query.trim().toLowerCase();
  let items = demoProducts.filter(p => p.title.toLowerCase().includes(q));
  if (sort === 'price-asc') items = [...items].sort((a, b) => a.priceMinor - b.priceMinor);
  else if (sort === 'price-desc') items = [...items].sort((a, b) => b.priceMinor - a.priceMinor);
  else if (sort === 'title-asc') items = [...items].sort((a, b) => a.title.localeCompare(b.title));

  if (items.length === 0) {
    return <p className="text-foreground/70 text-sm">No products match.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-3">
      {items.map((p, i) => (
        <ProductCard
          key={p.href}
          title={p.title}
          href={p.href}
          imageSrc={p.imageSrc}
          imageAlt={p.imageAlt}
          priceMinor={p.priceMinor}
          variant={cardVariant} // NEW
          onAdd={() => onAdd?.(p)} // NEW
          imgPriority={i === 0} // first visible card = LCP
          imgLoading={i === 0 ? 'eager' : 'lazy'} // others lazy
        />
      ))}
    </div>
  );
}
