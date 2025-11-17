// src/app/account/layout.tsx
import type { Metadata } from 'next';

import { AccountTabs } from '@/features/account/AccountTabs';
import { Breadcrumbs } from '@/features/navigation/Breadcrumbs';

export const metadata: Metadata = {
  title: 'My Account',
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-background text-foreground mx-auto min-h-dvh max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[{ label: 'Home', href: '/' }, { label: 'My Account' }]}
        showBack
        className="pb-6"
      />

      <h1 className="text-3xl font-bold tracking-tight">My Account</h1>

      {/* Renders the tab navigation */}
      <AccountTabs />

      {/* 'children' will be the active page (e.g., Orders page) */}
      <div className="py-6">{children}</div>
    </main>
  );
}
