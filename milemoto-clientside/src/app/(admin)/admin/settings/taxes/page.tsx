'use client';

import React, { useMemo, useState } from 'react';

import type { Tax } from '@milemoto/types';
import { AlertCircle, MoreHorizontal, Plus, Search } from 'lucide-react';

import { Skeleton } from '@/features/feedback/Skeleton';
// Hooks & Utils
import { useDebounce } from '@/hooks/useDebounce';
import { useCreateTax, useDeleteTax, useGetTaxes, useUpdateTax } from '@/hooks/useTaxQueries';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/ui/alert-dialog';
// UI Components
import { Button } from '@/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/Card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { StatusBadge } from '@/ui/status-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table';

// ==== Pagination Logic ====

function usePagination({
  totalCount,
  pageSize,
  siblingCount = 1,
  currentPage,
}: {
  totalCount: number;
  pageSize: number;
  siblingCount?: number;
  currentPage: number;
}) {
  const totalPageCount = Math.ceil(totalCount / pageSize);

  const paginationRange = useMemo(() => {
    const totalPageNumbers = siblingCount + 5;

    if (totalPageNumbers >= totalPageCount) {
      return Array.from({ length: totalPageCount }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPageCount);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPageCount;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, '...', totalPageCount];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPageCount - rightItemCount + i + 1,
      );
      return [firstPageIndex, '...', ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i,
      );
      return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
    }
    return [];
  }, [totalPageCount, siblingCount, currentPage]);

  return paginationRange;
}

// ==== Types & Constants =========================================

type TaxFormData = {
  name: string;
  rate: string; // Use string for input, convert to number on submit
  type: 'percentage' | 'fixed';
  status: 'active' | 'inactive';
  country_code?: string;
};

const INITIAL_FORM: TaxFormData = {
  name: '',
  rate: '',
  type: 'percentage',
  status: 'active',
  country_code: '',
};

// ==== Sub-components ============================================

function FormField({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label
        htmlFor={id}
        className="text-right"
      >
        {label}
      </Label>
      <div className="col-span-3">{children}</div>
    </div>
  );
}

function TaxDialog({
  open,
  onOpenChange,
  tax,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tax?: Tax | null;
}) {
  const isEditMode = Boolean(tax);
  const initialData = useMemo(
    () =>
      tax
        ? {
            name: tax.name,
            rate: String(tax.rate),
            type: tax.type,
            status: tax.status,
            country_code: tax.country_code || '',
          }
        : INITIAL_FORM,
    [tax],
  );

  const [formData, setFormData] = useState<TaxFormData>(initialData);

  const createMutation = useCreateTax();
  const updateMutation = useUpdateTax();

  const isPending = createMutation.isPending || updateMutation.isPending;
  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      rate: parseFloat(formData.rate),
      country_code: formData.country_code || null, // Convert empty string to null
    };

    try {
      if (isEditMode && tax) {
        await updateMutation.mutateAsync({ id: tax.id, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onOpenChange(false);
    } catch {
      // Error handled by hook toast
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Tax' : 'Add New Tax'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the tax details.' : 'Configure a new tax rate for your store.'}
          </DialogDescription>
        </DialogHeader>
        <form
          id="tax-form"
          onSubmit={handleSubmit}
          className="space-y-4 py-4"
        >
          <FormField
            id="name"
            label="Name"
          >
            <Input
              id="name"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., VAT"
            />
          </FormField>
          <FormField
            id="rate"
            label="Rate"
          >
            <div className="relative">
              <Input
                id="rate"
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.rate}
                onChange={e => setFormData({ ...formData, rate: e.target.value })}
                placeholder="e.g., 20"
                className="pr-8"
              />
              <div className="text-muted-foreground absolute top-2.5 right-3 text-sm">
                {formData.type === 'percentage' ? '%' : '$'}
              </div>
            </div>
          </FormField>
          <FormField
            id="type"
            label="Type"
          >
            <Select
              value={formData.type}
              onValueChange={(val: 'percentage' | 'fixed') =>
                setFormData({ ...formData, type: val })
              }
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage (%)</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField
            id="country"
            label="Country Code"
          >
            <Input
              id="country"
              value={formData.country_code}
              onChange={e => setFormData({ ...formData, country_code: e.target.value })}
              placeholder="Optional (e.g., US, GB)"
              maxLength={2}
            />
          </FormField>
          <FormField
            id="status"
            label="Status"
          >
            <Select
              value={formData.status}
              onValueChange={(val: 'active' | 'inactive') =>
                setFormData({ ...formData, status: val })
              }
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </form>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="tax-form"
            variant="solid"
            disabled={isPending || (isEditMode && !isDirty)}
          >
            {isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ==== Main Page Component =======================================

export default function TaxesPage() {
  // State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);

  // Alert Dialog State
  const [taxToDelete, setTaxToDelete] = useState<Tax | null>(null);

  const limit = 10;

  // Queries & Mutations
  const { data, isLoading, isError } = useGetTaxes({
    search: debouncedSearch,
    page,
    limit,
  });

  const deleteMutation = useDeleteTax();

  // Handlers
  const handleOpenAdd = () => {
    setEditingTax(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Tax) => {
    setEditingTax(item);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (tax: Tax) => {
    setTaxToDelete(tax);
  };

  const confirmDelete = () => {
    if (taxToDelete) {
      deleteMutation.mutate(taxToDelete.id);
      setTaxToDelete(null);
    }
  };

  const taxes = data?.items ?? [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / limit);

  // Pagination Range
  const paginationRange = usePagination({
    totalCount,
    pageSize: limit,
    currentPage: page,
  });

  const onNext = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const onPrevious = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Taxes & Duties</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Toolbar area */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="relative max-w-sm flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
              <Input
                placeholder="Search taxes..."
                className="pl-9"
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <Button
              variant="solid"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={handleOpenAdd}
            >
              Add Tax
            </Button>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
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
                      <Skeleton className="h-5 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="ml-auto h-8 w-8" />
                    </TableCell>
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-red-500"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      <span>Failed to load taxes. Please try again.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : taxes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-muted-foreground h-32 text-center"
                  >
                    No taxes found.
                  </TableCell>
                </TableRow>
              ) : (
                taxes.map(tax => (
                  <TableRow key={tax.id}>
                    <TableCell className="font-medium">{tax.name}</TableCell>
                    <TableCell>
                      {tax.rate}
                      {tax.type === 'percentage' ? '%' : ''}
                    </TableCell>
                    <TableCell className="capitalize">{tax.type}</TableCell>
                    <TableCell>
                      {tax.country_code ? (
                        <span className="bg-muted rounded px-2 py-1 font-mono text-xs uppercase">
                          {tax.country_code}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm italic">Global</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge variant={tax.status === 'active' ? 'success' : 'neutral'}>
                        {tax.status === 'active' ? 'Active' : 'Inactive'}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label="Open menu"
                            justify="center"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEdit(tax)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(tax)}
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

          {/* Advanced Pagination */}
          {totalCount > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-muted-foreground text-sm">
                Page {page} of {totalPages} (Total {totalCount} items)
              </div>

              <Pagination className="mx-0 w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        onPrevious();
                      }}
                      className={page === 1 ? 'pointer-events-none opacity-50' : undefined}
                    />
                  </PaginationItem>

                  {paginationRange.map((p, index) => {
                    if (p === '...') {
                      return (
                        <PaginationItem key={`dots-${index}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }

                    return (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          isActive={p === page}
                          onClick={e => {
                            e.preventDefault();
                            setPage(p as number);
                          }}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        onNext();
                      }}
                      className={page === totalPages ? 'pointer-events-none opacity-50' : undefined}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <TaxDialog
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          tax={editingTax}
        />
      )}

      {/* Delete Alert Dialog */}
      <AlertDialog
        open={!!taxToDelete}
        onOpenChange={open => !open && setTaxToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tax Rate?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the
              <span className="text-foreground font-semibold"> {taxToDelete?.name} </span>
              tax rate. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
