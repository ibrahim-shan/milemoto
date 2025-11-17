'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/useAuth';
import { getMe, refresh } from '@/lib/auth';

function sanitizeNext(param: string | null): string {
  if (!param) return '/account';
  if (param.startsWith('/') && !param.startsWith('//')) return param;
  return '/account';
}

export default function GoogleOAuthHandler() {
  const router = useRouter();
  const { setSession } = useAuth();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const next = sanitizeNext(params.get('next'));
    const mfaChallengeId = params.get('mfaChallengeId');

    if (mfaChallengeId) {
      const signinUrl = new URL('/signin', window.location.origin);
      signinUrl.searchParams.set('mfaChallengeId', mfaChallengeId);
      if (next !== '/account') {
        signinUrl.searchParams.set('next', next);
      }
      router.replace(signinUrl.toString());
      return;
    }

    let cancelled = false;
    const bootstrap = async () => {
      try {
        const { accessToken } = await refresh();
        if (!accessToken) {
          throw new Error('Missing access token');
        }
        const user = await getMe();
        if (cancelled) return;
        setSession({ accessToken, user });
        router.replace(next);
      } catch {
        router.replace('/signin?error=OAuthFailed');
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [router, setSession]);

  return (
    <main className="bg-background text-foreground grid min-h-dvh place-items-center px-6 py-16">
      <section className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight">Signing you in�</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Please wait while we finalize your session.
        </p>
      </section>
    </main>
  );
}
