// src/components/navigation/Breadcrumbs.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ChevronLeft } from 'lucide-react';

import { Button } from '@/ui/Button';

export type Crumb = { label: string; href?: string };
export type BreadcrumbsProps = {
  items: Crumb[];
  showBack?: boolean;
  backHref?: string;
  className?: string;
};

export function Breadcrumbs({ items, showBack = true, backHref, className }: BreadcrumbsProps) {
  const router = useRouter();

  return (
    <div className={`max-w-full ${className ?? ''}`}>
      <div className="flex items-center gap-2 sm:gap-4">
        {showBack &&
          (backHref ? (
            <Button
              href={backHref}
              variant="subtle"
              size="sm"
              className="px-2.5 sm:px-3"
            >
              <ChevronLeft
                className="mr-1 h-4 w-4"
                aria-hidden
              />
              <span className="hidden sm:inline">Go Back</span>
              <span className="sr-only sm:hidden">Go Back</span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="subtle"
              size="sm"
              onClick={() => router.back()}
              className="px-2.5 sm:px-3"
              aria-label="Go back"
            >
              <ChevronLeft
                className="mr-1 h-4 w-4"
                aria-hidden
              />
              <span className="hidden sm:inline">Go Back</span>
            </Button>
          ))}

        <nav
          aria-label="Breadcrumb"
          className="min-w-0 flex-1 overflow-x-auto text-xs sm:text-sm"
        >
          <ol className="flex items-center gap-1.5 whitespace-nowrap sm:gap-2">
            {items.map((item, idx) => {
              const isLast = idx === items.length - 1;
              const content = isLast ? (
                <span
                  className="text-foreground/90 max-w-[50vw] font-medium sm:max-w-none"
                  aria-current="page"
                  title={item.label}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href || '#'}
                  className="text-foreground/70 hover:text-foreground max-w-[40vw] font-medium transition-colors sm:max-w-none"
                  title={item.label}
                >
                  {item.label}
                </Link>
              );

              return (
                <li
                  key={`${item.label}-${idx}`}
                  className="flex min-w-0 items-center gap-1.5 sm:gap-2"
                >
                  {content}
                  {!isLast && (
                    <span
                      aria-hidden
                      className="text-foreground/40"
                    >
                      /
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
