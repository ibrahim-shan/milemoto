'use client';

import React, { useMemo, useState } from 'react';

import type { Currency } from '@milemoto/types';
import { AlertCircle, MoreHorizontal, Plus, Search } from 'lucide-react';

import { Skeleton } from '@/features/feedback/Skeleton';
import {
  useCreateCurrency,
  useDeleteCurrency,
  useGetCurrencies,
  useUpdateCurrency,
} from '@/hooks/useCurrencyQueries';
// Hooks & Utils
import { useDebounce } from '@/hooks/useDebounce';
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

type CurrencyFormData = {
  name: string;
  code: string;
  symbol: string;
  exchangeRate: string; // string for input handling
  status: 'active' | 'inactive';
};

const INITIAL_FORM: CurrencyFormData = {
  name: '',
  code: '',
  symbol: '',
  exchangeRate: '1.0',
  status: 'active',
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

function CurrencyDialog({
  open,
  onOpenChange,
  currency,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency?: Currency | null;
}) {
  const isEditMode = Boolean(currency);
  const initialData = useMemo(
    () =>
      currency
        ? {
            name: currency.name,
            code: currency.code,
            symbol: currency.symbol,
            exchangeRate: String(currency.exchangeRate),
            status: currency.status,
          }
        : INITIAL_FORM,
    [currency],
  );

  const [formData, setFormData] = useState<CurrencyFormData>(initialData);

  const createMutation = useCreateCurrency();
  const updateMutation = useUpdateCurrency();

  const isPending = createMutation.isPending || updateMutation.isPending;
  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      exchangeRate: parseFloat(formData.exchangeRate),
      code: formData.code.toUpperCase(),
    };

    try {
      if (isEditMode && currency) {
        await updateMutation.mutateAsync({ id: currency.id, ...payload });
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
          <DialogTitle>{isEditMode ? 'Edit Currency' : 'Add New Currency'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the currency details.' : 'Add a new currency to your store.'}
          </DialogDescription>
        </DialogHeader>
        <form
          id="currency-form"
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
              placeholder="e.g., US Dollar"
            />
          </FormField>
          <FormField
            id="code"
            label="Code"
          >
            <Input
              id="code"
              required
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g., USD"
              maxLength={5}
            />
          </FormField>
          <FormField
            id="symbol"
            label="Symbol"
          >
            <Input
              id="symbol"
              required
              value={formData.symbol}
              onChange={e => setFormData({ ...formData, symbol: e.target.value })}
              placeholder="e.g., $"
            />
          </FormField>
          <FormField
            id="exchangeRate"
            label="Exchange Rate"
          >
            <Input
              id="exchangeRate"
              type="number"
              step="0.000001"
              min="0"
              required
              value={formData.exchangeRate}
              onChange={e => setFormData({ ...formData, exchangeRate: e.target.value })}
              placeholder="e.g., 1.0"
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
            form="currency-form"
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

export default function CurrenciesPage() {
  // State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);

  // Alert Dialog State
  const [currencyToDelete, setCurrencyToDelete] = useState<Currency | null>(null);

  const limit = 10;

  // Queries & Mutations
  const { data, isLoading, isError } = useGetCurrencies({
    search: debouncedSearch,
    page,
    limit,
  });

  const deleteMutation = useDeleteCurrency();

  // Handlers
  const handleOpenAdd = () => {
    setEditingCurrency(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Currency) => {
    setEditingCurrency(item);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (currency: Currency) => {
    setCurrencyToDelete(currency);
  };

  const confirmDelete = () => {
    if (currencyToDelete) {
      deleteMutation.mutate(currencyToDelete.id);
      setCurrencyToDelete(null);
    }
  };

  const currencies = data?.items ?? [];
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
          <CardTitle>Currencies</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Toolbar area */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="relative max-w-sm flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
              <Input
                placeholder="Search currencies..."
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
              Add Currency
            </Button>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Exchange Rate</TableHead>
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
                      <Skeleton className="h-5 w-8" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
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
                      <span>Failed to load currencies. Please try again.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : currencies.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-muted-foreground h-32 text-center"
                  >
                    No currencies found.
                  </TableCell>
                </TableRow>
              ) : (
                currencies.map(currency => (
                  <TableRow key={currency.id}>
                    <TableCell className="font-medium">{currency.name}</TableCell>
                    <TableCell>{currency.symbol}</TableCell>
                    <TableCell className="font-mono text-sm">{currency.code}</TableCell>
                    <TableCell>{currency.exchangeRate.toFixed(4)}</TableCell>
                    <TableCell>
                      <StatusBadge variant={currency.status === 'active' ? 'success' : 'neutral'}>
                        {currency.status === 'active' ? 'Active' : 'Inactive'}
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
                          <DropdownMenuItem onClick={() => handleOpenEdit(currency)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(currency)}
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
        <CurrencyDialog
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          currency={editingCurrency}
        />
      )}

      {/* Delete Alert Dialog */}
      <AlertDialog
        open={!!currencyToDelete}
        onOpenChange={open => !open && setCurrencyToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Currency?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete
              <span className="text-foreground font-semibold">
                {' '}
                {currencyToDelete?.name} ({currencyToDelete?.code}){' '}
              </span>
              from your store. This action cannot be undone.
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
