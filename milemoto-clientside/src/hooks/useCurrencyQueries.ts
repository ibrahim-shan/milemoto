import type {
  CreateCurrencyOutputDto,
  Currency,
  PaginatedCurrencyResponse,
  UpdateCurrencyOutputDto,
} from '@milemoto/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { authorizedDel, authorizedGet, authorizedPost } from '@/lib/api';

// ==== Query Keys & API Paths ====================================

const API_BASE = '/admin/currencies';

export const currencyKeys = {
  all: ['currencies'] as const,
  lists: () => [...currencyKeys.all, 'list'] as const,
  list: (params: unknown) => [...currencyKeys.lists(), params] as const,
};

type CurrencyListParams = {
  search: string;
  page: number;
  limit: number;
};

// ==== Fetch Functions ===========================================

const listCurrencies = (params: CurrencyListParams) => {
  const query = new URLSearchParams({
    search: params.search,
    page: String(params.page),
    limit: String(params.limit),
  });
  return authorizedGet<PaginatedCurrencyResponse>(`${API_BASE}?${query.toString()}`);
};

const createCurrency = (data: CreateCurrencyOutputDto) =>
  authorizedPost<Currency>(`${API_BASE}`, data);

const updateCurrency = ({ id, ...data }: UpdateCurrencyOutputDto & { id: number }) =>
  authorizedPost<Currency>(`${API_BASE}/${id}`, data);

const deleteCurrency = (id: number) => authorizedDel<void>(`${API_BASE}/${id}`);

// ==== Hooks =====================================================

export const useGetCurrencies = (params: CurrencyListParams) =>
  useQuery({
    queryKey: currencyKeys.list(params),
    queryFn: () => listCurrencies(params),
    placeholderData: previousData => previousData,
  });

export const useCreateCurrency = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCurrencyOutputDto) => {
      const promise = createCurrency(data);
      toast.promise(promise, {
        loading: 'Creating currency...',
        success: 'Currency created successfully.',
        error: (err: Error & { code?: string; message?: string }) =>
          err.code === 'DuplicateCurrency'
            ? 'Currency code already exists.'
            : err.message || 'Failed to create currency.',
      });
      return await promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: currencyKeys.lists() });
    },
  });
};

export const useUpdateCurrency = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateCurrencyOutputDto & { id: number }) => {
      const promise = updateCurrency(data);
      toast.promise(promise, {
        loading: 'Updating currency...',
        success: 'Currency updated successfully.',
        error: (err: Error & { code?: string; message?: string }) =>
          err.code === 'DuplicateCurrency'
            ? 'Currency code already exists.'
            : err.message || 'Failed to update currency.',
      });
      return await promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: currencyKeys.lists() });
    },
  });
};

export const useDeleteCurrency = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const promise = deleteCurrency(id);
      toast.promise(promise, {
        loading: 'Deleting currency...',
        success: 'Currency deleted.',
        error: 'Failed to delete currency.',
      });
      return await promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: currencyKeys.lists() });
    },
  });
};
