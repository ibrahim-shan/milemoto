'use client';

import { useEffect, useState } from 'react';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!mounted) {
    return (
      <span
        className={`inline-flex h-11 w-11 items-center justify-center rounded-md text-sm ${className || 'text-foreground/60'}`}
      >
        <Sun
          aria-hidden
          className="h-5 w-5"
        />
      </span>
    );
  }

  const current = resolvedTheme ?? theme ?? 'light';
  const next = current === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className={`focus-visible:ring-ring inline-flex h-11 w-11 items-center justify-center rounded-md text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none ${className || 'text-foreground/80 hover:bg-muted/50 hover:text-foreground'}`}
      aria-label={`Switch to ${next} mode`}
      aria-pressed={current === 'dark'}
      title={`Switch to ${next} mode`}
    >
      {current === 'dark' ? (
        <Moon
          aria-hidden
          className="h-5 w-5"
        />
      ) : (
        <Sun
          aria-hidden
          className="h-5 w-5"
        />
      )}
    </button>
  );
}
