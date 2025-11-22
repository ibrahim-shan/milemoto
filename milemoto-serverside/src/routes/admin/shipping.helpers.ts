import { z } from 'zod';

// Re-export shared schemas/types for convenience in the backend
export {
  UpdateShippingMethod,
  CreateAreaRate,
  UpdateAreaRate,
  type UpdateShippingMethodDto,
  type CreateAreaRateDto,
  type UpdateAreaRateDto,
} from '@milemoto/types';

// Define schema for listing (search & pagination)
export const ListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
});

export type ListQueryDto = z.infer<typeof ListQuery>;
