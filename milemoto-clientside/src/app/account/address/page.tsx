// src/app/account/orders/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Address',
};

export default function AddressPage() {
  return (
    <article className="border-border/60 bg-card rounded-xl border p-6">
      <h2 className="text-xl font-semibold tracking-tight">My Address</h2>
      <p className="text-muted-foreground mt-2">
        This is the Address tab content. Your recent orders will be listed here.
      </p>
    </article>
  );
}
