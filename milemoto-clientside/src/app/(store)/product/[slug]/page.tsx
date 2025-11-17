import type { Metadata } from 'next';

import { Breadcrumbs } from '@/features/navigation/Breadcrumbs';
import { BuyActions } from '@/features/product/components/BuyActions';
import { ProductGallery } from '@/features/product/components/ProductGallery';
import { ProductTabs } from '@/features/product/components/ProductTabs';
import { RelatedProducts } from '@/features/product/components/RelatedProducts';

type Product = {
  slug: string;
  title: string;
  description: string;
  priceMinor: number;
  currency?: string;
  images: { src: string; alt: string }[];
  categories: string[];
  tags: string[];
  stock: number;
};

const demo: Product = {
  slug: 'spark-plug-set',
  title: 'Premium Performance Spark Plug Set',
  description:
    "Boost your engine's performance with durable, high-efficiency spark plugs designed for longevity and smooth ignition.",
  priceMinor: 4_500,
  currency: 'USD',
  images: [
    { src: '/images/deals/brake.webp', alt: 'Spark plug set front' },
    { src: '/images/deals/brake.webp', alt: 'Spark plug set angle' },
    { src: '/images/deals/brake.webp', alt: 'Spark plug detail' },
    { src: '/images/deals/brake.webp', alt: 'Packaging' },
  ],
  categories: ['Electrical System'],
  tags: ['Cars'],
  stock: 12,
};

export const metadata: Metadata = {
  title: demo.title,
  description: demo.description,
};

function formatPrice(minor: number, currency = 'USD', locale = 'en-US') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(minor / 100);
}

export default function ProductPage() {
  const p = demo; // replace with real fetch by slug

  return (
    <main className="bg-background text-foreground mx-auto min-h-dvh max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section>
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Shop Parts', href: '/shop' },
            { label: p.title },
          ]}
          showBack
          className="pb-10"
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_520px]">
          {/* Left: gallery */}
          <ProductGallery images={p.images} />

          {/* Right: details */}
          <article className="border-border/60 bg-card rounded-xl border p-6">
            <h1 className="text-2xl font-bold tracking-tight">{p.title}</h1>
            <p className="text-foreground/70 mt-2 text-sm">{p.description}</p>

            <hr className="border-border/70 my-6" />

            <div className="text-lg font-extrabold">{formatPrice(p.priceMinor, p.currency)}</div>

            {/* Quantity + CTAs */}
            <BuyActions
              stock={p.stock}
              slug={p.slug}
              title={p.title}
              priceMinor={p.priceMinor}
              imageSrc={p.images[0]?.src ?? '/images/placeholder.png'}
            />

            <hr className="border-border/70 my-6" />

            <dl className="space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="text-foreground/70 w-28">Categories:</dt>
                <dd className="flex-1">{p.categories.join(', ')}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-foreground/70 w-28">Tag:</dt>
                <dd className="flex-1">{p.tags.join(', ')}</dd>
              </div>
            </dl>
          </article>
        </div>

        <ProductTabs
          tabs={[
            {
              label: 'Description',
              content: (
                <>
                  <p>
                    The spark plug set includes high-performance, heat-resistant plugs designed to
                    provide efficient combustion and smooth engine ignition. Made with durable
                    materials, these spark plugs enhance fuel efficiency, reduce emissions, and
                    extend engine life. Compatible with a wide range of vehicles, they ensure
                    reliable starts and consistent performance in all driving conditions.
                  </p>
                  <p className="mt-4">
                    Upgrade your engine&apos;s performance with this premium spark plug set,
                    designed for optimal fuel efficiency, smoother ignition, and long-lasting
                    durability. Perfect for a wide range of vehicles, these high-quality spark plugs
                    ensure a reliable and powerful drive every time.
                  </p>
                </>
              ),
            },
            {
              label: 'Shipping Information',
              content: (
                <ul className="list-disc space-y-1 pl-5">
                  <li>Ships within 1–2 business days.</li>
                  <li>Standard delivery: 3–7 business days; Express: 1–3 days.</li>
                  <li>Free returns within 14 days if unused and in original packaging.</li>
                </ul>
              ),
            },
          ]}
        />

        <RelatedProducts
          items={[
            {
              title: 'Spark Plug Set',
              href: '/product/spark-plug',
              imageSrc: '/images/deals/brake.webp',
              imageAlt: 'Spark plugs',
              priceMinor: 4_500,
            },
            {
              title: 'Brake Pads',
              href: '/product/brake-pads',
              imageSrc: '/images/deals/brake.webp',
              imageAlt: 'Brake pads',
              priceMinor: 7_500,
            },
            {
              title: 'Tire Wheels',
              href: '/product/tires',
              imageSrc: '/images/deals/brake.webp',
              imageAlt: 'Tire wheels',
              priceMinor: 1_500,
            },
            {
              title: 'Alternator',
              href: '/product/alternator',
              imageSrc: '/images/cta/engine.webp',
              imageAlt: 'Alternator',
              priceMinor: 1_500,
            },
          ]}
        />
      </section>
    </main>
  );
}
