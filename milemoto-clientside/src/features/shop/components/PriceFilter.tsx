// src/features/shop/components/PriceFilter.tsx
'use client';

import { useState } from 'react';

import { RefreshCw } from 'lucide-react';

import { Button } from '@/ui/Button';
import { Input } from '@/ui/input';

export function PriceFilter() {
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [error, setError] = useState('');
  const errorId = 'price-error';

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value)) return setError('Enter a valid number');
    if (value >= 0 && value <= maxPrice) {
      setMinPrice(value);
      setError('');
    } else setError('Minimum must be less than maximum');
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value)) return setError('Enter a valid number');
    if (value >= minPrice) {
      setMaxPrice(value);
      setError('');
    } else setError('Maximum must be greater than minimum');
  };

  const handleMinSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (value <= maxPrice) setMinPrice(value);
  };

  const handleMaxSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (value >= minPrice) setMaxPrice(value);
  };

  const handleReset = () => {
    setMinPrice(0);
    setMaxPrice(1000);
    setError('');
  };

  const presets = [
    { min: 0, max: 100 },
    { min: 100, max: 500 },
    { min: 500, max: 1000 },
  ];

  const invalid = !!error || minPrice > maxPrice;

  return (
    <div className="rounded-xl">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-foreground text-base font-semibold">Price Range</h2>

        {/* Reset → use Button (ghost) */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          title="Reset price filter"
          className="text-foreground/70 hover:text-primary gap-2 hover:bg-transparent"
        >
          <RefreshCw
            className="h-4 w-4"
            aria-hidden
          />
          Reset
        </Button>
      </div>

      {/* Inputs */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <label
            htmlFor="min"
            className="text-foreground/80 mb-1 block text-sm font-medium"
          >
            Min ($)
          </label>
          <Input
            id="min"
            type="number"
            value={minPrice}
            onChange={handleMinChange}
            aria-describedby={error ? errorId : undefined}
            inputMode="numeric"
            className="border-border bg-background text-foreground focus:border-primary w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor="max"
            className="text-foreground/80 mb-1 block text-sm font-medium"
          >
            Max ($)
          </label>
          <Input
            id="max"
            type="number"
            value={maxPrice}
            onChange={handleMaxChange}
            aria-describedby={error ? errorId : undefined}
            inputMode="numeric"
            className="border-border bg-background text-foreground focus:border-primary w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* Sliders */}
      <div className="relative mb-6">
        <div className="text-foreground/70 mb-2 flex justify-between text-xs">
          <span>$ {minPrice}</span>
          <span>$ {maxPrice}</span>
        </div>
        <div
          className="relative h-2"
          aria-hidden
          role="presentation"
        >
          <div className="bg-foreground/20 absolute inset-0 rounded-full" />
          <div
            className="bg-primary absolute h-2 rounded-full"
            style={{
              left: `${(minPrice / 1000) * 100}%`,
              width: `${((maxPrice - minPrice) / 1000) * 100}%`,
            }}
          />
          <Input
            type="range"
            min={0}
            max={1000}
            value={minPrice}
            onChange={handleMinSlider}
            aria-label="Minimum price"
            className="accent-primary absolute h-2 w-full cursor-pointer appearance-none bg-transparent"
          />
          <Input
            type="range"
            min={0}
            max={1000}
            value={maxPrice}
            onChange={handleMaxSlider}
            aria-label="Maximum price"
            className="accent-primary absolute h-2 w-full cursor-pointer appearance-none bg-transparent"
          />
        </div>
      </div>

      {error && (
        <p
          id={errorId}
          className="text-error mb-4 text-sm"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}

      {/* Presets → use Button (subtle/secondary) */}
      <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {presets.map((r, i) => {
          const active = minPrice === r.min && maxPrice === r.max;
          return (
            <Button
              key={i}
              variant={active ? 'secondary' : 'subtle'}
              size="sm"
              fullWidth
              aria-pressed={active}
              onClick={() => {
                setMinPrice(r.min);
                setMaxPrice(r.max);
                setError('');
              }}
            >
              ${r.min}–{r.max}
            </Button>
          );
        })}
      </div>

      {/* Apply → use Button (solid, full width, disabled on invalid) */}
      <Button
        variant="solid"
        justify="center"
        size="md"
        fullWidth
        disabled={invalid}
      >
        Apply
      </Button>
    </div>
  );
}
