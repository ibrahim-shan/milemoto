import { useEffect, useState } from 'react';

/**
 * A custom React hook to debounce a value.
 *
 * @param value The value to debounce (e.g., a search query)
 * @param delay The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  // State to store the debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Return a cleanup function to clear the timer if the value changes
    // (this is the "debounce" part)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Only re-run the effect if the value or delay changes

  return debouncedValue;
}
