import type { PaginatedResponse } from '@milemoto/types';
import type { QueryClient } from '@tanstack/react-query';

export type PaginatedSnapshot<T> = Array<{
  queryKey: readonly unknown[];
  data: PaginatedResponse<T> | undefined;
}>;

export type DropdownSnapshot<T> = Array<{
  queryKey: readonly unknown[];
  data: { items: T[] } | undefined;
}>;

function sameId(a: unknown, b: unknown) {
  const numA = Number(a);
  const numB = Number(b);
  return !Number.isNaN(numA) && !Number.isNaN(numB) && numA === numB;
}

export function removeFromPaginatedCache<T extends { id: number | string }>(
  queryClient: QueryClient,
  prefix: readonly unknown[],
  id: number,
): PaginatedSnapshot<T> {
  const snapshots = queryClient
    .getQueriesData<PaginatedResponse<T>>({ queryKey: prefix })
    .map(([queryKey, data]) => ({ queryKey, data }));

  snapshots.forEach(({ queryKey, data }) => {
    if (!data) return;
    if (!data.items.some((item: T) => sameId(item.id, id))) return;
    queryClient.setQueryData<PaginatedResponse<T>>(queryKey, {
      ...data,
      items: data.items.filter((item: T) => !sameId(item.id, id)),
      totalCount: Math.max(0, data.totalCount - 1),
    });
  });

  return snapshots;
}

export function removeFromDropdownCache<T extends { id: number | string }>(
  queryClient: QueryClient,
  prefix: readonly unknown[],
  id: number,
): DropdownSnapshot<T> {
  const snapshots = queryClient
    .getQueriesData<{ items: T[] }>({ queryKey: prefix })
    .map(([queryKey, data]) => ({ queryKey, data }));

  snapshots.forEach(({ queryKey, data }) => {
    if (!data) return;
    if (!data.items.some((item: T) => sameId(item.id, id))) return;
    queryClient.setQueryData(queryKey, {
      ...data,
      items: data.items.filter((item: T) => !sameId(item.id, id)),
    });
  });

  return snapshots;
}

export function restoreSnapshots<T>(
  queryClient: QueryClient,
  snapshots: PaginatedSnapshot<T> | DropdownSnapshot<T> | undefined,
) {
  if (!snapshots) return;
  snapshots.forEach(({ queryKey, data }) => queryClient.setQueryData(queryKey, data));
}

export const API_BASE = '/admin/locations';

export const locationKeys = {
  all: ['locations'] as const,
  lists: () => [...locationKeys.all, 'list'] as const,
  list: (type: string, params: unknown) => [...locationKeys.lists(), type, params] as const,
  dropdowns: () => [...locationKeys.all, 'dropdown'] as const,
  dropdown: (type: string) => [...locationKeys.dropdowns(), type] as const,
};

export type LocationListParams = { search: string; page: number; limit: number };
