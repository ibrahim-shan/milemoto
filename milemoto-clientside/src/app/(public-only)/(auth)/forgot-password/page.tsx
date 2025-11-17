// src/app/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

import { Mail } from 'lucide-react';

import { forgotPassword } from '@/lib/auth';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading || success) return; // Don't submit twice
    setError(null);
    setLoading(true);

    try {
      await forgotPassword(email);
      setSuccess(true); // Show success message
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bg-background text-foreground mx-auto grid min-h-dvh max-w-7xl place-items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-border bg-card w-full max-w-md rounded-2xl border p-6 shadow-sm md:p-8">
        {success ? (
          // --- VIEW 2: SUCCESS MESSAGE ---
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              If an account with that email exists, we&apos;ve sent a link to reset your password.
            </p>
          </div>
        ) : (
          // --- VIEW 1: THE FORM ---
          <>
            <h1 className="text-2xl font-semibold tracking-tight">Forgot Password</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>

            <form
              onSubmit={onSubmit}
              className="mt-6 space-y-4"
            >
              {/* Email */}
              <div className="relative">
                <Mail
                  aria-hidden
                  className="text-muted-foreground pointer-events-none absolute top-2.5 left-3 h-4 w-4"
                />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder=" "
                  dir="ltr"
                  className="peer border-input bg-background text-foreground ring-ring/0 w-full rounded-md border px-9 py-2 text-sm outline-none placeholder:text-transparent focus-visible:ring-2"
                />
                <label
                  htmlFor="email"
                  className="text-muted-foreground pointer-events-none absolute top-2.5 left-9 px-1 text-sm transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-xs"
                >
                  Email
                </label>
              </div>

              {error && (
                <p
                  role="alert"
                  className="text-error text-sm"
                >
                  {error}
                </p>
              )}

              <Button
                type="submit"
                variant="solid"
                className="mt-2"
                size="md"
                justify="center"
                fullWidth
                isLoading={loading}
              >
                Send Reset Link
              </Button>
            </form>

            <p className="text-muted-foreground mt-6 text-center text-sm">
              Remembered your password?{' '}
              <Link
                href="/signin"
                className="text-primary underline underline-offset-4"
              >
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
