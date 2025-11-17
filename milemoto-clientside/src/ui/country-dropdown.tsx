'use client';

import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';

// data
import { countries } from 'country-data-list';
// assets
import { CheckIcon, ChevronDown, Globe } from 'lucide-react';
import { CircleFlag } from 'react-circle-flags';

// utils
import { cn } from '@/lib/utils';
// shadcn
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover';

// Country interface
export interface Country {
  alpha2: string;
  alpha3: string;
  countryCallingCodes: string[];
  currencies: string[];
  emoji?: string;
  ioc: string;
  languages: string[];
  name: string;
  status: string;
}

// Dropdown props
interface CountryDropdownProps {
  options?: Country[];
  onChange?: (country: Country) => void;
  defaultValue?: string;
  disabled?: boolean;
  placeholder?: string;
  slim?: boolean;
}

const DEFAULT_COUNTRIES: Country[] = (countries.all as Country[]).filter(
  country => Boolean(country.emoji) && country.status !== 'deleted' && country.ioc !== 'PRK',
);

const CountryDropdownComponent = (
  {
    options = DEFAULT_COUNTRIES,
    onChange,
    defaultValue,
    disabled = false,
    placeholder = 'Select a country',
    slim = false,
    ...props
  }: CountryDropdownProps,
  ref: React.ForwardedRef<HTMLButtonElement>,
) => {
  const [open, setOpen] = useState(false);

  //
  // 1. Derive the initial country from props (NO setState here)
  //
  const derivedDefault = useMemo(() => {
    if (!defaultValue) return undefined;
    return options.find(c => c.alpha3 === defaultValue);
  }, [defaultValue, options]);

  //
  // 2. Internal selected state (controlled by defaultValue)
  //
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(derivedDefault);

  //
  // 3. Sync prop changes → state (ALLOWED pattern)
  //
  useEffect(() => {
    setSelectedCountry(derivedDefault);
  }, [derivedDefault]);

  //
  // 4. User selects a country
  //
  const handleSelect = useCallback(
    (country: Country) => {
      setSelectedCountry(country);
      onChange?.(country);
      setOpen(false);
    },
    [onChange],
  );

  //
  // Styling
  //
  const triggerClasses = cn(
    'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
    slim === true && 'w-20',
  );

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger
        ref={ref}
        className={triggerClasses}
        disabled={disabled}
        {...props}
      >
        {selectedCountry ? (
          <div className="flex w-0 grow items-center gap-2 overflow-hidden">
            <div className="inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full">
              <CircleFlag
                countryCode={selectedCountry.alpha2.toLowerCase()}
                height={20}
              />
            </div>

            {slim === false && (
              <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                {`${selectedCountry.countryCallingCodes?.[0] ?? ''} ${selectedCountry.name}`}
              </span>
            )}
          </div>
        ) : (
          <span>{slim === false ? placeholder : <Globe size={20} />}</span>
        )}

        <ChevronDown size={16} />
      </PopoverTrigger>

      <PopoverContent
        collisionPadding={10}
        side="bottom"
        className="min-w-[--radix-popper-anchor-width] p-0"
      >
        <Command className="max-h-[200px] w-full sm:max-h-[270px]">
          <CommandList>
            <div className="bg-popover sticky top-0 z-10">
              <CommandInput placeholder="Search country..." />
            </div>

            <CommandEmpty>No country found.</CommandEmpty>

            <CommandGroup>
              {options
                .filter(x => x.name)
                .map((option, index) => (
                  <CommandItem
                    key={
                      option.alpha3 || option.alpha2 || option.name || `${option.alpha2}-${index}`
                    }
                    className="text-foreground hover:bg-muted focus:bg-muted data-[state=selected]:bg-primary/10 data-[state=selected]:text-primary flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
                    onSelect={() => handleSelect(option)}
                  >
                    <div className="flex w-0 grow space-x-2 overflow-hidden">
                      <div className="inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full">
                        <CircleFlag
                          countryCode={option.alpha2.toLowerCase()}
                          height={20}
                        />
                      </div>

                      <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {`${option.countryCallingCodes?.[0] ?? ''} ${option.name}`}
                      </span>
                    </div>

                    <CheckIcon
                      className={cn(
                        'ml-auto h-4 w-4 shrink-0',
                        option.alpha3 === selectedCountry?.alpha3 ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

CountryDropdownComponent.displayName = 'CountryDropdownComponent';

export const CountryDropdown = forwardRef(CountryDropdownComponent);
