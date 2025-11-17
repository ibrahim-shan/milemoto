// src/app/error.tsx
'use client';

import { useEffect } from 'react';

import { Button } from '@/ui/Button';

type Props = { error: Error & { digest?: string }; reset: () => void };

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    // console.error(error);
  }, [error]);

  return (
    <div className="bg-background text-foreground grid min-h-dvh place-items-center px-6 py-16">
      <section className="max-w-xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="text-muted-foreground mt-2">An unexpected error occurred.</p>
        {error?.digest && <p className="text-muted-foreground mt-2 text-xs">Ref: {error.digest}</p>}
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button
            variant="solid"
            size="md"
            justify="center"
            onClick={reset}
          >
            Try again
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
    </div>
  );
}
