// src/app/contact/page.tsx
import type { Metadata } from 'next';

import { ContactAside } from '@/features/contact/components/ContactAside';
import { ContactForm } from '@/features/contact/components/ContactForm';
import { Breadcrumbs } from '@/features/navigation/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get help with orders, returns, and fitment. Our team replies fast.',
};

export default function ContactPage() {
  return (
    <main className="bg-background text-foreground mx-auto min-h-dvh max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section>
        <Breadcrumbs
          items={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
          className="pb-10"
        />
        <header className="mt-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Contact MileMoto</h1>
          <p className="text-muted-foreground mt-2">
            Ask about orders, returns, or part fitment. Average reply time 2 hours.
          </p>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
          <ContactForm />
          <ContactAside />
        </div>
      </section>
    </main>
  );
}
