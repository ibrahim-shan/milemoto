// src/providers/splash-provider.tsx
'use client';

import type { PropsWithChildren } from 'react';
import { usePathname } from 'next/navigation';

import { SplashScreen } from '@/features/feedback/SplashScreen';

export function SplashProvider({ children }: PropsWithChildren) {
  const pathname = usePathname() || '';
  const hideSplash = pathname.startsWith('/admin');
  if (hideSplash) {
    return <>{children}</>;
  }
  return (
    <>
      <SplashScreen label="Starting MileMoto" />
      {children}
    </>
  );
}
