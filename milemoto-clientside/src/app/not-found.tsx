import type { ReactElement } from 'react';
import Link from 'next/link';

export default function NotFound(): ReactElement {
  return (
    <main className="bg-background text-foreground grid min-h-dvh place-items-center px-6 py-16">
      <section className="max-w-xl text-center">
        <p className="text-muted-foreground text-sm font-medium">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Page not found</h1>
        <p className="text-muted-foreground mt-2">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            Go to Home
          </Link>
          <Link
            href="/shop"
            className="border-border text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            Browse Shop
          </Link>
        </div>
      </section>
    </main>
  );
}
