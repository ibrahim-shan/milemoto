// src/components/product/QuantitySelector.tsx
'use client';

import { useState } from 'react';

import { Minus, Plus } from 'lucide-react';

export function QuantitySelector({
  stock,
  onChange,
}: {
  stock: number;
  onChange?: (q: number) => void;
}) {
  const [q, setQ] = useState(1);

  const set = (n: number) => {
    const v = Math.min(Math.max(1, n), Math.max(1, stock));
    setQ(v);
    onChange?.(v);
  };

  return (
    <div className="border-border/60 bg-card inline-flex h-10 items-center gap-2 rounded-full border px-2">
      <button
        type="button"
        aria-label="Decrease quantity"
        className="hover:bg-muted/60 grid h-7 w-7 place-items-center rounded-full"
        onClick={() => set(q - 1)}
      >
        <Minus
          className="h-4 w-4"
          aria-hidden
        />
      </button>
      <span
        className="w-6 text-center text-sm tabular-nums"
        aria-live="polite"
      >
        {q}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        className="hover:bg-muted/60 grid h-7 w-7 place-items-center rounded-full"
        onClick={() => set(q + 1)}
        disabled={q >= stock}
      >
        <Plus
          className="h-4 w-4"
          aria-hidden
        />
      </button>
    </div>
  );
}
