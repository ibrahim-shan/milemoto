import {
  API_BASE,
  locationKeys,
  removeFromPaginatedCache,
  restoreSnapshots,
  type LocationListParams,
  type PaginatedSnapshot,
} from './shared';
import type { City, CreateCityOutputDto, PaginatedResponse, UpdateCityDto } from '@milemoto/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { authorizedDel, authorizedGet, authorizedPost } from '@/lib/api';

const listCities = (params: LocationListParams) => {
  const query = new URLSearchParams({
    search: params.search,
    page: String(params.page),
    limit: String(params.limit),
  });
  return authorizedGet<PaginatedResponse<City>>(`${API_BASE}/cities?${query.toString()}`);
};

const createCity = (data: CreateCityOutputDto) => authorizedPost<City>(`${API_BASE}/cities`, data);

const updateCity = ({ id, ...data }: UpdateCityDto & { id: number }) =>
  authorizedPost<City>(`${API_BASE}/cities/${id}`, data);

const deleteCity = (id: number) => authorizedDel<void>(`${API_BASE}/cities/${id}`);

type DeleteCityContext = {
  paginated: PaginatedSnapshot<City>;
};

export const useGetCities = (params: LocationListParams) =>
  useQuery({
    queryKey: locationKeys.list('cities', params),
    queryFn: () => listCities(params),
    placeholderData: previousData => previousData,
    retry: false,
  });

export const useCreateCity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCityOutputDto) => {
      const promise = createCity(data);
      toast.promise(promise, {
        loading: 'Creating city...',
        success: 'City created successfully.',
        error: (err: Error & { code?: string; message?: string }) => {
          if (err.code === 'DuplicateCity') {
            return 'A city with this name already exists for the selected state.';
          }
          if (err.code === 'ParentInactive') {
            return err.message || 'Cannot activate a city while its state or country is inactive.';
          }
          return err.message || 'Failed to create city.';
        },
      });
      return await promise;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: locationKeys.lists(), type: 'active' }),
  });
};

export const useUpdateCity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateCityDto & { id: number }) => {
      const promise = updateCity(data);
      toast.promise(promise, {
        loading: 'Updating city...',
        success: 'City updated successfully.',
        error: (err: Error & { code?: string; message?: string }) => {
          if (err.code === 'DuplicateCity') {
            return 'A city with this name already exists for the selected state.';
          }
          if (err.code === 'ParentInactive') {
            return err.message || 'Cannot activate a city while its state or country is inactive.';
          }
          return err.message || 'Failed to update city.';
        },
      });
      return await promise;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: locationKeys.lists(), type: 'active' }),
  });
};

export const useDeleteCity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const promise = deleteCity(id);
      toast.promise(promise, {
        loading: 'Deleting city...',
        success: 'City deleted.',
        error: (err: Error & { code?: string; message?: string }) =>
          err.code === 'DeleteFailed'
            ? err.message || 'City cannot be deleted.'
            : err.message || 'Failed to delete city.',
      });
      return await promise;
    },
    onMutate: async (id: number): Promise<DeleteCityContext> => {
      await queryClient.cancelQueries({ queryKey: [...locationKeys.lists(), 'cities'] });
      const paginated = removeFromPaginatedCache<City>(
        queryClient,
        [...locationKeys.lists(), 'cities'],
        id,
      );
      return { paginated };
    },
    onError: (_err, _id, context) => {
      const ctx = context as DeleteCityContext | undefined;
      if (!ctx) return;
      restoreSnapshots(queryClient, ctx.paginated);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: locationKeys.lists(), type: 'active' }),
  });
};
