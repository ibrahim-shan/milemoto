// src/app/account/orders/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Orders',
};

export default function OrdersPage() {
  return (
    <article className="border-border/60 bg-card rounded-xl border p-6">
      <h2 className="text-xl font-semibold tracking-tight">My Orders</h2>
      <p className="text-muted-foreground mt-2">
        This is the Orders tab content. Your recent orders will be listed here.
      </p>
    </article>
  );
}
