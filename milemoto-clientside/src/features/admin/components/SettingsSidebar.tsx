'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Banknote,
  BellDot,
  BrickWallShieldIcon,
  Building,
  ChevronRight,
  CreditCard,
  LanguagesIcon,
  LocationEdit,
  Palette,
  PercentDiamond,
  Ruler,
  Ship,
  Users,
} from 'lucide-react';

import { cn } from '@/lib/utils';

// 1. Define all your settings links
const settingsNav: Array<{ href: string; label: string; icon: ReactNode }> = [
  {
    href: '/admin/settings/company',
    label: 'Company Details',
    icon: <Building className="h-4 w-4" />,
  },
  {
    href: '/admin/settings/site-settings',
    label: 'Site Settings',
    icon: <Palette className="h-4 w-4" />,
  },
  {
    href: '/admin/settings/users',
    label: 'Users',
    icon: <Users className="h-4 w-4" />,
  },
  {
    href: '/admin/settings/payments',
    label: 'Payments',
    icon: <CreditCard className="h-4 w-4" />,
  },
  {
    href: '/admin/settings/location-setup',
    label: 'Location Setup',
    icon: <LocationEdit className="h-4 w-4" />,
  },
  {
    href: '/admin/settings/shipping',
    label: 'Shipping Setup',
    icon: <Ship className="h-4 w-4" />,
  },
  {
    href: '/admin/settings/units',
    label: 'Units',
    icon: <Ruler className="h-4 w-4" />,
  },
  {
    href: '/admin/settings/taxes',
    label: 'Taxes & Duties',
    icon: <PercentDiamond className="h-4 w-4" />,
  },
  {
    href: '/admin/settings/currencies',
    label: 'Currencies',
    icon: <Banknote className="h-4 w-4" />,
  },
  {
    href: '/admin/settings/notifications',
    label: 'Notifications',
    icon: <BellDot className="h-4 w-4" />,
  },
  {
    href: '/admin/settings/languages',
    label: 'Languages',
    icon: <LanguagesIcon className="h-4 w-4" />,
  },
  {
    href: '/admin/settings/security',
    label: 'Security',
    icon: <BrickWallShieldIcon className="h-4 w-4" />,
  },
];

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col space-y-1">
      {settingsNav.map(item => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-secondary text-secondary-foreground'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            )}
          >
            <div className="flex items-center gap-2">
              {item.icon}
              {item.label}
            </div>
            <ChevronRight className="h-4 w-4" />
          </Link>
        );
      })}
    </nav>
  );
}
