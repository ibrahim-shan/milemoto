// src/components/product/ProductTabs.tsx
'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

type Tab = { label: string; content: React.ReactNode };

export function ProductTabs({ tabs, initial = 0 }: { tabs: Tab[]; initial?: number }) {
  const [i, setI] = useState(initial);
  const listRef = useRef<HTMLDivElement | null>(null);
  const id = useId();

  // Roving tabindex + arrow/Home/End keys
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setI(v => (v + 1) % tabs.length);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setI(v => (v - 1 + tabs.length) % tabs.length);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setI(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setI(tabs.length - 1);
    }
  };

  // Focus active tab when index changes
  useEffect(() => {
    const btn = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')?.item(i);
    btn?.focus();
  }, [i]);

  // Animated underline indicator (measures active tab)
  const indicatorRef = useRef<HTMLSpanElement | null>(null);
  const updateIndicator = () => {
    const list = listRef.current;
    if (!list) return;
    const btn = list.querySelectorAll<HTMLButtonElement>('[role="tab"]')?.item(i);
    if (!btn || !indicatorRef.current) return;
    const parentRect = list.getBoundingClientRect();
    const rect = btn.getBoundingClientRect();
    const left = rect.left - parentRect.left + list.scrollLeft;
    indicatorRef.current.style.transform = `translateX(${left}px)`;
    indicatorRef.current.style.width = `${rect.width}px`;
  };

  useLayoutEffect(() => {
    updateIndicator();
    const ro = new ResizeObserver(updateIndicator);
    if (listRef.current) ro.observe(listRef.current);
    const onResize = () => updateIndicator();
    window.addEventListener('resize', onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, tabs.length]);

  return (
    <section className="border-border/60 bg-card mt-8 rounded-xl border">
      <div
        ref={listRef}
        role="tablist"
        aria-orientation="horizontal"
        aria-label="Product details"
        onKeyDown={onKey}
        className="border-border/70 no-scrollbar relative flex gap-6 overflow-x-auto overflow-y-hidden border-b px-4 pt-3"
      >
        <span
          ref={indicatorRef}
          aria-hidden
          className="bg-primary pointer-events-none absolute bottom-0 left-0 h-px w-0 rounded-full transition-transform duration-200 ease-out"
        />
        {tabs.map((t, idx) => {
          const active = i === idx;
          return (
            <button
              key={t.label}
              role="tab"
              id={`${id}-tab-${idx}`}
              aria-selected={active}
              aria-controls={`${id}-panel-${idx}`}
              tabIndex={active ? 0 : -1}
              onClick={() => setI(idx)}
              className={cn(
                'relative -mb-px border-b-2 border-transparent px-1 pb-2 text-sm font-semibold outline-none',
                active
                  ? 'text-foreground'
                  : 'text-foreground/70 hover:text-foreground focus-visible:text-foreground',
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="text-foreground/80 p-4 text-sm leading-6">
        {tabs.map((t, idx) => {
          const active = i === idx;
          return (
            <div
              key={t.label}
              role="tabpanel"
              id={`${id}-panel-${idx}`}
              aria-labelledby={`${id}-tab-${idx}`}
              hidden={!active}
            >
              {active ? t.content : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
