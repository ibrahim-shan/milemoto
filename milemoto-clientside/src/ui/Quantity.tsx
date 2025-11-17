// src/ui/Quantity.tsx
'use client';

import { Minus, Plus } from 'lucide-react';

import { Button } from '@/ui/Button';

type Props = {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  className?: string;
};

export function Quantity({ value, onChange, min = 1, max = 99, className = '' }: Props) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  return (
    <div
      className={`border-border/60 bg-card inline-flex items-center overflow-hidden rounded-full border px-2 py-1 ${className}`}
    >
      <Button
        variant="ghost"
        size="xs"
        icon
        className="hover:bg-foreground/10 h-7 w-7 rounded-full"
        aria-label="Decrease quantity"
        onClick={dec}
        disabled={value <= min}
      >
        <Minus
          className="h-4 w-4"
          aria-hidden
        />
      </Button>

      <span
        className="mx-2 w-6 text-center text-sm tabular-nums select-none"
        aria-live="polite"
      >
        {value}
      </span>

      <Button
        variant="ghost"
        size="xs"
        icon
        className="hover:bg-foreground/10 h-7 w-7 rounded-full"
        aria-label="Increase quantity"
        onClick={inc}
        disabled={value >= max}
      >
        <Plus
          className="h-4 w-4"
          aria-hidden
        />
      </Button>
    </div>
  );
}
