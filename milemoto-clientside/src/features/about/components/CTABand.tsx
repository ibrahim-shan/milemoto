// src/features/about/CTABand.tsx
import { Button } from '@/ui/Button';

export function CTABand() {
  return (
    <section
      aria-labelledby="cta"
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="border-border bg-card relative overflow-hidden rounded-3xl border p-6 md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_400px_at_100%_0%,rgba(21,94,239,0.08),transparent)]" />
        <h2
          id="cta"
          className="text-2xl font-semibold tracking-tight"
        >
          Get the right part the first time
        </h2>
        <p className="text-muted-foreground mt-2">
          Browse bestsellers or ask us to confirm fitment for your VIN.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            href="/shop"
            variant="solid"
            justify="center"
          >
            Browse Bestsellers
          </Button>
          <Button
            href="/contact"
            variant="ghost"
            justify="center"
          >
            Ask Fitment
          </Button>
          <Button
            href="/returns"
            variant="ghost"
          >
            Returns Policy
          </Button>
        </div>
      </div>
    </section>
  );
}
