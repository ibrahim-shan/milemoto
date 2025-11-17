'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Barcode,
  Box,
  Boxes,
  ChevronDown,
  ClipboardList,
  Cookie,
  File,
  FileText,
  Grip,
  LayoutDashboard,
  LifeBuoy,
  LineChart,
  MapPin,
  Megaphone,
  Network,
  Package,
  Paintbrush,
  Percent,
  Settings,
  Share2,
  ShoppingCart,
  Star,
  Store,
  Tags,
  Users,
  Warehouse,
  X,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/ui/Button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/collapsible';

type NavGroupProps = {
  title: string;
  icon: React.ReactNode;
  links: { href: string; label: string; icon: React.ReactNode }[];
};

function NavGroup({ title, icon, links }: NavGroupProps) {
  const pathname = usePathname();
  const isGroupActive = links.some(l => pathname.startsWith(l.href));
  const [isOpen, setIsOpen] = useState(isGroupActive);

  useEffect(() => {
    setIsOpen(isGroupActive);
  }, [isGroupActive]);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full"
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          justify="between"
          className="px-3"
          leftIcon={icon}
          rightIcon={
            <ChevronDown
              className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')}
              aria-hidden
            />
          }
          aria-expanded={isOpen}
        >
          <span className="inline-flex items-center gap-2 leading-none">{title}</span>
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-1 space-y-1 pl-5">
          {links.map(link => (
            <NavItem
              key={link.href}
              href={link.href}
              label={link.label}
              icon={link.icon}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function NavItem({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = href === '/admin/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <Button
      href={href}
      variant={isActive ? 'secondary' : 'ghost'}
      className="flex w-full items-center justify-start gap-3 px-3"
      size="sm"
      leftIcon={icon}
    >
      {label}
    </Button>
  );
}

export function AdminSidebar({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={() => onOpenChange(false)}
            aria-hidden
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'border-border/60 bg-card fixed inset-y-0 left-0 z-50 flex w-64 -translate-x-full flex-col border-r transition-transform duration-300 ease-in-out md:translate-x-0',
          open && 'translate-x-0',
        )}
        aria-label="Admin sidebar"
      >
        <div className="flex h-16 items-center justify-between border-b px-6">
          <Link
            href="/admin/dashboard"
            className="text-lg font-bold tracking-tight"
          >
            MileMoto Admin
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        {/* This nav section now contains the full structure.
          All items will be perfectly aligned.
        */}
        <nav
          className="flex-1 space-y-2 overflow-y-auto p-3"
          aria-label="Admin navigation"
        >
          <NavItem
            href="/admin/dashboard"
            label="Dashboard"
            icon={<LayoutDashboard className="h-4 w-4" />}
          />

          <NavGroup
            title="Sales"
            icon={<ShoppingCart className="h-4 w-4" />}
            links={[
              {
                href: '/admin/orders',
                label: 'Orders',
                icon: <ShoppingCart className="h-4 w-4" />,
              },
              {
                href: '/admin/invoices',
                label: 'Invoices',
                icon: <FileText className="h-4 w-4" />,
              },
            ]}
          />

          <NavGroup
            title="Products"
            icon={<Package className="h-4 w-4" />}
            links={[
              {
                href: '/admin/products',
                label: 'Products',
                icon: <Box className="h-4 w-4" />,
              },
              {
                href: '/admin/categories',
                label: 'Categories',
                icon: <Warehouse className="h-4 w-4" />,
              },
              {
                href: '/admin/brands',
                label: 'Brands',
                icon: <Tags className="h-4 w-4" />,
              },
              {
                href: '/admin/variants',
                label: 'Variants',
                icon: <Network className="h-4 w-4" />,
              },
              {
                href: '/admin/collections',
                label: 'Collections',
                icon: <Grip className="h-4 w-4" />,
              },
              {
                href: '/admin/reviews',
                label: 'Reviews',
                icon: <Star className="h-4 w-4" />,
              },
            ]}
          />

          <NavGroup
            title="Inventory"
            icon={<Boxes className="h-4 w-4" />}
            links={[
              {
                href: '/admin/stock',
                label: 'Stock',
                icon: <ClipboardList className="h-4 w-4" />,
              },
              {
                href: '/admin/locations',
                label: 'Locations',
                icon: <MapPin className="h-4 w-4" />,
              },
              {
                href: '/admin/barcodes',
                label: 'Barcodes',
                icon: <Barcode className="h-4 w-4" />,
              },
            ]}
          />

          <NavGroup
            title="Customers"
            icon={<Users className="h-4 w-4" />}
            links={[
              {
                href: '/admin/customers',
                label: 'Customers',
                icon: <Users className="h-4 w-4" />,
              },
              {
                href: '/admin/tickets',
                label: 'Support Tickets',
                icon: <LifeBuoy className="h-4 w-4" />,
              },
            ]}
          />

          <NavGroup
            title="Marketing"
            icon={<Megaphone className="h-4 w-4" />}
            links={[
              {
                href: '/admin/discounts',
                label: 'Discounts',
                icon: <Percent className="h-4 w-4" />,
              },
              {
                href: '/admin/social-media',
                label: 'Social Media',
                icon: <Share2 className="h-4 w-4" />,
              },
            ]}
          />

          <NavGroup
            title="Storefront"
            icon={<Store className="h-4 w-4" />}
            links={[
              {
                href: '/admin/pages',
                label: 'Pages',
                icon: <File className="h-4 w-4" />,
              },

              {
                href: '/admin/settings/theme',
                label: 'Theme',
                icon: <Paintbrush className="h-4 w-4" />,
              },
              {
                href: '/admin/cookie-banner',
                label: 'Cookie Banner',
                icon: <Cookie className="h-4 w-4" />,
              },
            ]}
          />

          <NavItem
            href="/admin/analytics"
            label="Analytics"
            icon={<LineChart className="h-4 w-4" />}
          />
          <NavItem
            href="/admin/settings"
            label="Settings"
            icon={<Settings className="h-4 w-4" />}
          />
        </nav>
      </aside>
    </>
  );
}
