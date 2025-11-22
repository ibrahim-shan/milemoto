import { z } from "zod";

// ==== Base Schemas ====

const StatusEnum = z.enum(["active", "inactive"]);
const TaxTypeEnum = z.enum(["percentage", "fixed"]);

export const CreateTax = z.object({
  name: z.string().min(1, "Name is required"),
  rate: z.number().min(0, "Rate must be positive"),
  type: TaxTypeEnum.default("percentage"),
  status: StatusEnum.default("active"),
  country_code: z.string().min(2).optional().nullable(), // Optional: Apply to specific country
  state_code: z.string().optional().nullable(), // Optional: Apply to specific state
});

export type CreateTaxDto = z.infer<typeof CreateTax>;
export type CreateTaxOutputDto = z.output<typeof CreateTax>;

export const UpdateTax = CreateTax.partial();

export type UpdateTaxDto = z.infer<typeof UpdateTax>;
export type UpdateTaxOutputDto = z.output<typeof UpdateTax>;

// ==== API Response Types ====

export type Tax = {
  id: number;
  name: string;
  rate: number;
  type: "percentage" | "fixed";
  status: "active" | "inactive";
  country_code: string | null;
  state_code: string | null;
  created_at: string;
  updated_at: string;
};

// For paginated responses
export type PaginatedTaxResponse = {
  items: Tax[];
  totalCount: number;
};
