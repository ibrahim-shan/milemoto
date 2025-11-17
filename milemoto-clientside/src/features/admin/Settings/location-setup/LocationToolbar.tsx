// src/features/admin/Settings/location-setup/LocationToolbar.tsx
'use client';

import { useId } from 'react';

import { Download, Plus, Search, Upload } from 'lucide-react';

import { Button } from '@/ui/Button';
import { Input } from '@/ui/input';

type Props = {
  onAdd: () => void;
  addLabel: string;
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onImport: () => void;
  onExport: () => void;
};

export function LocationToolbar({
  onAdd,
  addLabel,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  onImport,
  onExport,
}: Props) {
  const inputId = useId();
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* Left side: Search bar */}
      <div className="relative w-full max-w-sm">
        <Search
          aria-hidden
          className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
        />
        <label
          htmlFor={inputId}
          className="sr-only"
        >
          {searchPlaceholder}
        </label>
        <Input
          id={inputId}
          placeholder={searchPlaceholder}
          className="pl-9"
          value={searchValue}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>

      {/* Right side: Button group */}
      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Upload className="h-4 w-4" />}
          onClick={onImport}
        >
          Import
        </Button>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Download className="h-4 w-4" />}
          onClick={onExport}
        >
          Export
        </Button>
        <Button
          variant="solid"
          size="sm"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={onAdd}
        >
          {addLabel}
        </Button>
      </div>
    </div>
  );
}
