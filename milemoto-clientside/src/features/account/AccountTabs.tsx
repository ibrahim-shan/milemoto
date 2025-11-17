// src/features/account/AccountTabs.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { motion } from 'framer-motion';

// 1. Define the tabs with their paths
const tabs = [
  { label: 'Orders', href: '/account/orders' },
  { label: 'Payment Methods', href: '/account/payment-methods' },
  { label: 'Address', href: '/account/address' },
  { label: 'Profile Settings', href: '/account/profile' },
  { label: 'Support', href: '/account/support' },
];

export function AccountTabs() {
  const pathname = usePathname();

  // Find the active tab index
  let activeIndex = tabs.findIndex(tab => pathname === tab.href);
  // Default to first tab (Orders) if on base /account page
  if (activeIndex === -1 && pathname === '/account') {
    activeIndex = 0;
  }

  return (
    <nav
      className="border-border/60 relative -mb-px flex space-x-6 border-b"
      aria-label="Account navigation tabs"
      role="tablist"
    >
      {tabs.map((tab, index) => (
        <Link
          key={tab.label}
          href={tab.href}
          role="tab"
          aria-selected={activeIndex === index}
          className={`relative border-b-2 border-transparent px-1 py-4 text-sm font-medium transition-colors duration-150 ${
            activeIndex === index
              ? 'text-primary' // Active text
              : 'text-muted-foreground hover:text-foreground' // Inactive text
          } `}
        >
          {/* The text label */}
          {tab.label}

          {/* The Animated Underline */}
          {activeIndex === index && (
            <motion.div
              layoutId="account-tab-underline"
              className="bg-primary absolute right-0 -bottom-px left-0 h-0.5"
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />
          )}
        </Link>
      ))}
    </nav>
  );
}
