// src/app/shop/page.tsx
import type { Metadata } from 'next';

import { Breadcrumbs } from '@/features/navigation/Breadcrumbs';
import { ShopFiltersClient } from '@/features/shop/components/ShopFiltersClient';

export const metadata: Metadata = {
  title: 'Shop Parts',
  description: 'Browse MileMoto auto parts by category and brand.',
};

// src/app/shop/page.tsx
export default function ShopPage() {
  return (
    <main className="bg-background text-foreground mx-auto min-h-dvh max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section>
        <Breadcrumbs
          items={[{ label: 'Home', href: '/' }, { label: 'Shop Parts' }]}
          showBack
          className="pb-10"
        />
      </section>

      <section>
        <ShopFiltersClient />
      </section>
    </main>
  );
}
