import {
  API_BASE,
  locationKeys,
  removeFromDropdownCache,
  removeFromPaginatedCache,
  restoreSnapshots,
  type DropdownSnapshot,
  type LocationListParams,
  type PaginatedSnapshot,
} from './shared';
import type {
  Country,
  CountryDropdownItem,
  CreateCountryOutputDto,
  PaginatedResponse,
  UpdateCountryDto,
} from '@milemoto/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { authorizedDel, authorizedGet, authorizedPost } from '@/lib/api';

const listCountries = (params: LocationListParams) => {
  const query = new URLSearchParams({
    search: params.search,
    page: String(params.page),
    limit: String(params.limit),
  });
  return authorizedGet<PaginatedResponse<Country>>(`${API_BASE}/countries?${query.toString()}`);
};

const listAllCountries = (includeInactive = false) => {
  const query = includeInactive ? '?includeInactive=1' : '';
  return authorizedGet<{ items: CountryDropdownItem[] }>(`${API_BASE}/countries/all${query}`);
};

const createCountry = (data: CreateCountryOutputDto) =>
  authorizedPost<Country>(`${API_BASE}/countries`, data);

const updateCountry = ({ id, ...data }: UpdateCountryDto & { id: number }) =>
  authorizedPost<Country>(`${API_BASE}/countries/${id}`, data);

const deleteCountry = (id: number) => authorizedDel<void>(`${API_BASE}/countries/${id}`);

type DeleteCountryContext = {
  paginated: PaginatedSnapshot<Country>;
  dropdown: DropdownSnapshot<CountryDropdownItem>;
};

export const useGetCountries = (params: LocationListParams) =>
  useQuery({
    queryKey: locationKeys.list('countries', params),
    queryFn: () => listCountries(params),
    placeholderData: previousData => previousData,
    retry: false,
  });

export const useGetAllCountries = (includeInactive = false) =>
  useQuery({
    queryKey: [...locationKeys.dropdown('countries'), includeInactive ? 'all' : 'active'],
    queryFn: () => listAllCountries(includeInactive),
    staleTime: 1000 * 60 * 5,
  });

export const useCreateCountry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCountryOutputDto) => {
      const promise = createCountry(data);
      toast.promise(promise, {
        loading: 'Creating country...',
        success: 'Country created successfully.',
        error: (err: Error & { code?: string; message?: string }) =>
          err.code === 'DuplicateCountry'
            ? 'Country code already exists.'
            : err.message || 'Failed to create country.',
      });
      return await promise;
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: locationKeys.lists(), type: 'active' }),
        queryClient.invalidateQueries({ queryKey: locationKeys.dropdowns(), exact: false }),
        queryClient.invalidateQueries({
          queryKey: locationKeys.dropdown('countries'),
          exact: false,
        }),
      ]),
  });
};

export const useUpdateCountry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateCountryDto & { id: number }) => {
      const promise = updateCountry(data);
      toast.promise(promise, {
        loading: 'Updating country...',
        success: 'Country updated successfully.',
        error: (err: Error & { code?: string; message?: string }) =>
          err.code === 'DuplicateCountry'
            ? 'Country code already exists.'
            : err.message || 'Failed to update country.',
      });
      return await promise;
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: locationKeys.lists(), type: 'active' }),
        queryClient.invalidateQueries({ queryKey: locationKeys.dropdowns(), exact: false }),
        queryClient.invalidateQueries({
          queryKey: locationKeys.dropdown('countries'),
          exact: false,
        }),
      ]),
  });
};

export const useDeleteCountry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const promise = deleteCountry(id);
      toast.promise(promise, {
        loading: 'Deleting country...',
        success: 'Country deleted.',
        error: (err: Error & { code?: string; message?: string }) =>
          err.code === 'DeleteFailed'
            ? err.message || 'Country cannot be deleted.'
            : err.message || 'Failed to delete country.',
      });
      return await promise;
    },
    onMutate: async (id: number): Promise<DeleteCountryContext> => {
      await queryClient.cancelQueries({ queryKey: [...locationKeys.lists(), 'countries'] });
      const paginated = removeFromPaginatedCache<Country>(
        queryClient,
        [...locationKeys.lists(), 'countries'],
        id,
      );
      const dropdown = removeFromDropdownCache<CountryDropdownItem>(
        queryClient,
        locationKeys.dropdown('countries'),
        id,
      );
      return { paginated, dropdown };
    },
    onError: (_err, _id, context) => {
      const ctx = context as DeleteCountryContext | undefined;
      if (!ctx) return;
      restoreSnapshots(queryClient, ctx.paginated);
      restoreSnapshots(queryClient, ctx.dropdown);
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: locationKeys.all, type: 'active' }),
        queryClient.invalidateQueries({ queryKey: locationKeys.dropdowns(), exact: false }),
        queryClient.invalidateQueries({
          queryKey: locationKeys.dropdown('countries'),
          exact: false,
        }),
      ]),
  });
};
