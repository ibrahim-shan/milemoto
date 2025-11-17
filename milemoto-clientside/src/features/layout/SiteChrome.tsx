'use client';

import { usePathname } from 'next/navigation';

import { Footer } from '@/features/layout/footer';
import { Header } from '@/features/layout/header';

type Props = {
  children: React.ReactNode;
};

export function SiteChrome({ children }: Props) {
  const pathname = usePathname() || '';
  const hideShell = pathname.startsWith('/admin');
  return (
    <>
      {!hideShell && <Header />}
      {children}
      {!hideShell && <Footer />}
    </>
  );
}
