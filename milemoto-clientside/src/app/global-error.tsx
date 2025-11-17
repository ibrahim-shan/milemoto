// src/app/global-error.tsx
'use client';

import { Button } from '@/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground grid min-h-dvh place-items-center px-6 py-16">
        <section className="max-w-xl text-center">
          <h1 className="text-3xl font-semibold tracking-tight">App error</h1>
          <p className="text-muted-foreground mt-2">{error.message}</p>
          {error?.digest && (
            <p className="text-muted-foreground mt-2 text-xs">Ref: {error.digest}</p>
          )}
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button
              variant="solid"
              size="md"
              justify="center"
              onClick={reset}
            >
              Reload
            </Button>
            <Button
              href="/"
              variant="outline"
              size="md"
              justify="center"
            >
              Go home
            </Button>
          </div>
        </section>
      </body>
    </html>
  );
}
