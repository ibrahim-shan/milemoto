// src/app/shop/ShopFiltersClient.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

import { ChevronDown, Search } from 'lucide-react';
import { toast } from 'sonner';

import { useCart } from '@/features/cart/cart-context';
import { ProductsGrid } from '@/features/shop/components/ProductsGrid';
import { ShopFilters } from '@/features/shop/components/ShopFilters';
import { Input } from '@/ui/input';

type SortKey = 'default' | 'price-asc' | 'price-desc' | 'title-asc';
// src/app/shop/ShopFiltersClient.tsx
// -- use this SortMenu (drop-in replacement for the select) --
function SortMenu({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const btnId = 'sort-trigger';
  const menuId = 'sort-menu';

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const el = ref.current;
      if (el && !el.contains(e.target as Node)) setOpen(false);
    }

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && open) {
        const items = Array.from(
          document.querySelectorAll<HTMLButtonElement>(`#${menuId} [role="menuitemradio"]`),
        );
        items.at(0)?.focus(); // safe focus, no TS2532
        // Or:
        // const first = items[0];
        // if (first) first.focus();
      }
    }

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const opts: [SortKey, string][] = [
    ['default', 'Default'],
    ['price-asc', 'Price: Low to High'],
    ['price-desc', 'Price: High to Low'],
    ['title-asc', 'Title: A–Z'],
  ];
  const label = opts.find(o => o[0] === value)?.[1] ?? 'Default';

  return (
    <div
      className="relative"
      ref={ref}
    >
      <button
        id={btnId}
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        title="Open sort options"
        className="border-border bg-background text-foreground hover:bg-muted/50 hover:dark:bg-card inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm focus:outline-none"
      >
        <span className="text-foreground/70">Sort</span>
        <span className="font-medium">{label}</span>
        <ChevronDown
          aria-hidden
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        id={menuId}
        role="menu"
        aria-labelledby={btnId}
        aria-orientation="vertical"
        className={`${
          open ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-1 opacity-0'
        } border-border/60 bg-card absolute right-0 z-50 mt-2 w-56 rounded-md border p-1 shadow-xl transition-all duration-150 outline-none`}
      >
        {opts.map(([key, text]) => (
          <button
            key={key}
            type="button"
            role="menuitemradio"
            aria-checked={value === key}
            tabIndex={open ? 0 : -1}
            onClick={() => {
              onChange(key);
              setOpen(false);
            }}
            className="text-foreground/80 hover:bg-muted/60 hover:text-foreground block w-full rounded-[8px] px-3 py-2 text-left text-sm transition-colors"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ShopFiltersClient() {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<SortKey>('default');
  const { addItem } = useCart();

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr]">
      <aside
        aria-labelledby="filters-heading"
        className="h-fit md:sticky md:top-24"
      >
        <h2
          id="filters-heading"
          className="sr-only"
        >
          Shop filters
        </h2>
        <ShopFilters />
      </aside>

      <div className="min-w-0">
        {/* top bar: search + sort */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative w-full sm:max-w-md">
            <label
              htmlFor="product-search-input"
              className="sr-only"
            >
              Search products
            </label>
            <Search
              aria-hidden
              className="text-foreground/50 pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
            />
            <Input
              id="product-search-input"
              type="search"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search by name, model, etc"
              className="border-border bg-background text-foreground focus:border-primary w-full rounded-md border py-2 pr-3 pl-9 text-sm focus:outline-none"
            />
          </div>

          {/* Sort */}
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <SortMenu
              value={sort}
              onChange={setSort}
            />
          </div>
        </div>

        <ProductsGrid
          query={q}
          sort={sort}
          cardVariant="inline"
          onAdd={p => {
            const slug = p.href.split('/').filter(Boolean).pop() ?? p.href;
            addItem({
              slug,
              title: p.title,
              priceMinor: p.priceMinor,
              imageSrc: p.imageSrc,
              qty: 1,
            });
            toast.success('Added to cart.');
          }}
        />
      </div>
    </div>
  );
}
