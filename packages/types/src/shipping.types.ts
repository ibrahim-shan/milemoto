// packages/types/src/shipping.types.ts
import { z } from "zod";

// ==== Enums ====
export const ShippingMethodTypeEnum = z.enum([
  "product_wise",
  "flat_rate",
  "area_wise",
]);

export const StatusEnum = z.enum(["active", "inactive"]);

// ==== Shipping Method Schemas (Global Settings) ====

// For updating the main methods (enabling/disabling, setting global flat rate)
export const UpdateShippingMethod = z.object({
  status: StatusEnum.optional(),
  cost: z.coerce.number().min(0, "Cost must be positive").optional(), // Used for Flat Rate
});

export type UpdateShippingMethodDto = z.infer<typeof UpdateShippingMethod>;

// ==== Area Rate Schemas (For Area Wise) ====

export const CreateAreaRate = z.object({
  country_id: z.coerce.number().min(1, "Country is required"),
  state_id: z.coerce.number().optional().nullable(),
  city_id: z.coerce.number().optional().nullable(),
  cost: z.coerce.number().min(0, "Shipping cost is required"),
});

export type CreateAreaRateDto = z.infer<typeof CreateAreaRate>;

export const UpdateAreaRate = CreateAreaRate.partial();
export type UpdateAreaRateDto = z.infer<typeof UpdateAreaRate>;

// ==== API Response Types ====

export type ShippingMethod = {
  id: number;
  code: "product_wise" | "flat_rate" | "area_wise";
  name: string;
  status: "active" | "inactive";
  cost: number | null; // Only used for flat_rate
  updated_at: string;
};

export type ShippingAreaRate = {
  id: number;
  country_id: number;
  country_name: string;
  state_id: number | null;
  state_name: string | null;
  city_id: number | null;
  city_name: string | null;
  cost: number;
};

export type PaginatedAreaRateResponse = {
  items: ShippingAreaRate[];
  totalCount: number;
};