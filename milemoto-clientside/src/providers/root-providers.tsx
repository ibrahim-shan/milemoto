'use client';

import { useEffect, useState, type PropsWithChildren } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';

import { CartProvider } from '@/features/cart/cart-context';
import { AuthProvider } from '@/providers/auth-provider';

export function RootProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      // Lazy-load axe only in development for accessibility checks
      Promise.all([import('@axe-core/react'), import('react'), import('react-dom')]).then(
        ([axeMod, reactMod, reactDomMod]) => {
          type AxeReactModule = {
            default: (
              react: typeof import('react'),
              reactDom: typeof import('react-dom'),
              timeout?: number,
            ) => void;
          };

          // Ensure we have the expected default export function
          if (!('default' in axeMod) || typeof (axeMod as AxeReactModule).default !== 'function') {
            return; // bail if shape is unexpected
          }

          const axeInit = (axeMod as AxeReactModule).default;
          const ReactNS = reactMod as typeof import('react');
          const ReactDOMNS = reactDomMod as typeof import('react-dom');
          // Create mutable shims; ESM namespace properties are read-only.
          const ReactShim: typeof ReactNS = { ...ReactNS };
          const ReactDOMShim: typeof ReactDOMNS = { ...ReactDOMNS };
          axeInit(ReactShim, ReactDOMShim, 1000);
        },
      );
    }
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
