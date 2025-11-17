'use client';

import Link from 'next/link';

import { Mail, MapPin, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-ink text-surface border-border/60 border-t">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-12 md:grid-cols-4">
        {/* Brand */}
        <div>
          <h2 className="font-heading mb-3 text-xl font-semibold">MileMoto</h2>
          <p className="text-ink-muted max-w-xs text-sm leading-relaxed">
            Quality auto parts, unbeatable prices, and service you can trust. Stay on the road with
            confidence—shop with us today.
          </p>
        </div>

        {/* Quick Links */}
        <nav aria-label="Quick links">
          <h3 className="text-surface mb-3 text-base font-semibold">Quick Links</h3>
          <ul className="text-ink-muted space-y-2 text-sm">
            {[
              { href: '/', label: 'Home' },
              { href: '/shop', label: 'Shop Parts' },
              { href: '/about', label: 'About Us' },
              { href: '/cart', label: 'My Cart' },
              { href: '/account', label: 'My Account' },
            ].map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="hover:text-foreground after:bg-primary dark:hover:text-accent-foreground relative transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:transition-all hover:after:w-full"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Socials */}
        <div>
          <h3 className="text-surface mb-3 text-base font-semibold">Socials</h3>
          <ul className="text-ink-muted space-y-2 text-sm">
            {['WhatsApp', 'Facebook', 'Instagram'].map(social => (
              <li key={social}>
                <a
                  href="#"
                  className="hover:text-foreground after:bg-primary dark:hover:text-accent-foreground relative transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:transition-all hover:after:w-full"
                >
                  {social}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-surface mb-3 text-base font-semibold">Contact Us</h3>
          <ul className="text-ink-muted space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="text-primary mt-[3px] h-4 w-4" />
              <span>
                123 Performance Blvd
                <br />
                Beirut, Lebanon
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="text-primary h-4 w-4" />
              <a
                href="mailto:support@milemoto.com"
                className="hover:text-foreground after:bg-primary dark:hover:text-accent-foreground relative transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:transition-all hover:after:w-full"
              >
                support@milemoto.com
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="text-primary h-4 w-4" />
              <a
                href="tel:+96170000000"
                className="hover:text-foreground after:bg-primary dark:hover:text-accent-foreground relative transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:transition-all hover:after:w-full"
              >
                +961 70 000 000
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Divider + Copyright */}
      <div className="border-border/60 text-ink-muted mt-8 border-t py-6 text-center text-xs">
        © 2025 MileMoto. All rights reserved.
      </div>
    </footer>
  );
}
