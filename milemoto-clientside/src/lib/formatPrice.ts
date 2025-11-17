// src/lib/formatPrice.ts

export type USDFormatOptions = {
  locale?: string; // default 'en-US'
  compact?: boolean; // 12_300 => $12K
  minimumFractionDigits?: number; // default 2
  maximumFractionDigits?: number; // default 2
};

export const USD = 'USD' as const;

/** Convert cents to dollars */
export function toMajorUSD(minor: number): number {
  return minor / 100;
}

/** Format cents as USD (defaults to en-US) */
export function formatUSD(
  minor: number,
  {
    locale = 'en-US',
    compact = false,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  }: USDFormatOptions = {},
): string {
  const nf = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: USD,
    notation: compact ? 'compact' : 'standard',
    minimumFractionDigits,
    maximumFractionDigits,
  });
  return nf.format(minor / 100);
}

/** Format a USD range from cents, e.g. "$10.00-$15.00" */
export function formatUSDRange(
  minorA: number,
  minorB: number,
  opts: USDFormatOptions = {},
): string {
  return `${formatUSD(minorA, opts)}-${formatUSD(minorB, opts)}`;
}

/** Backward-compatible aliases if existing code calls these names */
export const formatPrice = formatUSD;
export const formatPriceRange = formatUSDRange;
export const toMajor = toMajorUSD;
