// src/app/cart/page.tsx
'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { ArrowLeft, X } from 'lucide-react';

import { Breadcrumbs } from '@/features/navigation/Breadcrumbs';
import { formatUSD } from '@/lib/formatPrice';
import { Button } from '@/ui/Button';
import { Quantity } from '@/ui/Quantity';

type CartItem = {
  id: string;
  title: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  priceMinor: number; // cents-like
  qty: number;
  currency?: string;
};

const fmt = (n: number) => formatUSD(n, { locale: 'en-US' });

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([
    {
      id: 'p1',
      title: 'Spark Plug Set',
      href: '/product/spark-plug',
      imageSrc: '/images/deals/brake.webp',
      imageAlt: 'Spark plug set',
      priceMinor: 4_500_000,
      qty: 1,
      currency: 'MWK',
    },
    {
      id: 'p2',
      title: 'Spark Plug Set',
      href: '/product/spark-plug',
      imageSrc: '/images/deals/brake.webp',
      imageAlt: 'Spark plug set',
      priceMinor: 4_500_000,
      qty: 1,
      currency: 'MWK',
    },
    {
      id: 'p3',
      title: 'Spark Plug Set',
      href: '/product/spark-plug',
      imageSrc: '/images/deals/brake.webp',
      imageAlt: 'Spark plug set',
      priceMinor: 4_500_000,
      qty: 1,
      currency: 'MWK',
    },
  ]);

  const subMinor = useMemo(() => items.reduce((s, it) => s + it.priceMinor * it.qty, 0), [items]);
  const totalMinor = subMinor;

  const setQty = (id: string, q: number) =>
    setItems(prev => prev.map(it => (it.id === id ? { ...it, qty: Math.max(1, q) } : it)));
  const remove = (id: string) => setItems(prev => prev.filter(it => it.id !== id));

  return (
    <main className="bg-background text-foreground mx-auto min-h-dvh max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section>
        <Breadcrumbs
          items={[{ label: 'Home', href: '/' }, { label: 'My Cart' }]}
          showBack
          className="pb-10"
        />

        <h1 className="mb-6 text-2xl font-bold tracking-tight">
          Your Cart{' '}
          <span className="bg-muted ml-1 rounded-full px-2 py-0.5 text-sm">{items.length}</span>
        </h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          {/* Cart table */}
          <div className="border-border/60 bg-card rounded-xl border">
            <div className="border-border/60 text-foreground/70 hidden grid-cols-[1fr_120px_160px_140px_40px] items-center gap-4 border-b px-4 py-3 text-sm md:grid">
              <span>Product</span>
              <span>Price</span>
              <span>Quantity</span>
              <span>SubTotal</span>
              <span />
            </div>

            <ul className="divide-border/60 divide-y">
              {items.map(it => (
                <li
                  key={it.id}
                  className="grid gap-4 px-4 py-4 md:grid-cols-[1fr_120px_160px_140px_40px] md:items-center"
                >
                  {/* product + inline remove on mobile */}
                  <div className="flex items-center gap-3">
                    <div className="border-border/60 bg-muted/40 relative h-14 w-14 overflow-hidden rounded-md border">
                      <Image
                        src={it.imageSrc}
                        alt={it.imageAlt}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>

                    {/* title + mobile X in same line */}
                    <div className="flex min-w-0 flex-1 items-center">
                      <Link
                        href={it.href}
                        className="line-clamp-1 flex-1 text-sm font-medium hover:underline"
                        title={it.title}
                      >
                        {it.title}
                      </Link>

                      {/* X inline with title on mobile only */}
                      <Button
                        variant="ghost"
                        size="sm"
                        icon
                        aria-label={`Remove ${it.title}`}
                        title="Remove item"
                        onClick={() => remove(it.id)}
                        className="md:hidden"
                      >
                        <X
                          className="h-4 w-4"
                          aria-hidden
                        />
                      </Button>
                    </div>
                  </div>

                  {/* price */}
                  <div className="text-sm font-semibold">
                    <span className="text-foreground/60 mb-1 block text-xs md:hidden">Price</span>
                    {fmt(it.priceMinor)}
                  </div>

                  {/* quantity */}
                  <div>
                    <span className="text-foreground/60 mb-1 block text-xs md:hidden">
                      Quantity
                    </span>
                    <Quantity
                      value={it.qty}
                      onChange={q => setQty(it.id, q)}
                    />
                  </div>

                  {/* subtotal */}
                  <div className="text-sm font-semibold">
                    <span className="text-foreground/60 mb-1 block text-xs md:hidden">
                      Subtotal
                    </span>
                    {fmt(it.priceMinor * it.qty)}
                  </div>

                  {/* desktop remove column */}
                  <div className="hidden md:flex md:justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon
                      aria-label="Remove item"
                      title="Remove item"
                      onClick={() => remove(it.id)}
                    >
                      <X
                        className="h-4 w-4"
                        aria-hidden
                      />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Summary */}
          <aside
            aria-labelledby="order-summary-heading"
            className="border-border/60 bg-card h-fit rounded-xl border p-5"
          >
            <h2
              id="order-summary-heading"
              className="border-border/60 mb-4 border-b text-base font-semibold"
            >
              Order Summary
            </h2>

            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-foreground/70">SubTotal</dt>
                <dd className="font-semibold">{fmt(subMinor)}</dd>
              </div>

              <div className="flex items-center justify-between pt-2">
                <dt className="text-foreground/90 font-semibold">Total</dt>
                <dd className="text-base font-extrabold">{fmt(totalMinor)}</dd>
              </div>
            </dl>
            <div className="border-border/60 mt-4 mb-4 border-b"></div>

            <Button
              variant="solid"
              justify="center"
              size="lg"
              fullWidth
            >
              Proceed To Checkout
            </Button>
          </aside>
          <div className="hidden items-center justify-between py-4 md:flex">
            <Button
              href="/shop"
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <ArrowLeft
                className="h-4 w-4"
                aria-hidden
              />
              Continue Shopping
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
