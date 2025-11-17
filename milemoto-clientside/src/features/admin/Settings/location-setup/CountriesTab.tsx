// src/features/admin/Settings/location-setup/CountriesTab.tsx
'use client';

import { useState } from 'react';

import { CountryDialog } from './LocationDialogs';
import { LocationPagination } from './LocationPagination';
import { LocationToolbar } from './LocationToolbar';
import { Country } from '@milemoto/types';
import { MoreHorizontal } from 'lucide-react';

import { Skeleton } from '@/features/feedback/Skeleton'; // Import Skeleton for loading
import { useDebounce } from '@/hooks/useDebounce';
import { useDeleteCountry, useGetCountries } from '@/hooks/useLocationQueries';
import { Button } from '@/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu';
import { StatusBadge } from '@/ui/status-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table';

export function CountriesTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Country | null>(null);

  // --- State for Pagination and Search ---
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300); // Use a debounce hook
  const limit = 10;

  // --- Data Fetching ---
  const { data, isLoading, isError } = useGetCountries({
    search: debouncedSearch,
    page,
    limit,
  });
  const deleteMutation = useDeleteCountry();

  // --- Event Handlers ---
  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Country) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this country?')) {
      deleteMutation.mutate(id);
    }
  };

  // --- Render Logic ---
  const countries: Country[] = data?.items ?? [];
  const totalCount = data?.totalCount || 0;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle Export/Import
  const handleExport = () => {
    // Construct the full URL for the export endpoint
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
    }/api/v1/admin/locations/countries/export`;
    // We can't use `fetch` as it doesn't trigger a download.
    // We use a hidden link or window.open.
    window.open(url, '_blank');
  };

  const handleImport = () => {
    // This will require a new dialog. For now, we'll just log.
    console.log('Import clicked. A file upload dialog should open.');
  };

  return (
    <div className="space-y-4">
      <LocationToolbar
        onAdd={handleOpenAdd}
        addLabel="Add Country"
        searchPlaceholder="Search countries..."
        searchValue={search}
        onSearchChange={setSearch}
        onImport={handleImport}
        onExport={handleExport}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Country Name</TableHead>
            <TableHead>Country Code</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            // --- Loading State ---
            Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={`skeleton-${i}`}>
                <TableCell>
                  <Skeleton className="h-5 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8" />
                </TableCell>
              </TableRow>
            ))
          ) : isError ? (
            // --- Error State ---
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-red-500"
              >
                Failed to load countries.
              </TableCell>
            </TableRow>
          ) : countries.length === 0 ? (
            // --- Empty State ---
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-muted-foreground text-center"
              >
                No countries found.
              </TableCell>
            </TableRow>
          ) : (
            // --- Success State ---
            countries.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.code}</TableCell>
                <TableCell>
                  <StatusBadge variant={item.status === 'active' ? 'success' : 'neutral'}>
                    {item.status === 'active' ? 'Active' : 'Inactive'}
                  </StatusBadge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        justify="center"
                        aria-label={`Open actions menu for ${item.name}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenEdit(item)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(item.id)}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 focus:text-red-600"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <LocationPagination
        totalCount={totalCount}
        currentPage={page}
        pageSize={limit}
        onPageChange={handlePageChange}
      />

      <CountryDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        item={editingItem}
      />
    </div>
  );
}
