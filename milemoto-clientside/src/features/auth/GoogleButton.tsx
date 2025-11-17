'use client';

import { useState } from 'react';

import { API_BASE } from '@/lib/api';
import { Button } from '@/ui/Button';

export default function GoogleButton({ remember = false }: { remember?: boolean }) {
  const [loading, setLoading] = useState(false);

  function getNextFromURL(): string {
    try {
      const url = new URL(window.location.href);
      const n = url.searchParams.get('next') || '/account';
      return n.startsWith('/') && !n.startsWith('//') ? n : '/account';
    } catch {
      return '/account';
    }
  }

  function onClick() {
    if (loading) return;
    setLoading(true);
    const next = getNextFromURL();
    const url = new URL(`${API_BASE}/auth/google/start`);
    url.searchParams.set('next', next);
    url.searchParams.set('remember', remember ? '1' : '0');
    window.location.href = url.toString(); // full redirect to backend
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="md"
      className="inline-flex w-full items-center justify-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-medium text-[#3c4043] hover:bg-gray-50"
      aria-label="Continue with Google"
      onClick={onClick}
      disabled={loading}
    >
      {/* Google "G" mark (compliant SVG) */}
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        aria-hidden
      >
        <path
          fill="#EA4335"
          d="M9 3.48c1.69 0 3.2.58 4.39 1.71l2.93-2.93C14.67.86 11.99 0 9 0 5.48 0 2.44 1.99.96 4.9l3.4 2.64C5 5.57 6.83 3.48 9 3.48z"
        />
        <path
          fill="#4285F4"
          d="M17.64 9.2c0-.64-.06-1.25-.18-1.84H9v3.48h4.84c-.21 1.12-.84 2.07-1.8 2.7l2.77 2.15c1.62-1.49 2.83-3.68 2.83-6.49z"
        />
        <path
          fill="#FBBC05"
          d="M4.36 10.54A5.5 5.5 0 0 1 4.07 9c0-.53.09-1.04.26-1.54L.96 4.82A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.02l3.4-2.48z"
        />
        <path
          fill="#34A853"
          d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.77-2.16c-.77.52-1.76.84-3.19.84-2.45 0-4.52-1.65-5.27-3.92l-3.4 2.5C2.44 16 5.48 18 9 18z"
        />
        <path
          fill="none"
          d="M0 0h18v18H0z"
        />
      </svg>
      {loading ? 'Redirecting…' : 'Continue with Google'}
    </Button>
  );
}
