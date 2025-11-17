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
  CreateStateOutputDto,
  PaginatedResponse,
  State,
  StateDropdownItem,
  UpdateStateDto,
} from '@milemoto/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { authorizedDel, authorizedGet, authorizedPost } from '@/lib/api';

const listStates = (params: LocationListParams) => {
  const query = new URLSearchParams({
    search: params.search,
    page: String(params.page),
    limit: String(params.limit),
  });
  return authorizedGet<PaginatedResponse<State>>(`${API_BASE}/states?${query.toString()}`);
};

const listAllStates = () => authorizedGet<{ items: StateDropdownItem[] }>(`${API_BASE}/states/all`);

const createState = (data: CreateStateOutputDto) =>
  authorizedPost<State>(`${API_BASE}/states`, data);

const updateState = ({ id, ...data }: UpdateStateDto & { id: number }) =>
  authorizedPost<State>(`${API_BASE}/states/${id}`, data);

const deleteState = (id: number) => authorizedDel<void>(`${API_BASE}/states/${id}`);

type DeleteStateContext = {
  paginated: PaginatedSnapshot<State>;
  dropdown: DropdownSnapshot<StateDropdownItem>;
};

export const useGetStates = (params: LocationListParams) =>
  useQuery({
    queryKey: locationKeys.list('states', params),
    queryFn: () => listStates(params),
    placeholderData: previousData => previousData,
    retry: false,
  });

export const useGetAllStates = () =>
  useQuery({
    queryKey: locationKeys.dropdown('states'),
    queryFn: listAllStates,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateState = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateStateOutputDto) => {
      const promise = createState(data);
      toast.promise(promise, {
        loading: 'Creating state...',
        success: 'State created successfully.',
        error: (err: Error & { code?: string; message?: string }) => {
          if (err.code === 'DuplicateState') {
            return 'A state with this name already exists for the selected country.';
          }
          if (err.code === 'ParentInactive') {
            return err.message || 'Cannot activate a state while its country is inactive.';
          }
          return err.message || 'Failed to create state.';
        },
      });
      return await promise;
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: locationKeys.lists(), type: 'active' }),
        queryClient.invalidateQueries({
          queryKey: locationKeys.dropdown('states'),
          type: 'active',
        }),
      ]),
  });
};

export const useUpdateState = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateStateDto & { id: number }) => {
      const promise = updateState(data);
      toast.promise(promise, {
        loading: 'Updating state...',
        success: 'State updated successfully.',
        error: (err: Error & { code?: string; message?: string }) => {
          if (err.code === 'DuplicateState') {
            return 'A state with this name already exists for the selected country.';
          }
          if (err.code === 'ParentInactive') {
            return err.message || 'Cannot activate a state while its country is inactive.';
          }
          return err.message || 'Failed to update state.';
        },
      });
      return await promise;
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: locationKeys.lists(), type: 'active' }),
        queryClient.invalidateQueries({
          queryKey: locationKeys.dropdown('states'),
          type: 'active',
        }),
      ]),
  });
};

export const useDeleteState = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const promise = deleteState(id);
      toast.promise(promise, {
        loading: 'Deleting state...',
        success: 'State deleted.',
        error: (err: Error & { code?: string; message?: string }) =>
          err.code === 'DeleteFailed'
            ? err.message || 'State cannot be deleted.'
            : err.message || 'Failed to delete state.',
      });
      return await promise;
    },
    onMutate: async (id: number): Promise<DeleteStateContext> => {
      await queryClient.cancelQueries({ queryKey: [...locationKeys.lists(), 'states'] });
      const paginated = removeFromPaginatedCache<State>(
        queryClient,
        [...locationKeys.lists(), 'states'],
        id,
      );
      const dropdown = removeFromDropdownCache<StateDropdownItem>(
        queryClient,
        locationKeys.dropdown('states'),
        id,
      );
      return { paginated, dropdown };
    },
    onError: (_err, _id, context) => {
      const ctx = context as DeleteStateContext | undefined;
      if (!ctx) return;
      restoreSnapshots(queryClient, ctx.paginated);
      restoreSnapshots(queryClient, ctx.dropdown);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: locationKeys.all, type: 'active' }),
  });
};
