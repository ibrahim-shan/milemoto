// src/features/contact/ContactForm.tsx
'use client';

import { useState } from 'react';

import { Button } from '@/ui/Button';
import { Input } from '@/ui/input';

type FormState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success' }
  | { status: 'error'; message: string };

function parseErr(e: unknown): { code?: string; message: string } {
  const code = (e as { code: string })?.code || (e as { error: string })?.error;
  const message = (e as { message: string })?.message || 'Request failed';
  return { code, message };
}

export function ContactForm() {
  const [state, setState] = useState<FormState>({ status: 'idle' });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    // honeypot: if filled, drop
    if ((fd.get('company') as string)?.trim()) return;

    const payload = {
      name: (fd.get('name') as string).trim(),
      email: (fd.get('email') as string).trim(),
      phone: (fd.get('phone') as string)?.trim() || '',
      subject: fd.get('subject') as string,
      orderId: (fd.get('orderId') as string)?.trim() || '',
      vin: (fd.get('vin') as string)?.trim() || '',
      message: (fd.get('message') as string).trim(),
      consent: fd.get('consent') === 'on',
    };

    setState({ status: 'submitting' });
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Request failed');
      setState({ status: 'success' });
      form.reset();
    } catch (err: unknown) {
      const { message } = parseErr(err);
      setState({ status: 'error', message });
    }
  }

  const disabled = state.status === 'submitting' || state.status === 'success';

  return (
    <section
      aria-labelledby="contact-form"
      className="border-border bg-card rounded-2xl border p-6 md:p-8"
    >
      <h2
        id="contact-form"
        className="text-xl font-semibold tracking-tight"
      >
        Send a message
      </h2>

      <form
        onSubmit={onSubmit}
        className="mt-6 space-y-4"
        noValidate
      >
        {/* honeypot */}
        <Input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          className="sr-only"
          aria-hidden
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Full name"
            htmlFor="name"
            required
          >
            <Input
              id="name"
              name="name"
              required
              disabled={disabled}
              className="bg-background text-foreground placeholder:text-muted-foreground/70 border-border focus-visible:ring-ring block w-full rounded-md border px-3 py-2 text-sm outline-none"
              autoComplete="name"
            />
          </Field>
          <Field
            label="Email"
            htmlFor="email"
            required
          >
            <Input
              id="email"
              name="email"
              type="email"
              required
              disabled={disabled}
              className="bg-background text-foreground placeholder:text-muted-foreground/70 border-border focus-visible:ring-ring block w-full rounded-md border px-3 py-2 text-sm outline-none"
              autoComplete="email"
              inputMode="email"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Phone"
            htmlFor="phone"
          >
            <Input
              id="phone"
              name="phone"
              type="tel"
              disabled={disabled}
              className="bg-background text-foreground placeholder:text-muted-foreground/70 border-border focus-visible:ring-ring block w-full rounded-md border px-3 py-2 text-sm outline-none"
              autoComplete="tel"
              inputMode="tel"
            />
          </Field>

          <Field
            label="Subject"
            htmlFor="subject"
            required
          >
            <select
              id="subject"
              name="subject"
              required
              disabled={disabled}
              className="bg-background text-foreground border-border focus-visible:ring-ring block w-full rounded-md border px-3 py-2 text-sm outline-none"
              defaultValue="fitment"
            >
              <option value="fitment">Fitment check</option>
              <option value="order">Order status</option>
              <option value="returns">Returns</option>
              <option value="general">General question</option>
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Order ID"
            htmlFor="orderId"
          >
            <Input
              id="orderId"
              name="orderId"
              disabled={disabled}
              className="bg-background text-foreground placeholder:text-muted-foreground/70 border-border focus-visible:ring-ring block w-full rounded-md border px-3 py-2 text-sm outline-none"
              placeholder="MM-12345"
            />
          </Field>
          <Field
            label="VIN"
            htmlFor="vin"
          >
            <Input
              id="vin"
              name="vin"
              disabled={disabled}
              className="bg-background text-foreground placeholder:text-muted-foreground/70 border-border focus-visible:ring-ring block w-full rounded-md border px-3 py-2 text-sm tracking-wider uppercase outline-none"
              placeholder="WBAxxxxxxxxxxxxxx"
              maxLength={17}
            />
          </Field>
        </div>

        <Field
          label="Message"
          htmlFor="message"
          required
        >
          <textarea
            id="message"
            name="message"
            required
            disabled={disabled}
            rows={6}
            maxLength={2000}
            className="bg-background text-foreground placeholder:text-muted-foreground/70 border-border focus-visible:ring-ring block w-full resize-y rounded-md border px-3 py-2 text-sm outline-none"
            placeholder="Tell us the part, car model, and any codes or symptoms."
          />
        </Field>

        <div className="mt-4 flex items-center gap-3">
          <Button
            type="submit"
            variant="solid"
            justify="center"
            disabled={disabled}
          >
            {state.status === 'submitting'
              ? 'Sending…'
              : state.status === 'success'
                ? 'Sent'
                : 'Send message'}
          </Button>
          <p
            role="status"
            aria-live="polite"
            className={`text-sm ${
              state.status === 'error' ? 'text-destructive' : 'text-muted-foreground'
            }`}
          >
            {state.status === 'success' && 'Thanks. We will reply soon.'}
            {state.status === 'error' && state.message}
          </p>
        </div>
      </form>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1 block text-sm font-medium"
      >
        {label} {required ? <span className="text-destructive">*</span> : null}
      </label>
      {children}
    </div>
  );
}
