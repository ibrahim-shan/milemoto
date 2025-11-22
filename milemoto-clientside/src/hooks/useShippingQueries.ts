import type {
  CreateAreaRateDto,
  PaginatedAreaRateResponse,
  ShippingAreaRate,
  ShippingMethod,
  UpdateAreaRateDto,
  UpdateShippingMethodDto,
} from '@milemoto/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { authorizedDel, authorizedGet, authorizedPatch, authorizedPost } from '@/lib/api';

// ==== Query Keys & API Paths ====================================

const API_BASE = '/admin/shipping';

export const shippingKeys = {
  all: ['shipping'] as const,
  methods: () => [...shippingKeys.all, 'methods'] as const,
  areaRates: () => [...shippingKeys.all, 'area-rates'] as const,
  areaRatesList: (params: unknown) => [...shippingKeys.areaRates(), 'list', params] as const,
};

type AreaRateListParams = {
  search: string;
  page: number;
  limit: number;
};

// ==== Fetch Functions ===========================================

// -- Methods --
const listShippingMethods = () => authorizedGet<ShippingMethod[]>(`${API_BASE}/methods`);

const updateShippingMethod = ({ code, ...data }: UpdateShippingMethodDto & { code: string }) =>
  authorizedPatch<ShippingMethod>(`${API_BASE}/methods/${code}`, data);

// -- Area Rates --
const listAreaRates = (params: AreaRateListParams) => {
  const query = new URLSearchParams({
    search: params.search,
    page: String(params.page),
    limit: String(params.limit),
  });
  return authorizedGet<PaginatedAreaRateResponse>(`${API_BASE}/area-rates?${query.toString()}`);
};

const createAreaRate = (data: CreateAreaRateDto) =>
  authorizedPost<ShippingAreaRate>(`${API_BASE}/area-rates`, data);

const updateAreaRate = ({ id, ...data }: UpdateAreaRateDto & { id: number }) =>
  authorizedPatch<ShippingAreaRate>(`${API_BASE}/area-rates/${id}`, data);

const deleteAreaRate = (id: number) => authorizedDel<void>(`${API_BASE}/area-rates/${id}`);

// ==== Hooks =====================================================

// -- Shipping Methods Hooks --

export const useGetShippingMethods = () =>
  useQuery({
    queryKey: shippingKeys.methods(),
    queryFn: listShippingMethods,
  });

export const useUpdateShippingMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateShippingMethodDto & { code: string }) => {
      const promise = updateShippingMethod(data);
      toast.promise(promise, {
        loading: 'Updating shipping method...',
        success: 'Shipping method updated.',
        error: 'Failed to update shipping method.',
      });
      return await promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shippingKeys.methods() });
    },
  });
};

// -- Area Rates Hooks --

export const useGetAreaRates = (params: AreaRateListParams) =>
  useQuery({
    queryKey: shippingKeys.areaRatesList(params),
    queryFn: () => listAreaRates(params),
    placeholderData: previousData => previousData,
  });

export const useCreateAreaRate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAreaRateDto) => {
      const promise = createAreaRate(data);
      toast.promise(promise, {
        loading: 'Creating area rate...',
        success: 'Area rate created successfully.',
        error: (err: Error & { code?: string; message?: string }) =>
          err.code === 'DuplicateRate'
            ? 'A rate for this location already exists.'
            : err.message || 'Failed to create area rate.',
      });
      return await promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shippingKeys.areaRates() });
    },
  });
};

export const useUpdateAreaRate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateAreaRateDto & { id: number }) => {
      const promise = updateAreaRate(data);
      toast.promise(promise, {
        loading: 'Updating rate...',
        success: 'Rate updated successfully.',
        error: 'Failed to update rate.',
      });
      return await promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shippingKeys.areaRates() });
    },
  });
};

export const useDeleteAreaRate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const promise = deleteAreaRate(id);
      toast.promise(promise, {
        loading: 'Deleting rate...',
        success: 'Rate deleted.',
        error: 'Failed to delete rate.',
      });
      return await promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shippingKeys.areaRates() });
    },
  });
};
