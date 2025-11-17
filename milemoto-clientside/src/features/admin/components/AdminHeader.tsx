'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Menu, User } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/ui/Button';

/**
 * A self-contained Account Menu for the Admin Header.
 * It uses the 'group-hover' CSS pattern from your main site header.
 */
function AdminAccountMenu() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/signin'); // Redirect to signin after admin logout
  };

  // Classes for the dropdown shell
  const shell =
    'invisible absolute right-0 z-50 mt-2 w-48 translate-y-1 rounded-md border border-border/60 bg-card p-1 opacity-0 shadow-xl transition-all duration-150 outline-none group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 focus-within:visible focus-within:translate-y-0 focus-within:opacity-100';

  // Classes for dropdown items
  const item =
    'block w-full rounded-[8px] px-3 py-2 text-left text-sm text-foreground/80 transition-colors hover:bg-muted/60 hover:text-foreground';

  return (
    <div className="group relative">
      {/* The Icon Button Trigger */}
      <Button
        variant="ghost"
        size="sm"
        className="rounded-full"
        aria-label="User account menu"
      >
        <User className="h-5 w-5" />
      </Button>

      {/* The Dropdown Menu */}
      <div
        role="menu"
        aria-label="Account menu"
        className={shell}
      >
        <Link
          href="/account" // Links to the user's public-facing account page
          role="menuitem"
          className={item}
        >
          My Account
        </Link>
        <button
          type="button"
          role="menuitem"
          className={item}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

// --- Main AdminHeader Component ---

type Props = {
  onToggleSidebar: () => void;
};

export function AdminHeader({ onToggleSidebar }: Props) {
  return (
    <header className="border-border/60 bg-card sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 md:justify-end">
      {/* Mobile Menu Toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden"
        onClick={onToggleSidebar}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>

      {/* User Menu (Updated) */}
      <AdminAccountMenu />
    </header>
  );
}
