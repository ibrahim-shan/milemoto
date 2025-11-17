'use client';

import { useState } from 'react';

import { CityDialog } from './LocationDialogs';
import { LocationPagination } from './LocationPagination';
import { LocationToolbar } from './LocationToolbar';
import { City } from '@milemoto/types'; // <-- IMPORT CITY TYPE
import { MoreHorizontal } from 'lucide-react';

import { Skeleton } from '@/features/feedback/Skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import { useDeleteCity, useGetCities } from '@/hooks/useLocationQueries';
import { Button } from '@/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu';
import { StatusBadge } from '@/ui/status-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table';

export function CitiesTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<City | null>(null); // <-- Use City type

  // --- State for Pagination and Search ---
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const limit = 10;

  // --- Data Fetching ---
  const { data, isLoading, isError } = useGetCities({
    search: debouncedSearch,
    page,
    limit,
  });
  const deleteMutation = useDeleteCity();

  // --- Event Handlers ---
  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: City) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this city?')) {
      deleteMutation.mutate(id);
    }
  };

  // --- Render Logic ---
  const cities: City[] = data?.items ?? [];
  const totalCount = data?.totalCount || 0;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle Export/Import
  const handleExport = () => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
    }/api/v1/admin/locations/cities/export`;
    window.open(url, '_blank');
  };

  const handleImport = () => {
    console.log('Import clicked. A file upload dialog should open.');
  };

  return (
    <div className="space-y-4">
      <LocationToolbar
        onAdd={handleOpenAdd}
        addLabel="Add City"
        searchPlaceholder="Search cities, states, or countries..."
        searchValue={search}
        onSearchChange={setSearch}
        onImport={handleImport}
        onExport={handleExport}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>City Name</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Country</TableHead>
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
                  <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24" />
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
                colSpan={5}
                className="text-center text-red-500"
              >
                Failed to load cities.
              </TableCell>
            </TableRow>
          ) : cities.length === 0 ? (
            // --- Empty State ---
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-muted-foreground text-center"
              >
                No cities found.
              </TableCell>
            </TableRow>
          ) : (
            // --- Success State ---
            cities.map(item => {
              const effectiveActive = item.status_effective === 'active';
              const overridden = item.status !== item.status_effective;
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.state_name}</TableCell>
                  <TableCell>{item.country_name}</TableCell>
                  <TableCell>
                    <div>
                      <StatusBadge variant={effectiveActive ? 'success' : 'neutral'}>
                        {effectiveActive ? 'Active' : 'Inactive'}
                      </StatusBadge>
                      {overridden && (
                        <span className="text-foreground/80 text-xs">Admin set: {item.status}</span>
                      )}
                    </div>
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
                        <DropdownMenuItem onClick={() => handleOpenEdit(item)}>
                          Edit
                        </DropdownMenuItem>
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
              );
            })
          )}
        </TableBody>
      </Table>

      <LocationPagination
        totalCount={totalCount}
        currentPage={page}
        pageSize={limit}
        onPageChange={handlePageChange}
      />

      <CityDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        item={editingItem}
      />
    </div>
  );
}
