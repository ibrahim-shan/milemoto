// src/features/layout/desktop-search.tsx
'use client';

import { createContext, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';

import { Search } from 'lucide-react';

import { Button } from '@/ui/Button';
import { Input } from '@/ui/input';

type Ctx = { open: boolean; toggle: () => void };
const DesktopSearchCtx = createContext<Ctx | null>(null);

export function DesktopSearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const regionId = useId();
  const inputId = `${regionId}-input`;

  // focus when opened
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(v => !v);
      }
      // quick open with "/" when not typing in an input/textarea
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const t = e.target as HTMLElement | null;
        const tag = (t?.tagName || '').toLowerCase();
        if (!['input', 'textarea', 'select'].includes(tag)) {
          e.preventDefault();
          setOpen(true);
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const value = useMemo<Ctx>(() => ({ open, toggle: () => setOpen(v => !v) }), [open]);

  return (
    <DesktopSearchCtx.Provider value={value}>
      {children}
      {/* Collapsible search region directly under header width */}
      <div
        id={regionId}
        aria-hidden={!open}
        data-open={open ? 'true' : 'false'}
        className="mx-auto w-full max-w-7xl px-4"
      >
        <div
          className={
            'overflow-hidden transition-[max-height,opacity] duration-200 ' +
            (open
              ? 'max-h-16 opacity-100 ease-out'
              : 'pointer-events-none max-h-0 opacity-0 ease-in')
          }
        >
          <form
            role="search"
            className="py-3"
            aria-label="Desktop search"
          >
            <label
              htmlFor={inputId}
              className="sr-only"
            >
              Search
            </label>
            <div className="relative">
              <Search
                className="text-foreground/60 pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                aria-hidden
              />
              <Input
                id={inputId}
                ref={inputRef}
                type="search"
                placeholder="Search products…"
                className="border-border bg-background text-foreground placeholder:text-foreground/50 focus:border-primary h-10 w-full rounded-md border pr-3 pl-9 text-sm outline-none"
                aria-label="Search products"
              />
            </div>
          </form>
        </div>
      </div>
    </DesktopSearchCtx.Provider>
  );
}

export function SearchButton({ className = '' }: { className?: string }) {
  const ctx = useContext(DesktopSearchCtx);
  if (!ctx) return null;
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      icon
      onClick={ctx.toggle}
      aria-expanded={ctx.open}
      aria-controls={undefined} // region is nearby; aria-controls optional here
      aria-label="Toggle search (⌘K)"
      title="Search (⌘K)"
      className={className || 'text-foreground/80 hover:bg-muted/50 hover:text-foreground'}
    >
      <Search
        aria-hidden
        className="h-5 w-5"
      />
    </Button>
  );
}

export default DesktopSearchProvider;
