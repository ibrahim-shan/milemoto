'use client';

import React, { useMemo, useState } from 'react';

import type { ShippingAreaRate } from '@milemoto/types';
import { MoreHorizontal, Plus, Search } from 'lucide-react';

import { Skeleton } from '@/features/feedback/Skeleton';
// Hooks & Utils
import { useDebounce } from '@/hooks/useDebounce';
import { useGetAllCities, useGetAllCountries, useGetAllStates } from '@/hooks/useLocationQueries';
import {
  useCreateAreaRate,
  useDeleteAreaRate,
  useGetAreaRates,
  useGetShippingMethods,
  useUpdateAreaRate,
  useUpdateShippingMethod,
} from '@/hooks/useShippingQueries';
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/ui/Card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Switch } from '@/ui/switch'; // Replaced Radio with Switc

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table';

// ==== Reusable Components ====

function SettingInputCard({
  title,
  label,
  id,
  placeholder,
  defaultValue,
  onSave,
  isPending,
}: {
  title: string;
  label: string;
  id: string;
  placeholder?: string;
  defaultValue?: number;
  onSave: (val: number) => void;
  isPending?: boolean;
}) {
  const [value, setValue] = useState(defaultValue ?? 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Label htmlFor={id}>{label}</Label>
        <div className="relative mt-2">
          <Input
            id={id}
            type="number"
            inputMode="decimal"
            placeholder={placeholder}
            value={value}
            onChange={e => setValue(parseFloat(e.target.value))}
            className="pl-7"
          />
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button
          variant="solid"
          size="sm"
          onClick={() => onSave(value)}
          disabled={isPending}
        >
          {isPending ? 'Saving...' : 'Save'}
        </Button>
      </CardFooter>
    </Card>
  );
}

// ==== Dialog for Area Rates ====

type AreaRateFormData = {
  country_id: string;
  state_id: string;
  city_id: string;
  cost: string;
};

const INITIAL_AREA_FORM: AreaRateFormData = {
  country_id: '',
  state_id: '',
  city_id: '',
  cost: '',
};

function OrderAreaDialog({
  open,
  onOpenChange,
  area,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  area?: ShippingAreaRate | null;
}) {
  const isEditMode = Boolean(area);
  const initialData = useMemo(
    () =>
      area
        ? {
            country_id: String(area.country_id),
            state_id: area.state_id ? String(area.state_id) : '',
            city_id: area.city_id ? String(area.city_id) : '',
            cost: String(area.cost),
          }
        : INITIAL_AREA_FORM,
    [area],
  );

  const [formData, setFormData] = useState<AreaRateFormData>(initialData);

  // Fetch Countries for Dropdown
  const { data: countriesData } = useGetAllCountries();

  // Fetch States based on selected country
  const { data: statesData } = useGetAllStates();
  const filteredStates =
    statesData?.items.filter(state => state.country_id === parseInt(formData.country_id)) || [];

  // Fetch Cities based on selected state
  const { data: citiesData } = useGetAllCities();
  const filteredCities =
    citiesData?.items.filter(city => city.state_id === parseInt(formData.state_id)) || [];

  const createMutation = useCreateAreaRate();
  const updateMutation = useUpdateAreaRate();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  const handleCountryChange = (countryId: string) => {
    setFormData({
      country_id: countryId,
      state_id: '',
      city_id: '',
      cost: formData.cost,
    });
  };

  const handleStateChange = (stateId: string) => {
    setFormData({
      ...formData,
      state_id: stateId,
      city_id: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      cost: parseFloat(formData.cost),
      country_id: parseInt(formData.country_id),
      state_id: formData.state_id ? parseInt(formData.state_id) : null,
      city_id: formData.city_id ? parseInt(formData.city_id) : null,
    };

    try {
      if (isEditMode && area) {
        await updateMutation.mutateAsync({ id: area.id, cost: payload.cost });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onOpenChange(false);
    } catch {
      // Error toast handled by hook
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Order Area' : 'Add Order Area'}</DialogTitle>
        </DialogHeader>
        <form
          id="area-form"
          onSubmit={handleSubmit}
          className="space-y-4 py-4"
        >
          {/* Country Select */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="country"
              className="text-right"
            >
              Country
            </Label>
            <div className="col-span-3">
              <Select
                value={formData.country_id}
                onValueChange={handleCountryChange}
                disabled={isEditMode}
                required
              >
                <SelectTrigger id="country">
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  {countriesData?.items.map(country => (
                    <SelectItem
                      key={country.id}
                      value={String(country.id)}
                    >
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* State Select */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="state"
              className="text-right"
            >
              State
            </Label>
            <div className="col-span-3">
              <Select
                value={formData.state_id}
                onValueChange={handleStateChange}
                disabled={isEditMode || !formData.country_id}
                required={false}
              >
                <SelectTrigger id="state">
                  <SelectValue placeholder="Select State (Optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {filteredStates.map(state => (
                    <SelectItem
                      key={state.id}
                      value={String(state.id)}
                    >
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* City Select */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="city"
              className="text-right"
            >
              City
            </Label>
            <div className="col-span-3">
              <Select
                value={formData.city_id}
                onValueChange={cityId => setFormData({ ...formData, city_id: cityId })}
                disabled={isEditMode || !formData.state_id}
                required={false}
              >
                <SelectTrigger id="city">
                  <SelectValue placeholder="Select City (Optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {filteredCities.map(city => (
                    <SelectItem
                      key={city.id}
                      value={String(city.id)}
                    >
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cost Input */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="cost"
              className="text-right"
            >
              Cost
            </Label>
            <div className="col-span-3">
              <div className="relative">
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost}
                  onChange={e => setFormData({ ...formData, cost: e.target.value })}
                  className="pl-7"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </div>
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
            form="area-form"
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

// ==== Table for Area Rates ====

function OrderAreaTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const limit = 5;

  // Queries
  const { data, isLoading, isError } = useGetAreaRates({
    search: debouncedSearch,
    page,
    limit,
  });
  const deleteMutation = useDeleteAreaRate();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<ShippingAreaRate | null>(null);
  const [areaToDelete, setAreaToDelete] = useState<ShippingAreaRate | null>(null);

  const handleOpenAdd = () => {
    setEditingArea(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (area: ShippingAreaRate) => {
    setEditingArea(area);
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    if (areaToDelete) {
      deleteMutation.mutate(areaToDelete.id);
      setAreaToDelete(null);
    }
  };

  const areas = data?.items ?? [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Order Area</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="relative max-w-sm flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
              <Input
                placeholder="Search areas..."
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
              Add Order Area
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Country</TableHead>
                <TableHead>State</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Shipping Cost</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-10" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="ml-auto h-8 w-8" />
                    </TableCell>
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-4 text-center text-red-500"
                  >
                    Failed to load areas
                  </TableCell>
                </TableRow>
              ) : areas.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-muted-foreground py-4 text-center"
                  >
                    No areas found
                  </TableCell>
                </TableRow>
              ) : (
                areas.map(area => (
                  <TableRow key={area.id}>
                    <TableCell>{area.country_name}</TableCell>
                    <TableCell>
                      {area.state_name || <span className="text-muted-foreground">All States</span>}
                    </TableCell>
                    <TableCell>
                      {area.city_name || <span className="text-muted-foreground">All Cities</span>}
                    </TableCell>
                    <TableCell>${area.cost.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            justify="center"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEdit(area)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setAreaToDelete(area)}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isLoading}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <OrderAreaDialog
        key={editingArea?.id ?? 'new'}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        area={editingArea}
      />

      <AlertDialog
        open={!!areaToDelete}
        onOpenChange={open => !open && setAreaToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Area Rule?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the rule for {areaToDelete?.country_name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ==== Main Page Component ====

function ToggleItem({
  id,
  checked,
  onCheckedChange,
  label,
  disabled,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (c: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <Label
        htmlFor={id}
        className="flex-1 cursor-pointer"
      >
        {label}
      </Label>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
}

export default function ShippingPage() {
  // Fetch methods from API
  const { data: methods, isLoading } = useGetShippingMethods();
  const updateMethodMutation = useUpdateShippingMethod();

  const handleToggle = (code: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    updateMethodMutation.mutate({ code, status: newStatus });
  };

  // Helpers to find method status
  const productMethod = methods?.find(m => m.code === 'product_wise');
  const flatMethod = methods?.find(m => m.code === 'flat_rate');
  const areaMethod = methods?.find(m => m.code === 'area_wise');

  const isProductActive = productMethod?.status === 'active';
  const isFlatActive = flatMethod?.status === 'active';
  const isAreaActive = areaMethod?.status === 'active';

  const handleSaveFlatCost = (cost: number) => {
    updateMethodMutation.mutate({ code: 'flat_rate', cost });
  };

  const handleSaveAreaDefaultCost = (cost: number) => {
    updateMethodMutation.mutate({ code: 'area_wise', cost });
  };

  return (
    <div className="space-y-6">
      {/* 1. Shipping Method Selection Card (Using Toggles) */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : (
            <>
              <ToggleItem
                id="product"
                label="Product Wise"
                checked={isProductActive}
                onCheckedChange={() =>
                  handleToggle('product_wise', productMethod?.status || 'inactive')
                }
              />
              <ToggleItem
                id="flat"
                label="Flat Rate Wise"
                checked={isFlatActive}
                onCheckedChange={() => handleToggle('flat_rate', flatMethod?.status || 'inactive')}
              />
              <ToggleItem
                id="area"
                label="Area Wise"
                checked={isAreaActive}
                onCheckedChange={() => handleToggle('area_wise', areaMethod?.status || 'inactive')}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* 2. Conditional "Flat Rate" Card */}
      {isFlatActive && (
        <SettingInputCard
          title="Flat Rate Wise"
          label="Shipping Cost"
          id="flat-cost"
          placeholder="Enter flat shipping cost"
          defaultValue={flatMethod?.cost ?? 0}
          onSave={handleSaveFlatCost}
          isPending={updateMethodMutation.isPending}
        />
      )}

      {/* 3. Conditional "Area Wise" Cards */}
      {isAreaActive && (
        <div className="space-y-6">
          <SettingInputCard
            title="Area Wise"
            label="Default Shipping Cost (Fallback)"
            id="area-default-cost"
            placeholder="Enter default cost"
            defaultValue={areaMethod?.cost ?? 0}
            onSave={handleSaveAreaDefaultCost}
            isPending={updateMethodMutation.isPending}
          />
          <OrderAreaTable />
        </div>
      )}
    </div>
  );
}
