import { z } from "zod";

// ==== Base Schemas ====

const StatusEnum = z.enum(["active", "inactive"]);

export const CreateCurrency = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(2, "Code is required").max(5, "Code is too long"), // e.g., USD, EUR
  symbol: z.string().min(1, "Symbol is required"), // e.g., $, €
  exchangeRate: z.number().min(0, "Exchange rate must be positive"),
  status: StatusEnum.default("active"),
});

export type CreateCurrencyDto = z.infer<typeof CreateCurrency>;
export type CreateCurrencyOutputDto = z.output<typeof CreateCurrency>;

export const UpdateCurrency = CreateCurrency.partial();

export type UpdateCurrencyDto = z.infer<typeof UpdateCurrency>;
export type UpdateCurrencyOutputDto = z.output<typeof UpdateCurrency>;

// ==== API Response Types ====

export type Currency = {
  id: number;
  name: string;
  code: string;
  symbol: string;
  exchangeRate: number;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
};

// For paginated responses
export type PaginatedCurrencyResponse = {
  items: Currency[];
  totalCount: number;
};
