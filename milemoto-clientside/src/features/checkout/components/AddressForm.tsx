// src/features/checkout/components/AddressForm.tsx
'use client';

import * as React from 'react';

import { Input } from '@/ui/input';

export type Address = {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  email: string;
  phone: string;
};

type Props = {
  value: Address;
  onChange: (next: Address) => void;
};

export default function AddressForm({ value, onChange }: Props) {
  const set = (k: keyof Address) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [k]: e.target.value });

  const ids = {
    first: React.useId(),
    last: React.useId(),
    addr: React.useId(),
    city: React.useId(),
    state: React.useId(),
    email: React.useId(),
    phone: React.useId(),
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field
        label="First Name"
        htmlFor={ids.first}
      >
        <Input
          id={ids.first}
          name="given-name"
          autoComplete="given-name"
          autoCapitalize="words"
          value={value.firstName}
          onChange={set('firstName')}
        />
      </Field>
      <Field
        label="Last Name"
        htmlFor={ids.last}
      >
        <Input
          id={ids.last}
          name="family-name"
          autoComplete="family-name"
          autoCapitalize="words"
          value={value.lastName}
          onChange={set('lastName')}
        />
      </Field>
      <Field
        label="Address"
        htmlFor={ids.addr}
        full
      >
        <Input
          id={ids.addr}
          name="street-address"
          autoComplete="street-address"
          value={value.address}
          onChange={set('address')}
        />
      </Field>
      <Field
        label="City/Town"
        htmlFor={ids.city}
      >
        <Input
          id={ids.city}
          name="address-level2"
          autoComplete="address-level2"
          value={value.city}
          onChange={set('city')}
        />
      </Field>
      <Field
        label="State/Region"
        htmlFor={ids.state}
      >
        <Input
          id={ids.state}
          name="address-level1"
          autoComplete="address-level1"
          value={value.state}
          onChange={set('state')}
        />
      </Field>
      <Field
        label="Email"
        htmlFor={ids.email}
      >
        <Input
          id={ids.email}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          value={value.email}
          onChange={set('email')}
        />
      </Field>
      <Field
        label="Phone Number"
        htmlFor={ids.phone}
      >
        <Input
          id={ids.phone}
          type="tel"
          name="tel"
          autoComplete="tel"
          inputMode="tel"
          value={value.phone}
          onChange={set('phone')}
        />
      </Field>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
  full = false,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? 'sm:col-span-2' : undefined}>
      <label
        htmlFor={htmlFor}
        className="text-foreground mb-1 block text-sm"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
