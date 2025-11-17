// src/app/account/orders/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Support',
};

export default function SupportPage() {
  return (
    <article className="border-border/60 bg-card rounded-xl border p-6">
      <h2 className="text-xl font-semibold tracking-tight">My Support</h2>
      <p className="text-muted-foreground mt-2">
        This is the Support tab content. Your recent orders will be listed here.
      </p>
    </article>
  );
}
