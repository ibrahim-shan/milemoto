import type { Metadata } from 'next';

import { AdminLayoutClient } from '@/app/(admin)/AdminLayoutClient';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // AdminLayoutClient will handle auth checks and render the UI
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
