// src/components/cards/CategoryCard.tsx
'use client';

import Image from 'next/image';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

import { Button } from '@/ui/Button';

export type CategoryCardProps = {
  title: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
};

export function CategoryCard({ title, href, imageSrc, imageAlt }: CategoryCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.99 }}
      className="group border-border/60 bg-card hover:border-border relative rounded-xl border p-4 transition-colors"
    >
      <div className="relative mx-auto aspect-4/3 w-full overflow-hidden rounded-lg">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(min-width:1280px) 240px, (min-width:768px) 25vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>

      <div className="mt-4">
        <h3 className="text-foreground/90 text-sm font-semibold">{title}</h3>
        <Button
          href={href}
          variant="link"
          size="sm"
          className="text-primary mt-2"
          aria-label={`${title} — Shop Now`}
        >
          Shop Now
          <ArrowUpRight
            className="h-4 w-4"
            aria-hidden
          />
        </Button>
      </div>
    </motion.article>
  );
}
