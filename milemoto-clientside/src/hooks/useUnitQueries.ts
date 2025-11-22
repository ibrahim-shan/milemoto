import type {
  CreateUnitOutputDto,
  PaginatedUnitResponse,
  Unit,
  UnitDropdownItem,
  UpdateUnitDto,
} from '@milemoto/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { authorizedDel, authorizedGet, authorizedPost } from '@/lib/api';

// ==== Query Keys & API Paths ====================================

const API_BASE = '/admin/units';

export const unitKeys = {
  all: ['units'] as const,
  lists: () => [...unitKeys.all, 'list'] as const,
  list: (params: unknown) => [...unitKeys.lists(), params] as const,
  dropdowns: () => [...unitKeys.all, 'dropdown'] as const,
  dropdown: (includeInactive: boolean) =>
    [...unitKeys.dropdowns(), includeInactive ? 'all' : 'active'] as const,
};

type UnitListParams = {
  search: string;
  page: number;
  limit: number;
};

// ==== Fetch Functions ===========================================

const listUnits = (params: UnitListParams) => {
  const query = new URLSearchParams({
    search: params.search,
    page: String(params.page),
    limit: String(params.limit),
  });
  return authorizedGet<PaginatedUnitResponse>(`${API_BASE}?${query.toString()}`);
};

const listAllUnits = (includeInactive = false) => {
  const query = includeInactive ? '?includeInactive=1' : '';
  return authorizedGet<{ items: UnitDropdownItem[] }>(`${API_BASE}/all${query}`);
};

const createUnit = (data: CreateUnitOutputDto) => authorizedPost<Unit>(`${API_BASE}`, data);

const updateUnit = ({ id, ...data }: UpdateUnitDto & { id: number }) =>
  authorizedPost<Unit>(`${API_BASE}/${id}`, data);

const deleteUnit = (id: number) => authorizedDel<void>(`${API_BASE}/${id}`);

// ==== Hooks =====================================================

export const useGetUnits = (params: UnitListParams) =>
  useQuery({
    queryKey: unitKeys.list(params),
    queryFn: () => listUnits(params),
    placeholderData: previousData => previousData, // Keep previous data while fetching new page
  });

export const useGetAllUnits = (includeInactive = false) =>
  useQuery({
    queryKey: unitKeys.dropdown(includeInactive),
    queryFn: () => listAllUnits(includeInactive),
    staleTime: 1000 * 60 * 5, // Cache dropdowns longer
  });

export const useCreateUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateUnitOutputDto) => {
      const promise = createUnit(data);
      toast.promise(promise, {
        loading: 'Creating unit...',
        success: 'Unit created successfully.',
        error: (err: Error & { code?: string; message?: string }) =>
          err.code === 'DuplicateUnit'
            ? 'Unit code already exists.'
            : err.message || 'Failed to create unit.',
      });
      return await promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: unitKeys.lists() });
      queryClient.invalidateQueries({ queryKey: unitKeys.dropdowns() });
    },
  });
};

export const useUpdateUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateUnitDto & { id: number }) => {
      const promise = updateUnit(data);
      toast.promise(promise, {
        loading: 'Updating unit...',
        success: 'Unit updated successfully.',
        error: (err: Error & { code?: string; message?: string }) =>
          err.code === 'DuplicateUnit'
            ? 'Unit code already exists.'
            : err.message || 'Failed to update unit.',
      });
      return await promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: unitKeys.lists() });
      queryClient.invalidateQueries({ queryKey: unitKeys.dropdowns() });
    },
  });
};

export const useDeleteUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const promise = deleteUnit(id);
      toast.promise(promise, {
        loading: 'Deleting unit...',
        success: 'Unit deleted.',
        error: 'Failed to delete unit.',
      });
      return await promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: unitKeys.all });
    },
  });
};
