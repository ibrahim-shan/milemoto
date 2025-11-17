// src/features/checkout/components/OrderSummary.tsx
'use client';

import * as React from 'react';
import Image from 'next/image';

import { formatPrice } from '@/lib/formatPrice';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/input';

type Item = {
  id: string;
  title: string;
  imageSrc: string;
  priceMinor: number;
  qty: number;
};

export default function OrderSummary({
  items,
  subtotalMinor,
  shippingMinor,
  totalMinor,
  onPay,
}: {
  items: Item[];
  subtotalMinor: number;
  shippingMinor: number;
  totalMinor: number;
  onPay: () => void;
}) {
  const [code, setCode] = React.useState('');

  return (
    <div className="border-border/60 bg-card text-foreground rounded-2xl border p-6">
      <h3 className="text-primary mb-4 text-lg font-semibold">Order Summary</h3>

      <ul className="mb-4 space-y-3">
        {items.map(it => (
          <li
            key={it.id}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <Image
                src={it.imageSrc}
                width={56}
                height={56}
                alt=""
                aria-hidden
                className="border-border/60 h-14 w-14 rounded-lg border object-cover"
              />
              <div className="text-sm">
                <div className="font-medium">{it.title}</div>
                <div className="text-muted-foreground">x{it.qty}</div>
              </div>
            </div>
            <div className="text-sm font-medium tabular-nums">{formatPrice(it.priceMinor)}</div>
          </li>
        ))}
      </ul>

      <div className="mb-4">
        <label
          htmlFor="coupon"
          className="block text-sm"
        >
          Apply Discount
        </label>
        <div className="mt-1 flex gap-2">
          <Input
            id="coupon"
            name="coupon"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Enter coupon code"
            autoComplete="off"
            className="flex-1"
          />
          <Button
            type="button"
            variant="secondary"
            size="md"
          >
            Apply
          </Button>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <Row
          label="Subtotal"
          value={formatPrice(subtotalMinor)}
        />
        <Row
          label="Shipping"
          value={formatPrice(shippingMinor)}
        />
        <div className="text-primary mt-2 flex items-center justify-between border-t pt-3 text-base font-semibold">
          <span>Total</span>
          <span className="tabular-nums">{formatPrice(totalMinor)}</span>
        </div>
      </div>

      <Button
        type="button"
        variant="solid"
        justify="center"
        size="md"
        fullWidth
        className="mt-6"
        onClick={onPay}
      >
        Pay Now
      </Button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between">
      <span>{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}
