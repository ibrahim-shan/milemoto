'use client';

import { useCallback, useId, useMemo, useState, type ChangeEvent } from 'react';

import { countries as countriesData } from 'country-data-list';
import { getExampleNumber, parsePhoneNumberFromString } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js/core';
import examples from 'libphonenumber-js/examples.mobile.json';
import { isValidPhoneNumber } from 'react-phone-number-input';

import { cn } from '@/lib/utils';
import { CountryDropdown, type Country } from '@/ui/country-dropdown';
import { Input } from '@/ui/input';

const DEFAULT_COUNTRY: CountryCode = 'LB';

const derivePhoneState = (raw: string, fallback: CountryCode) => {
  if (!raw) {
    return { country: fallback, national: '' };
  }

  // 1. Try to parse it as a full, valid number
  try {
    const parsed = parsePhoneNumberFromString(raw);
    if (parsed?.country) {
      return {
        country: parsed.country as CountryCode,
        national: parsed.nationalNumber ? String(parsed.nationalNumber) : '',
      };
    }
  } catch {
    // ignore parse errors
  }

  // 2. If it fails, it might be a partial number.
  //    Check if the 'raw' string starts with the fallback country's dial code.
  const fallbackMeta = (countriesData.all as Country[]).find(c => c.alpha2 === fallback);
  const fallbackDial = fallbackMeta?.countryCallingCodes?.[0]?.replace(/\D/g, '') ?? '';

  if (fallbackDial && raw.startsWith(`+${fallbackDial}`)) {
    // It's a partial number for the selected country, e.g., "+9617"
    return {
      country: fallback,
      national: raw.substring(fallbackDial.length + 1), // Get just "7"
    };
  }

  // 3. If neither of the above, assume it's a raw national number
  //    (or a non-matching international number). Strip any leading +.
  return { country: fallback, national: raw.replace(/^\+/, '') };
};

const getExampleForCountry = (country: CountryCode) => {
  try {
    return getExampleNumber(country, examples);
  } catch {
    return null;
  }
};

const getMaxDigitsForCountry = (country: CountryCode) => {
  const example = getExampleForCountry(country);
  return example?.nationalNumber ? String(example.nationalNumber).length : null;
};

export type PhoneFieldChangeMeta = {
  isValid: boolean;
  country: CountryCode;
  national: string;
};

type PhoneFieldProps = {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string, meta: PhoneFieldChangeMeta) => void;
  defaultCountry?: CountryCode;
  required?: boolean;
  disabled?: boolean;
  slimDropdown?: boolean;
  className?: string;
  placeholder?: string;
};

export function PhoneField({
  id,
  label,
  value,
  onChange,
  defaultCountry = DEFAULT_COUNTRY,
  required = false,
  disabled = false,
  slimDropdown = true,
  className,
  placeholder = 'Enter phone number',
}: PhoneFieldProps) {
  const generatedId = useId();
  const inputId = id ?? `${generatedId}-phone`;
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(() => {
    return derivePhoneState(value, defaultCountry).country;
  });
  const derived = useMemo(() => derivePhoneState(value, selectedCountry), [value, selectedCountry]);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasDigits = derived.national.length > 0;
  const phoneCountry = hasDigits ? derived.country : selectedCountry;
  const nationalPhone = derived.national;

  const phoneCountryMeta = useMemo(
    () => (countriesData.all as Country[]).find(country => country.alpha2 === phoneCountry),
    [phoneCountry],
  );
  const phoneCountryAlpha3 = phoneCountryMeta?.alpha3;
  const phoneCountryDial = phoneCountryMeta?.countryCallingCodes?.[0] ?? '';
  const phoneCountryDialDigits = useMemo(
    () => phoneCountryDial.replace(/\D/g, ''),
    [phoneCountryDial],
  );

  const phoneExample = useMemo(() => getExampleForCountry(phoneCountry), [phoneCountry]);
  const phoneExampleDigits = phoneExample?.nationalNumber
    ? String(phoneExample.nationalNumber).length
    : null;
  const maxNationalDigits = phoneExampleDigits ?? null;

  const buildInvalidMessage = useCallback((countryCode: CountryCode) => {
    const meta = (countriesData.all as Country[]).find(c => c.alpha2 === countryCode);
    const example = getExampleForCountry(countryCode);
    const digits = example?.nationalNumber ? String(example.nationalNumber).length : null;
    const intl = example?.formatInternational() ?? null;

    const detailParts: string[] = [];
    if (digits) detailParts.push(`${digits} digits`);
    if (intl) detailParts.push(`e.g. ${intl}`);
    const detail = detailParts.length ? ` (${detailParts.join(', ')})` : '';
    return `Enter a valid ${meta?.name ?? 'phone'} number${detail}.`;
  }, []); // This function is pure, so its dependencies are empty

  const fullPhone = useMemo(() => {
    if (!nationalPhone) return '';
    return phoneCountryDialDigits ? `+${phoneCountryDialDigits}${nationalPhone}` : nationalPhone;
  }, [nationalPhone, phoneCountryDialDigits]);

  const checkValidity = useCallback(
    (phoneValue: string, country: CountryCode) => {
      if (!phoneValue) {
        return !required;
      }
      return isValidPhoneNumber(phoneValue, country);
    },
    [required],
  );

  const updateError = useCallback(
    (phoneValue: string, show: boolean, country: CountryCode) => {
      // Accept 'country'
      if (!show) {
        setError(null);
        return;
      }
      if (!phoneValue) {
        setError(required ? 'Phone number is required.' : null);
        return;
      }
      if (!isValidPhoneNumber(phoneValue, country)) {
        setError(buildInvalidMessage(country));
        return;
      }
      setError(null);
    },
    [buildInvalidMessage, required], // Remove phoneCountry
  );

  const emitChange = useCallback(
    (phoneValue: string, country: CountryCode, national: string) => {
      const isValid = checkValidity(phoneValue, country);
      onChange(phoneValue, { isValid, country, national });
      updateError(phoneValue, touched, country);
    },
    [checkValidity, onChange, touched, updateError],
  );

  const handlePhoneChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      const digitsOnly = event.target.value.replace(/\D/g, '');
      const limited = maxNationalDigits ? digitsOnly.slice(0, maxNationalDigits) : digitsOnly;
      const nextFull = limited ? `+${phoneCountryDialDigits}${limited}` : '';
      emitChange(nextFull, phoneCountry, limited);
    },
    [disabled, emitChange, maxNationalDigits, phoneCountry, phoneCountryDialDigits],
  );

  const handlePhoneBlur = useCallback(() => {
    if (disabled) return;
    setTouched(true);
    updateError(fullPhone, true, phoneCountry);
  }, [disabled, fullPhone, updateError, phoneCountry]);

  const handleCountryChange = useCallback(
    (country: Country) => {
      if (disabled) return;
      const nextCountry = country.alpha2 as CountryCode;
      setSelectedCountry(nextCountry);
      const nextDialDigits = country.countryCallingCodes?.[0]?.replace(/\D/g, '') ?? '';
      const nextMax = getMaxDigitsForCountry(nextCountry);
      const trimmedNational =
        nextMax && nationalPhone.length > nextMax ? nationalPhone.slice(0, nextMax) : nationalPhone;
      const nextFull = trimmedNational ? `+${nextDialDigits}${trimmedNational}` : '';
      emitChange(nextFull, nextCountry, trimmedNational);
    },
    [disabled, emitChange, nationalPhone],
  );

  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-muted-foreground block text-sm font-medium"
        >
          {label}
        </label>
      )}
      <div className="flex gap-2">
        <div className="PhoneField w-auto">
          <CountryDropdown
            slim={slimDropdown}
            defaultValue={phoneCountryAlpha3 ?? ''}
            onChange={handleCountryChange}
            disabled={disabled}
          />
        </div>
        <Input
          readOnly
          value={phoneCountryDial}
          className="w-24 text-center"
          aria-label="Country calling code"
          disabled={disabled}
        />
        <Input
          id={inputId}
          inputMode="numeric"
          pattern="[0-9]*"
          value={nationalPhone}
          onChange={handlePhoneChange}
          onBlur={handlePhoneBlur}
          className="text-foreground border-input focus-visible:ring-ring w-full flex-1 rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2"
          placeholder={placeholder}
          maxLength={maxNationalDigits ?? undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          disabled={disabled}
        />
      </div>
      {error && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="text-error text-xs"
        >
          {error}
        </p>
      )}
    </div>
  );
}
