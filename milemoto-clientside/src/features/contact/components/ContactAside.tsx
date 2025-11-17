// src/features/contact/ContactAside.tsx
import Link from 'next/link';

import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';

export function ContactAside() {
  const headingId = 'contact-aside-heading';
  return (
    <aside
      className="border-border bg-card rounded-2xl border p-6 md:p-8"
      aria-labelledby={headingId}
    >
      <h2
        id={headingId}
        className="text-xl font-semibold tracking-tight"
      >
        Other ways to reach us
      </h2>

      <ul className="mt-4 space-y-4">
        <Item
          icon={
            <Mail
              className="h-5 w-5"
              aria-hidden
            />
          }
          title="Email"
          body={
            <Link
              href="mailto:support@milemoto.com"
              className="underline"
            >
              support@milemoto.com
            </Link>
          }
        />
        <Item
          icon={
            <Phone
              className="h-5 w-5"
              aria-hidden
            />
          }
          title="Phone"
          body={<span>+961 1 234 567</span>}
        />
        <Item
          icon={
            <MessageCircle
              className="h-5 w-5"
              aria-hidden
            />
          }
          title="WhatsApp"
          body={
            <Link
              href="https://wa.me/9611234567"
              className="underline"
            >
              Chat on WhatsApp
            </Link>
          }
        />
        <Item
          icon={
            <Clock
              className="h-5 w-5"
              aria-hidden
            />
          }
          title="Support hours"
          body={<span>Mon–Fri 09:00–18:00 EET</span>}
        />
        <Item
          icon={
            <MapPin
              className="h-5 w-5"
              aria-hidden
            />
          }
          title="Address"
          body={<span>Business Bay, Dubai · Office 1013</span>}
        />
      </ul>

      <div className="border-border bg-background mt-6 rounded-xl border p-4">
        <p className="text-sm">
          Need a return label? Read our{' '}
          <Link
            href="/returns"
            className="underline"
          >
            Returns Policy
          </Link>
          .
        </p>
      </div>
    </aside>
  );
}

function Item({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="bg-primary/10 text-primary inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
        {icon}
      </span>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-muted-foreground text-sm">{body}</p>
      </div>
    </li>
  );
}
