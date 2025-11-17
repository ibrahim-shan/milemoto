// src/features/layout/mobile-nav.tsx
'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';

import { Heart, Home, Search, ShoppingCart, User as UserIcon } from 'lucide-react';

import { Input } from '@/ui/input';

export function MobileNav({
  onToggleCart,
  cartOpen,
}: {
  onToggleCart: () => void;
  cartOpen: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const searchId = useId();
  const searchPanelId = `${searchId}-panel`;
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const topBarRef = useRef<HTMLDivElement | null>(null);
  const topSpacerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    const id = requestAnimationFrame(() => searchInputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [searchOpen]);

  useEffect(() => {
    const sync = () => {
      const h = topBarRef.current?.offsetHeight ?? 0;
      if (topSpacerRef.current) topSpacerRef.current.style.height = `${h}px`;
    };
    sync();
    const ro = new ResizeObserver(sync);
    if (topBarRef.current) ro.observe(topBarRef.current);
    window.addEventListener('resize', sync);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', sync);
    };
  }, []);

  // match bottom nav background when scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 2);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const topChrome = scrolled
    ? 'mx-auto w-full max-w-7xl border-b border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80'
    : 'mx-auto w-full max-w-7xl border border-border/60 bg-card supports-backdrop-filter:bg-card/60';

  return (
    <div className="md:hidden">
      {/* Fixed top bar */}
      <div
        ref={topBarRef}
        className="fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)]"
      >
        <div className={topChrome}>
          <div className="flex h-14 items-center justify-between px-3">
            <Link
              href="/"
              aria-label="MileMoto Home"
              className="inline-flex items-center gap-2"
            >
              <span className="text-foreground text-xl font-bold tracking-tight">MileMoto</span>
            </Link>
            <button
              type="button"
              onClick={() => setSearchOpen(v => !v)}
              aria-controls={searchPanelId}
              aria-expanded={searchOpen}
              aria-label="Toggle search"
              title="Search"
              className="border-border text-foreground/80 hover:bg-muted/50 hover:text-foreground inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors"
            >
              <Search
                className="h-5 w-5"
                aria-hidden
              />
            </button>
          </div>

          <div
            id={searchPanelId}
            className={
              'overflow-hidden transition-all duration-200 ' +
              (searchOpen
                ? 'max-h-20 opacity-100 ease-out'
                : 'pointer-events-none max-h-0 opacity-0 ease-in')
            }
          >
            <form
              role="search"
              className="px-3 py-3"
              aria-label="Mobile search"
            >
              <label
                htmlFor={`${searchId}-input`}
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
                  id={`${searchId}-input`}
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search products..."
                  className="border-border bg-background text-foreground placeholder:text-foreground/50 focus:border-primary h-10 w-full rounded-md border pr-3 pl-9 text-sm outline-none focus:ring-0 focus:outline-none"
                  aria-label="Search products"
                />
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Spacer for fixed top bar */}
      <div
        ref={topSpacerRef}
        className="h-[128px] md:hidden"
        aria-hidden
      />

      {/* Bottom tabs */}
      {mounted
        ? createPortal(
            <nav
              aria-label="App tabs"
              className="border-border bg-card/95 supports-backdrop-filter:bg-card/80 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur md:hidden"
            >
              <ul className="mx-auto grid max-w-7xl grid-cols-4 py-1">
                <li className="flex items-center justify-center">
                  <Link
                    href="/"
                    className="text-foreground/80 hover:text-foreground flex h-12 w-full max-w-[120px] flex-col items-center justify-center gap-0.5"
                  >
                    <Home
                      className="h-5 w-5"
                      aria-hidden
                    />
                    <span className="text-[11px]">Home</span>
                  </Link>
                </li>

                <li className="flex items-center justify-center">
                  <button
                    type="button"
                    onClick={onToggleCart}
                    aria-controls="cart-drawer"
                    aria-expanded={cartOpen}
                    aria-label="Cart"
                    title="Cart"
                    className="text-foreground/80 hover:text-foreground flex h-12 w-full max-w-[120px] flex-col items-center justify-center gap-0.5"
                  >
                    <ShoppingCart
                      className="h-5 w-5"
                      aria-hidden
                    />
                    <span className="text-[11px]">Cart</span>
                  </button>
                </li>

                <li className="flex items-center justify-center">
                  <Link
                    href="/favorites"
                    className="text-foreground/80 hover:text-foreground flex h-12 w-full max-w-[120px] flex-col items-center justify-center gap-0.5"
                  >
                    <Heart
                      className="h-5 w-5"
                      aria-hidden
                    />
                    <span className="text-[11px]">Favorites</span>
                  </Link>
                </li>
                <li className="flex items-center justify-center">
                  <Link
                    href="/account"
                    className="text-foreground/80 hover:text-foreground flex h-12 w-full max-w-[120px] flex-col items-center justify-center gap-0.5"
                  >
                    <UserIcon
                      className="h-5 w-5"
                      aria-hidden
                    />
                    <span className="text-[11px]">Account</span>
                  </Link>
                </li>
              </ul>
              <div className="h-[env(safe-area-inset-bottom)]" />
            </nav>,
            document.body,
          )
        : null}
    </div>
  );
}

export default MobileNav;
