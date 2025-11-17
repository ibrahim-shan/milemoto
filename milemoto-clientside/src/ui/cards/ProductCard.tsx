// src/components/cards/ProductCard.tsx
'use client';

import { memo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { motion } from 'framer-motion';
import { Check, ShoppingCart } from 'lucide-react';

import { formatUSD } from '@/lib/formatPrice';
import { Button } from '@/ui/Button';

export type ProductCardProps = {
  title: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  priceMinor: number;
  imgPriority?: boolean;
  imgLoading?: 'eager' | 'lazy';
  imgBlurDataURL?: string;
  variant?: 'overlay' | 'inline';
  onAdd?: () => Promise<void> | void;
  locale?: string;
};

function ProductCardInner({
  title,
  href,
  imageSrc,
  imageAlt,
  priceMinor,
  variant = 'overlay',
  imgPriority = false,
  imgLoading = 'lazy',
  imgBlurDataURL,
  onAdd,
  locale = 'en-US',
}: ProductCardProps) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const price = formatUSD(priceMinor, { locale });

  async function handleAdd() {
    if (!onAdd) return;
    try {
      setAdding(true);
      await onAdd();
      setAdded(true);
      setTimeout(() => setAdded(false), 1200);
    } finally {
      setAdding(false);
    }
  }

  return (
    <motion.article
      itemScope
      itemType="https://schema.org/Product"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="group border-border/60 bg-card hover:border-border focus-within:ring-ring relative flex flex-col rounded-xl border p-4 transition-colors focus-within:ring-2"
    >
      <div className="relative mx-auto aspect-4/3 w-full overflow-hidden rounded-lg">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
          priority={imgPriority}
          loading={imgLoading}
          decoding="async"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          {...(imgBlurDataURL ? { placeholder: 'blur' as const, blurDataURL: imgBlurDataURL } : {})}
        />

        {variant === 'overlay' && (
          <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100">
            {onAdd ? (
              <Button
                size="sm"
                variant="solid"
                justify="center"
                onClick={handleAdd}
                isLoading={adding}
                loadingLabel="Adding"
                aria-label={`Add ${title} to cart`}
                leftIcon={
                  <ShoppingCart
                    className="h-4 w-4"
                    aria-hidden
                  />
                }
              >
                Add To Cart
              </Button>
            ) : (
              <Button
                href={href}
                size="sm"
                variant="solid"
                justify="center"
                aria-label={`View ${title}`}
                leftIcon={
                  <ShoppingCart
                    className="h-4 w-4"
                    aria-hidden
                  />
                }
              >
                View Product
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="mt-4">
        <Link
          href={href}
          prefetch={false}
          className="text-foreground/90 focus-visible:ring-ring rounded text-sm hover:underline focus-visible:ring-2 focus-visible:outline-none"
          aria-label={title}
        >
          <span itemProp="name">{title}</span>
        </Link>

        <div className="text-md text-foreground mt-1 font-extrabold tracking-tight">
          <span
            itemProp="offers"
            itemScope
            itemType="https://schema.org/Offer"
          >
            <meta
              itemProp="priceCurrency"
              content="USD"
            />
            <span
              itemProp="price"
              content={(priceMinor / 100).toString()}
            >
              {price}
            </span>
          </span>
          <span className="sr-only"> price</span>
        </div>

        {variant === 'inline' && (
          <div className="mt-2">
            <Button
              variant="solid"
              size="sm"
              justify="center"
              onClick={handleAdd}
              disabled={adding}
              aria-live="polite"
              aria-busy={adding}
              aria-label={`Add ${title} to cart`}
            >
              {added ? (
                <>
                  <Check
                    className="mr-2 h-4 w-4"
                    aria-hidden
                  />
                  Added
                </>
              ) : (
                <>
                  <ShoppingCart
                    className="mr-2 h-4 w-4"
                    aria-hidden
                  />
                  {adding ? 'Adding…' : 'Add To Cart'}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </motion.article>
  );
}

export const ProductCard = memo(ProductCardInner);
