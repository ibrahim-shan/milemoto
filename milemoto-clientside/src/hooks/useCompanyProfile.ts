import type { CompanyProfileDto, CompanyProfileInputDto } from '@milemoto/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { authorizedGet, authorizedPut } from '@/lib/api';

const COMPANY_API_BASE = '/admin/company';

const fetchCompanyProfile = () => authorizedGet<CompanyProfileDto | null>(COMPANY_API_BASE);

const updateCompanyProfile = (payload: CompanyProfileInputDto) =>
  authorizedPut<CompanyProfileDto>(COMPANY_API_BASE, payload);

export const useGetCompanyProfile = () =>
  useQuery({
    queryKey: ['companyProfile'],
    queryFn: fetchCompanyProfile,
  });

export const useUpdateCompanyProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CompanyProfileInputDto) => {
      const promise = updateCompanyProfile(payload);
      toast.promise(promise, {
        loading: 'Saving company details...',
        success: 'Company details updated.',
        error: (err: Error & { message?: string }) =>
          err.message || 'Failed to update company details.',
      });
      return await promise;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companyProfile'] }),
  });
};
