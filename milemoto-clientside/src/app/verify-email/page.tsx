// src/app/verify-email/page.tsx
'use client';

import { Suspense, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import { verifyEmail } from '@/lib/auth';
import { Button } from '@/ui/Button';

const REDIRECT_DELAY_SECONDS = 3;

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<StatusDisplay status="loading" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

type Status = 'loading' | 'success' | 'error';

function VerifyEmailContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token');

  const [initialStatus, initialError] = useMemo((): [Status, string | null] => {
    if (!token) {
      return ['error', 'No verification token found.'];
    }
    return ['loading', null];
  }, [token]);

  const [status, setStatus] = useState<Status>(initialStatus);
  const [error, setError] = useState<string | null>(initialError);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (token) {
      verifyEmail(token)
        .then(res => {
          setStatus('success');
          setVerifiedEmail(res.email ?? null);
          setCountdown(REDIRECT_DELAY_SECONDS);
          toast.success('Email verified successfully.');
        })
        .catch(err => {
          setStatus('error');
          toast.error(err?.message || 'Invalid or expired token.');
          setError(err?.message || 'Invalid or expired token.');
        });
    }
  }, [token]);

  useEffect(() => {
    if (status !== 'success' || countdown === null) {
      return;
    }

    if (countdown <= 0) {
      const qs = verifiedEmail ? `?email=${encodeURIComponent(verifiedEmail)}` : '';
      router.push(`/signin${qs}`);
      return;
    }

    const id = window.setTimeout(() => {
      setCountdown(prev => (prev ?? 0) - 1);
    }, 1000);

    return () => window.clearTimeout(id);
  }, [countdown, router, status, verifiedEmail]);

  return (
    <StatusDisplay
      status={status}
      error={error}
      countdown={countdown}
    />
  );
}

type StatusDisplayContent = {
  title: string;
  message: string;
  icon: ReactNode;
  button?: ReactNode;
};

function StatusDisplay({
  status,
  error,
  countdown,
}: {
  status: Status;
  error?: string | null;
  countdown?: number | null;
}) {
  let content: StatusDisplayContent = {
    title: 'Verifying...',
    message: 'Please wait while we verify your email address.',
    icon: (
      <div className="border-muted-foreground/20 border-t-primary h-12 w-12 animate-spin rounded-full border-4" />
    ),
    button: (
      <Button
        href="/"
        variant="outline"
        justify="center"
      >
        Go to Home
      </Button>
    ),
  };

  if (status === 'success') {
    const seconds =
      typeof countdown === 'number' && countdown >= 0 ? countdown : REDIRECT_DELAY_SECONDS;
    content = {
      title: 'Email Verified!',
      message: `Your email address has been successfully verified. Redirecting in ${seconds}s…`,
      icon: <CheckCircle className="text-success h-12 w-12" />,
      button: null,
    };
  }

  if (status === 'error') {
    content = {
      title: 'Verification Failed',
      message: error || 'This link is invalid or has expired. Please try registering again.',
      icon: <XCircle className="text-error h-12 w-12" />,
      button: (
        <Button
          href="/"
          variant="outline"
          justify="center"
        >
          Go to Home
        </Button>
      ),
    };
  }

  return (
    <main className="bg-background text-foreground grid min-h-dvh place-items-center px-6 py-16">
      <section className="border-border bg-card w-full max-w-md rounded-2xl border p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center">{content.icon}</div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">{content.title}</h1>
        <p className="text-muted-foreground mt-2 text-sm">{content.message}</p>
        {content.button && <div className="mt-8">{content.button}</div>}
      </section>
    </main>
  );
}
