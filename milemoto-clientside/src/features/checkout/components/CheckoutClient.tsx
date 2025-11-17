// src/features/checkout/components/CheckoutClient.tsx
'use client';

import * as React from 'react';

import AddressForm, { Address } from './AddressForm';
import OrderSummary from './OrderSummary';
import PaymentMethod, { type Payment } from './PaymentMethod';

import { Button } from '@/ui/Button';
import { Checkbox } from '@/ui/checkbox';

type CartItem = {
  id: string;
  title: string;
  imageSrc: string;
  priceMinor: number; // cents-like
  qty: number;
};

export default function CheckoutClient({
  initialItems,
  shippingMinor,
}: {
  initialItems: CartItem[];
  shippingMinor: number;
}) {
  const [items] = React.useState<CartItem[]>(initialItems);
  const [payment, setPayment] = React.useState<Payment>({ method: 'cod' });

  const [shipping, setShipping] = React.useState<Address>({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    email: '',
    phone: '',
  });
  const [billing, setBilling] = React.useState<Address>({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    email: '',
    phone: '',
  });
  const [sameAsShipping, setSameAsShipping] = React.useState(true);

  const subtotalMinor = React.useMemo(
    () => items.reduce((s, it) => s + it.priceMinor * it.qty, 0),
    [items],
  );
  const totalMinor = subtotalMinor + shippingMinor;

  const onPay = () => {
    console.log({
      shipping,
      billing: sameAsShipping ? shipping : billing,
      payment,
      items,
      totals: { subtotalMinor, shippingMinor, totalMinor },
    });
  };

  return (
    <main className="container mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-12 lg:px-8">
      <section className="space-y-6 lg:col-span-8">
        {/* Shipping */}
        <div className="border-border/60 bg-card rounded-2xl border p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Shipping Address</h2>
            <Button
              href="/login"
              variant="link"
              size="sm"
            >
              Log in
            </Button>
          </div>
          <AddressForm
            value={shipping}
            onChange={setShipping}
          />
        </div>

        {/* Payment */}
        <div className="border-border/60 bg-card rounded-2xl border p-6">
          <h2 className="mb-4 text-lg font-semibold">Payment Method</h2>
          <PaymentMethod
            value={payment}
            onChange={setPayment}
          />
        </div>

        {/* Billing */}
        <div className="border-border/60 bg-card rounded-2xl border p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Billing Address</h2>
            <label
              htmlFor="billing-same"
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <Checkbox
                checked={sameAsShipping}
                onCheckedChange={checked => setSameAsShipping(Boolean(checked))}
                id="billing-same"
              />
              Same as shipping address
            </label>
          </div>

          {!sameAsShipping ? (
            <AddressForm
              value={billing}
              onChange={setBilling}
            />
          ) : (
            <p className="text-muted-foreground text-sm">Using shipping address for billing.</p>
          )}
        </div>
      </section>

      <aside className="lg:col-span-4">
        <OrderSummary
          items={items}
          subtotalMinor={subtotalMinor}
          shippingMinor={shippingMinor}
          totalMinor={totalMinor}
          onPay={onPay}
        />
      </aside>
    </main>
  );
}
