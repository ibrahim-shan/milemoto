'use client';

// ADD useEffect
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { CheckCircle2, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

import { MfaPrompt } from '@/features/auth/components/MfaPrompt'; // <-- ADD THIS IMPORT
import GoogleButton from '@/features/auth/GoogleButton';
import { useAuth } from '@/hooks/useAuth';
import { login, resendVerificationEmail } from '@/lib/auth';
import { Button } from '@/ui/Button';
import { Checkbox } from '@/ui/checkbox';
import { Input } from '@/ui/input';

// This type will hold the state for the MFA challenge
type MfaChallengeState = {
  challengeId: string;
  next: string;
};

export default function SignInPage() {
  const router = useRouter();
  const search = useSearchParams();
  const { setSession } = useAuth();

  const [rememberUI, setRememberUI] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  // --- NEW: MFA state ---
  const [mfaChallenge, setMfaChallenge] = useState<MfaChallengeState | null>(null);

  const [showResend, setShowResend] = useState(false);
  const [emailForResend, setEmailForResend] = useState('');

  const rawNext = search.get('next');
  const nextUrl =
    rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/account';

  // --- NEW: Handle MFA challenges from Google (on page load) ---
  useEffect(() => {
    // Check for the *new* param name we'll set in the Google handler
    const mfaId = search.get('mfaChallengeId');
    const next = nextUrl;

    if (mfaId) {
      setMfaChallenge({
        challengeId: mfaId,
        next,
      });
      // Clear the URL params so they don't stick around on refresh
      const params = new URLSearchParams();
      if (next && next !== '/account') {
        params.set('next', next);
      }
      router.replace(params.toString() ? `/signin?${params.toString()}` : '/signin');
    }
  }, [search, router, nextUrl]);

  useEffect(() => {
    const emailFromQuery = search.get('email');
    if (emailFromQuery) {
      const normalized = emailFromQuery.trim().toLowerCase();
      setEmailInput(normalized);
      setEmailForResend(normalized);
    }
  }, [search]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    const f = new FormData(e.currentTarget);
    const email = emailInput.trim().toLowerCase();
    const password = String(f.get('password') || '');
    const rememberVal = rememberUI; // source of truth

    if (!email || !password) return toast.error('Email and password are required.');
    setShowResend(false);
    setEmailForResend(email);
    setLoading(true);

    try {
      const res = await login({ email, password, remember: rememberVal });

      // --- THIS IS THE CORE LOGIC CHANGE ---
      if ('mfaRequired' in res) {
        // MFA is required. Instead of redirecting, set the state.
        setMfaChallenge({
          challengeId: res.challengeId,
          next: nextUrl,
        });
        // We stay on this page, so reset loading
        setLoading(false);
        return; // Stop execution
      } else {
        // No MFA. Login was successful.
        setSession(res);
        router.replace(nextUrl);
        return;
      }
      // --- END OF CHANGE ---
    } catch (err: unknown) {
      // 1. Check if it's an Error (which your api.ts guarantees)
      if (err instanceof Error) {
        // 2. Cast to access your custom properties (status, code, error)
        const apiError = err as Error & { code?: string; error?: string; status?: number };

        if (
          apiError.code === 'EmailNotVerified' ||
          apiError.error === 'EmailNotVerified' ||
          apiError.message === 'Please verify your email before signing in.'
        ) {
          toast.error('Please verify your email before signing in.');
          setShowResend(true);
        } else if (apiError.status === 401) {
          toast.error('Invalid email or password.');
        } else if (apiError.status === 403) {
          toast.error('Account disabled.');
        } else if (apiError.status === 429) {
          toast.error('Too many attempts. Please try again later.');
        } else {
          toast.error(apiError.message || 'Sign in failed.');
        }
      } else {
        // Fallback for any non-Error exceptions
        toast.error('An unknown error occurred.');
      }
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!emailForResend) {
      return toast.error('Please enter your email in the field first.');
    }
    setLoading(true);
    try {
      await resendVerificationEmail(emailForResend);
      toast.success('A new verification email has been sent.');
      setShowResend(false); // Hide the button after success
    } catch (err: unknown) {
      // Check if it's an Error and use its message
      if (err instanceof Error) {
        toast.error(err.message || 'An error occurred.');
      } else {
        toast.error('An error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bg-background text-foreground mx-auto grid min-h-dvh max-w-7xl place-items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-border bg-card w-full max-w-7xl rounded-2xl border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: value prop (no change) */}
          <aside
            aria-labelledby="signin-benefits"
            className="border-border hidden border-r p-8 md:block"
          >
            <h2
              id="signin-benefits"
              className="sr-only"
            >
              Account benefits
            </h2>
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Access your orders, wishlist, and more.
            </p>
            <ul className="mt-6 space-y-4">
              <li className="flex items-start gap-3">
                <ShieldCheck
                  className="mt-0.5 h-5 w-5"
                  aria-hidden
                />
                <div>
                  <p className="text-sm font-medium">Secure sessions</p>
                  <p className="text-muted-foreground text-xs">
                    We use industry-standard protection.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2
                  className="mt-0.5 h-5 w-5"
                  aria-hidden
                />
                <div>
                  <p className="text-sm font-medium">Fast checkout</p>
                  <p className="text-muted-foreground text-xs">Save time on every purchase.</p>
                </div>
              </li>
            </ul>
          </aside>

          {/* Right: form area */}
          <div className="p-6 md:p-8">
            {/* --- NEW: Conditional Rendering --- */}
            {mfaChallenge ? (
              // --- VIEW 1: MFA PROMPT ---
              <MfaPrompt
                challengeId={mfaChallenge.challengeId}
                onSuccess={() => {
                  router.replace(mfaChallenge.next);
                }}
              />
            ) : (
              // --- VIEW 2: LOGIN FORM (Original Content) ---
              <>
                <form
                  aria-labelledby="signin-form-title"
                  onSubmit={onSubmit}
                  className="space-y-4"
                  noValidate
                >
                  <h2
                    id="signin-form-title"
                    className="sr-only"
                  >
                    Sign in form
                  </h2>

                  {/* Email (no change) */}
                  <div className="relative">
                    <Mail
                      aria-hidden
                      className="text-muted-foreground pointer-events-none absolute top-2.5 left-3 h-4 w-4"
                    />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder=" "
                      dir="ltr"
                      value={emailInput}
                      onChange={event => {
                        const value = event.target.value;
                        setEmailInput(value);
                        setEmailForResend(value.trim().toLowerCase());
                      }}
                      className="peer h-10 pl-9 text-sm placeholder:text-transparent focus-visible:ring-2"
                    />
                    <label
                      htmlFor="email"
                      className="text-muted-foreground bg-card pointer-events-none absolute top-2.5 left-9 px-1 text-sm transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-xs"
                    >
                      Email
                    </label>
                  </div>

                  {/* Password (no change) */}
                  <div className="relative">
                    <Lock
                      aria-hidden
                      className="text-muted-foreground pointer-events-none absolute top-2.5 left-3 h-4 w-4"
                    />
                    <Input
                      id="password"
                      name="password"
                      type={showPass ? 'text' : 'password'}
                      required
                      minLength={8}
                      autoComplete="current-password"
                      placeholder=" "
                      className="peer h-10 pr-10 pl-9 text-sm placeholder:text-transparent focus-visible:ring-2"
                    />
                    <label
                      htmlFor="password"
                      className="text-muted-foreground bg-card pointer-events-none absolute top-2.5 left-9 px-1 text-sm transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-xs"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPass(s => !s)}
                      className="text-muted-foreground hover:text-foreground absolute top-1.5 right-2 inline-flex h-7 w-7 items-center justify-center rounded"
                    >
                      {showPass ? (
                        <EyeOff
                          className="h-4 w-4"
                          aria-hidden
                        />
                      ) : (
                        <Eye
                          className="h-4 w-4"
                          aria-hidden
                        />
                      )}
                    </button>
                  </div>

                  {/* Remember + Forgot (no change) */}
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="remember"
                      className="inline-flex items-center gap-2 text-sm"
                    >
                      <Checkbox
                        id="remember"
                        name="remember"
                        checked={rememberUI}
                        onCheckedChange={checked => setRememberUI(Boolean(checked))}
                      />
                      Remember me
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-primary text-sm underline underline-offset-4"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {showResend && (
                    <div className="m-0">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleResend}
                        disabled={loading}
                        size="md"
                        fullWidth
                        justify="center"
                      >
                        Resend verification email
                      </Button>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="solid"
                    className="mt-4"
                    size="md"
                    justify="center"
                    fullWidth
                    disabled={loading}
                    aria-busy={loading}
                  >
                    {loading ? 'Signing in…' : 'Sign in'}
                  </Button>

                  <p className="text-muted-foreground mt-4 text-center text-sm">
                    Don&apos;t have an account?
                    <Link
                      href="/signup"
                      className="text-primary underline underline-offset-4"
                    >
                      Create one
                    </Link>
                  </p>
                </form>

                {/* OR divider and Google Button (no change) */}
                <div className="my-4 flex items-center gap-3">
                  <div className="bg-border h-px w-full" />
                  <span className="text-muted-foreground text-xs">or</span>
                  <div className="bg-border h-px w-full" />
                </div>

                <GoogleButton remember={rememberUI} />
              </>
              // --- END OF ORIGINAL CONTENT ---
            )}
            {/* --- END: Conditional Rendering --- */}
          </div>
        </div>
      </div>
    </main>
  );
}
