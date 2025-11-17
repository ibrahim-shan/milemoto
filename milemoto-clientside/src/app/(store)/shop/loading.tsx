// src/app/shop/loading.tsx
import { ShopFiltersSkeleton } from '@/features/feedback/ShopFiltersSkeleton';
import { Breadcrumbs } from '@/features/navigation/Breadcrumbs';

export default function Loading() {
  return (
    <main className="bg-background text-foreground">
      <section className="mx-auto max-w-7xl py-12">
        <Breadcrumbs
          items={[{ label: 'Home', href: '/' }, { label: 'Shop Parts' }]}
          showBack
          className="mb-4"
        />
        <ShopFiltersSkeleton />
      </section>
    </main>
  );
}
