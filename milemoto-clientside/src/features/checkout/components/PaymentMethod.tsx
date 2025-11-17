// src/features/checkout/components/PaymentMethod.tsx
'use client';

import * as React from 'react';

import { Input } from '@/ui/input';

export type Payment = { method: 'cod' };

export default function PaymentMethod({
  value,
  onChange,
}: {
  value: Payment;
  onChange: (next: Payment) => void;
}) {
  // enforce COD
  React.useEffect(() => {
    if (value.method !== 'cod') onChange({ method: 'cod' });
  }, [value.method, onChange]);

  return (
    <fieldset className="space-y-2">
      <legend className="sr-only">Payment method</legend>
      <label
        htmlFor="checkout-payment-cod"
        className="border-border bg-card inline-flex items-center gap-3 rounded-lg border px-3 py-2 text-sm"
      >
        <Input
          type="radio"
          name="pay"
          value="cod"
          checked
          readOnly
          id="checkout-payment-cod"
          className="accent-primary h-4 w-4"
        />
        <div>
          <div className="font-medium">Cash on Delivery</div>
          <div className="text-muted-foreground text-xs">Pay with cash upon delivery.</div>
        </div>
      </label>
    </fieldset>
  );
}
