import type {
  CreateTaxOutputDto,
  PaginatedTaxResponse,
  Tax,
  UpdateTaxOutputDto,
} from '@milemoto/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { authorizedDel, authorizedGet, authorizedPost } from '@/lib/api';

// ==== Query Keys & API Paths ====================================

const API_BASE = '/admin/taxes';

export const taxKeys = {
  all: ['taxes'] as const,
  lists: () => [...taxKeys.all, 'list'] as const,
  list: (params: unknown) => [...taxKeys.lists(), params] as const,
};

type TaxListParams = {
  search: string;
  page: number;
  limit: number;
};

// ==== Fetch Functions ===========================================

const listTaxes = (params: TaxListParams) => {
  const query = new URLSearchParams({
    search: params.search,
    page: String(params.page),
    limit: String(params.limit),
  });
  return authorizedGet<PaginatedTaxResponse>(`${API_BASE}?${query.toString()}`);
};

const createTax = (data: CreateTaxOutputDto) => authorizedPost<Tax>(`${API_BASE}`, data);

const updateTax = ({ id, ...data }: UpdateTaxOutputDto & { id: number }) =>
  authorizedPost<Tax>(`${API_BASE}/${id}`, data);

const deleteTax = (id: number) => authorizedDel<void>(`${API_BASE}/${id}`);

// ==== Hooks =====================================================

export const useGetTaxes = (params: TaxListParams) =>
  useQuery({
    queryKey: taxKeys.list(params),
    queryFn: () => listTaxes(params),
    placeholderData: previousData => previousData,
  });

export const useCreateTax = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateTaxOutputDto) => {
      const promise = createTax(data);
      toast.promise(promise, {
        loading: 'Creating tax...',
        success: 'Tax created successfully.',
        error: (err: Error & { code?: string; message?: string }) =>
          err.code === 'DuplicateTax'
            ? 'Tax entry already exists.'
            : err.message || 'Failed to create tax.',
      });
      return await promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxKeys.lists() });
    },
  });
};

export const useUpdateTax = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateTaxOutputDto & { id: number }) => {
      const promise = updateTax(data);
      toast.promise(promise, {
        loading: 'Updating tax...',
        success: 'Tax updated successfully.',
        error: (err: Error & { code?: string; message?: string }) =>
          err.code === 'DuplicateTax'
            ? 'Tax entry already exists.'
            : err.message || 'Failed to update tax.',
      });
      return await promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxKeys.lists() });
    },
  });
};

export const useDeleteTax = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const promise = deleteTax(id);
      toast.promise(promise, {
        loading: 'Deleting tax...',
        success: 'Tax deleted.',
        error: 'Failed to delete tax.',
      });
      return await promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxKeys.lists() });
    },
  });
};
