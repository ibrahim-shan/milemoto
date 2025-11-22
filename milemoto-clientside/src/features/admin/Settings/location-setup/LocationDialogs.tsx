'use client';

import { useEffect, useMemo } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  City,
  Country,
  CountryDropdownItem,
  CreateCity,
  CreateCountry,
  CreateCountryDto,
  CreateCountryOutputDto,
  CreateState,
  State,
  StateDropdownItem,
} from '@milemoto/types';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import {
  useCreateCity,
  useCreateCountry,
  useCreateState,
  useGetAllCountries,
  useGetAllStates,
  useUpdateCity,
  useUpdateCountry,
  useUpdateState,
} from '@/hooks/useLocationQueries';
import { Button } from '@/ui/Button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/ui/dialog';
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  FormField as RHFFormField,
} from '@/ui/form';
import { Input } from '@/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';

type DialogProps<T> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: T | null;
};

const CreateStateFormSchema = z.object({
  name: CreateState.shape.name,
  country_id: z.string().min(1, 'Country is required'),
  status: CreateState.shape.status,
});

const CreateCityFormSchema = z.object({
  name: CreateCity.shape.name,
  state_id: z.string().min(1, 'State is required'),
  status: CreateCity.shape.status,
});

// --- Country Dialog (This component is correct) ---
export function CountryDialog({ open, onOpenChange, item }: DialogProps<Country>) {
  const isEditMode = Boolean(item);

  const createMutation = useCreateCountry();
  const updateMutation = useUpdateCountry();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<CreateCountryDto, undefined, CreateCountryOutputDto>({
    resolver: zodResolver(CreateCountry),
    defaultValues: {
      name: '',
      code: '',
      status: 'active',
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name,
        code: item.code,
        status: item.status,
      });
    } else {
      form.reset({
        name: '',
        code: '',
        status: 'active',
      });
    }
  }, [item, form]);

  const handleSubmit = (data: CreateCountryOutputDto) => {
    if (isEditMode && item) {
      updateMutation.mutate({ id: item.id, ...data }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Country' : 'Add Country'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            id="country-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 py-4"
          >
            <RHFFormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Country Name</FormLabel>
                  <FormControl className="col-span-3">
                    <Input
                      {...field}
                      placeholder="e.g., Lebanon"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage className="col-span-4" />
                </FormItem>
              )}
            />

            <RHFFormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Country Code</FormLabel>
                  <FormControl className="col-span-3">
                    <Input
                      {...field}
                      placeholder="e.g., LB"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage className="col-span-4" />
                </FormItem>
              )}
            />

            <RHFFormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isPending}
                  >
                    <FormControl className="col-span-3">
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="col-span-4" />
                </FormItem>
              )}
            />
          </form>
        </Form>
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
            form="country-form"
            variant="solid"
            disabled={isPending || !form.formState.isDirty}
            isLoading={isPending}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- State Dialog (Fixed) ---
export function StateDialog({ open, onOpenChange, item }: DialogProps<State>) {
  const isEditMode = Boolean(item);
  const createMutation = useCreateState();
  const updateMutation = useUpdateState();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const { data: countriesData, isLoading: isLoadingCountries } = useGetAllCountries();
  const countries = useMemo<CountryDropdownItem[]>(
    () => countriesData?.items ?? [],
    [countriesData],
  );

  const augmentedCountries = useMemo<CountryDropdownItem[]>(() => {
    if (!isEditMode || !item) return countries;
    if (countries.some(country => country.id === item.country_id)) return countries;
    return [
      {
        id: item.country_id,
        name: item.country_name,
        status: item.country_status,
      },
      ...countries,
    ];
  }, [countries, isEditMode, item]);

  const form = useForm<z.infer<typeof CreateStateFormSchema>>({
    resolver: zodResolver(CreateStateFormSchema),
    defaultValues: {
      name: '',
      country_id: '',
      status: 'active' as const,
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name,
        country_id: String(item.country_id),
        status: item.status,
      });
    } else {
      form.reset({
        name: '',
        country_id: '',
        status: 'active',
      });
    }
  }, [item, form]);

  // Fixed useWatch - remove generic parameter
  const watchedCountryId = useWatch({
    control: form.control,
    name: 'country_id',
  });

  const numericCountryId = watchedCountryId ? Number(watchedCountryId) : undefined;
  const selectedFromActiveList = countries.some(country => country.id === numericCountryId);
  const allowActiveState =
    selectedFromActiveList ||
    (isEditMode &&
      item !== null &&
      item.country_id === numericCountryId &&
      item.country_status === 'active' &&
      item.country_status_effective === 'active');

  // Handle the type conversion in the submit handler
  const handleSubmit = (data: z.infer<typeof CreateStateFormSchema>) => {
    const submitData = CreateState.parse(data);
    if (isEditMode && item) {
      updateMutation.mutate(
        { id: item.id, ...submitData },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createMutation.mutate(submitData, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit State' : 'Add State'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            id="state-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 py-4"
          >
            <RHFFormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">State Name</FormLabel>
                  <FormControl className="col-span-3">
                    <Input
                      {...field}
                      placeholder="e.g., Beirut"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage className="col-span-4" />
                </FormItem>
              )}
            />

            <RHFFormField
              control={form.control}
              name="country_id"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Country</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ''}
                    disabled={isPending || isLoadingCountries}
                  >
                    <FormControl className="col-span-3">
                      <SelectTrigger>
                        <SelectValue placeholder="Select a country..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {augmentedCountries.length === 0 ? (
                        <SelectItem
                          value="__no-country"
                          disabled
                        >
                          No active countries available
                        </SelectItem>
                      ) : (
                        augmentedCountries.map(country => (
                          <SelectItem
                            key={country.id}
                            value={String(country.id)}
                          >
                            {country.name}
                            {isEditMode &&
                            item &&
                            country.id === item.country_id &&
                            item.country_status_effective === 'inactive'
                              ? ' (Inactive)'
                              : ''}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage className="col-span-4" />
                </FormItem>
              )}
            />

            <RHFFormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isPending}
                  >
                    <FormControl className="col-span-3">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem
                        value="active"
                        disabled={!allowActiveState}
                      >
                        Active
                      </SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="col-span-4" />
                </FormItem>
              )}
            />
          </form>
        </Form>
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
            form="state-form"
            variant="solid"
            disabled={isPending || !form.formState.isDirty}
            isLoading={isPending}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- City Dialog (Refactored) ---
// --- City Dialog (Fixed) ---
export function CityDialog({ open, onOpenChange, item }: DialogProps<City>) {
  const isEditMode = Boolean(item);
  const createMutation = useCreateCity();
  const updateMutation = useUpdateCity();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const { data: statesData, isLoading: isLoadingStates } = useGetAllStates();
  const states = useMemo<StateDropdownItem[]>(() => statesData?.items ?? [], [statesData]);

  const augmentedStates = useMemo<StateDropdownItem[]>(() => {
    if (!isEditMode || !item) return states;
    if (states.some(state => state.id === item.state_id)) return states;
    return [
      {
        id: item.state_id,
        name: item.state_name,
        status: item.state_status,
        country_id: item.country_id,
        status_effective: item.state_status_effective,
      },
      ...states,
    ];
  }, [states, isEditMode, item]);

  // Fixed form type - remove the generic parameters
  const form = useForm<z.infer<typeof CreateCityFormSchema>>({
    resolver: zodResolver(CreateCityFormSchema),
    defaultValues: {
      name: '',
      state_id: '',
      status: 'active' as const,
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name,
        state_id: String(item.state_id),
        status: item.status,
      });
    } else {
      form.reset({
        name: '',
        state_id: '',
        status: 'active',
      });
    }
  }, [item, form]);

  // Fixed useWatch - remove generic parameter
  const watchedStateId = useWatch({
    control: form.control,
    name: 'state_id',
  });

  const numericStateId = watchedStateId ? Number(watchedStateId) : undefined;
  const selectedStateActive = states.some(state => state.id === numericStateId);
  const allowActiveCity =
    selectedStateActive ||
    (isEditMode &&
      item !== null &&
      item.state_id === numericStateId &&
      item.state_status_effective === 'active' &&
      item.country_status_effective === 'active');

  const handleSubmit = (data: z.infer<typeof CreateCityFormSchema>) => {
    const submitData = CreateCity.parse(data);
    if (isEditMode && item) {
      updateMutation.mutate(
        { id: item.id, ...submitData },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createMutation.mutate(submitData, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit City' : 'Add City'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            id="city-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 py-4"
          >
            <RHFFormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">City Name</FormLabel>
                  <FormControl className="col-span-3">
                    <Input
                      {...field}
                      placeholder="e.g., Sin el Fil"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage className="col-span-4" />
                </FormItem>
              )}
            />

            <RHFFormField
              control={form.control}
              name="state_id"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">State</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ''}
                    disabled={isPending || isLoadingStates}
                  >
                    <FormControl className="col-span-3">
                      <SelectTrigger>
                        <SelectValue placeholder="Select a state..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {augmentedStates.length === 0 ? (
                        <SelectItem
                          value="__no-state"
                          disabled
                        >
                          No active states available
                        </SelectItem>
                      ) : (
                        augmentedStates.map(state => (
                          <SelectItem
                            key={state.id}
                            value={String(state.id)}
                          >
                            {state.name}
                            {isEditMode &&
                            item &&
                            state.id === item.state_id &&
                            (item.state_status_effective !== 'active' ||
                              item.country_status_effective !== 'active')
                              ? ' (Inactive)'
                              : ''}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage className="col-span-4" />
                </FormItem>
              )}
            />

            <RHFFormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isPending}
                  >
                    <FormControl className="col-span-3">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem
                        value="active"
                        disabled={!allowActiveCity}
                      >
                        Active
                      </SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="col-span-4" />
                </FormItem>
              )}
            />
          </form>
        </Form>
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
            form="city-form"
            variant="solid"
            disabled={isPending || !form.formState.isDirty}
            isLoading={isPending}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
