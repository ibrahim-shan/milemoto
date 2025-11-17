// src/features/layout/header/Header.tsx
'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { ShoppingCart, User as UserIcon } from 'lucide-react';

import { useCart } from '@/features/cart/cart-context';
import { CartDrawer } from '@/features/cart/components/CartDrawer';
import { DesktopSearchProvider, SearchButton } from '@/features/layout/desktop-search';
import { MobileNav } from '@/features/layout/mobile-nav';
import { useAuth } from '@/hooks/useAuth';

function IconButton({
  label,
  onClick,
  children,
  variant = 'default',
  disabled = false,
}: {
  label: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: 'default' | 'home';
  disabled?: boolean;
}) {
  const base =
    'inline-flex h-11 w-11 items-center justify-center rounded-md text-sm transition-colors focus:outline-none focus-visible:outline-none';
  const theme =
    variant === 'home'
      ? 'text-white/90 hover:bg-white/10 hover:text-white'
      : 'text-foreground/80 hover:bg-muted/50 hover:text-foreground';
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled}
      disabled={disabled}
      className={`${base} ${theme} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      {children}
    </button>
  );
}
function AccountMenu({
  variant = 'default',
  authed,
  onLogout,
}: {
  variant?: 'default' | 'home';
  authed: boolean;
  onLogout: () => void;
}) {
  const shell =
    variant === 'home'
      ? 'invisible absolute right-0 z-50 mt-2 w-48 translate-y-1 rounded-md border border-white/30 bg-black/60 p-1 opacity-0 shadow-xl backdrop-blur transition-all duration-150 outline-none group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 focus-within:visible focus-within:translate-y-0 focus-within:opacity-100'
      : 'invisible absolute right-0 z-50 mt-2 w-48 translate-y-1 rounded-md border border-border/60 bg-card p-1 opacity-0 shadow-xl transition-all duration-150 outline-none group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 focus-within:visible focus-within:translate-y-0 focus-within:opacity-100';

  const item =
    variant === 'home'
      ? 'block rounded-[8px] px-3 py-2 text-sm text-white/90 transition-colors hover:bg-white/10 hover:text-white'
      : 'block rounded-[8px] px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-muted/60 hover:text-foreground';

  return (
    <div className="group relative">
      <IconButton
        label="Account"
        variant={variant === 'home' ? 'home' : 'default'}
      >
        <UserIcon
          aria-hidden
          className="h-5 w-5"
        />
      </IconButton>
      <div
        role="menu"
        aria-label="Account menu"
        className={shell}
      >
        {authed ? (
          <>
            <Link
              href="/account"
              role="menuitem"
              className={item}
            >
              My Account
            </Link>
            <Link
              href="/account/orders"
              role="menuitem"
              className={item}
            >
              My Orders
            </Link>
            <button
              type="button"
              role="menuitem"
              className={item}
              onClick={onLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/signin"
              role="menuitem"
              className={item}
            >
              Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const { items, removeItem, clear } = useCart();
  const isHome = pathname === '/';
  const isCart = pathname?.startsWith('/cart') || pathname === '/cart';

  const [cartOpen, setCartOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setCartOpen(false);
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  const headerWrap = isHome
    ? 'sticky top-0 z-40 w-full bg-transparent md:absolute md:top-0'
    : 'sticky top-0 z-40 w-full bg-transparent backdrop-blur supports-backdrop-filter:bg-transparent';

  const innerBar = isHome
    ? 'mx-auto hidden h-14 max-w-7xl grid-cols-3 items-center px-4 md:grid'
    : 'mx-auto mt-3 hidden h-14 max-w-7xl grid-cols-3 items-center rounded-xl border border-border/60 bg-card/80 px-4 shadow-sm supports-backdrop-filter:bg-card/60 md:grid';

  const logoText = isHome
    ? 'text-xl font-bold tracking-tight text-white'
    : 'text-xl font-bold tracking-tight text-foreground';
  const navList = isHome
    ? 'flex items-center gap-8 text-sm font-semibold text-white/90'
    : 'flex items-center gap-8 text-sm font-semibold text-foreground/80';
  const linkFx = isHome
    ? 'relative transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:text-white hover:after:w-full'
    : 'relative transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:text-foreground hover:after:w-full';

  return (
    <header className={headerWrap}>
      <div className="md:hidden">
        <MobileNav
          onToggleCart={() => {
            if (!isCart) setCartOpen(v => !v);
          }}
          cartOpen={!isCart && cartOpen}
        />
      </div>

      <DesktopSearchProvider>
        <div className={innerBar}>
          <div className="min-w-[120px] justify-self-start">
            <Link
              href="/"
              aria-label="MileMoto Home"
              className="inline-flex items-center gap-2"
            >
              <span className={logoText}>MileMoto</span>
            </Link>
          </div>

          <nav
            aria-label="Primary"
            className="hidden justify-self-center md:block"
          >
            <ul className={navList}>
              {[
                { href: '/shop', label: 'Shop Parts' },
                { href: '/about', label: 'About Us' },
                { href: '/contact', label: 'Contact Us' },
              ].map(l => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={linkFx}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex min-w-[320px] items-center justify-end gap-2 justify-self-end">
            <SearchButton
              {...(isHome ? { className: 'text-white/90 hover:bg-white/10 hover:text-white' } : {})}
            />
            <span
              className={isHome ? 'h-5 w-px bg-white/30' : 'bg-border/70 h-5 w-px'}
              aria-hidden="true"
            />
            <IconButton
              label="Open cart"
              onClick={() => {
                if (!isCart) setCartOpen(true);
              }}
              variant={isHome ? 'home' : 'default'}
              disabled={isCart}
            >
              <ShoppingCart
                aria-hidden
                className="h-5 w-5"
              />
            </IconButton>
            <span
              className={isHome ? 'h-5 w-px bg-white/30' : 'bg-border/70 h-5 w-px'}
              aria-hidden="true"
            />
            {/* <span
              className={isHome ? 'h-5 w-px bg-white/30' : 'bg-border/70 h-5 w-px'}
              aria-hidden="true"
            />
            <ThemeToggle
              className={isHome ? 'text-white/90 hover:bg-white/10 hover:text-white' : undefined}
            /> */}
            <AccountMenu
              variant={isHome ? 'home' : 'default'}
              authed={isAuthenticated}
              onLogout={handleLogout}
            />
          </div>
        </div>

        {!isCart && (
          <CartDrawer
            open={cartOpen}
            onClose={() => setCartOpen(false)}
            items={items}
            onRemove={removeItem}
            onCheckout={() => {
              setCartOpen(false);
              clear();
              location.assign('/checkout');
            }}
          />
        )}
      </DesktopSearchProvider>
    </header>
  );
}

export default Header;
