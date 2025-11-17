import Image from 'next/image';

import { ArrowRight } from 'lucide-react';

import { Button } from '@/ui/Button';

export type PromoTileProps = {
  title: string;
  subtitle?: string;
  body?: string;
  ctaHref: string;
  ctaLabel: string;
  imageSrc: string;
  imageAlt: string;
  priority?: boolean;
  className?: string;
};

export function PromoTile({
  title,
  subtitle,
  body,
  ctaHref,
  ctaLabel,
  imageSrc,
  imageAlt,
  priority,
  className = '',
}: PromoTileProps) {
  return (
    <div className={`border-border/60 relative overflow-hidden rounded-xl border ${className}`}>
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        className="object-cover"
        {...(priority ? { priority: true } : {})}
      />
      <div
        className="absolute inset-0 bg-black/60"
        aria-hidden
      />
      <div className="relative flex h-full flex-col justify-end p-5">
        {subtitle ? <p className="text-primary mb-1 text-sm font-semibold">{subtitle}</p> : null}
        <h3 className="text-xl leading-snug font-semibold text-white">{title}</h3>
        {body ? <p className="mt-1 text-sm text-white/80">{body}</p> : null}
        <div className="mt-4 w-max">
          <Button
            href={ctaHref}
            size="md"
            variant="outline"
            className="border-white text-white hover:bg-white/10 focus-visible:ring-white/40"
            aria-label={ctaLabel}
          >
            {ctaLabel}
            <ArrowRight
              className="h-4 w-4"
              aria-hidden
            />
          </Button>
        </div>
      </div>
    </div>
  );
}
