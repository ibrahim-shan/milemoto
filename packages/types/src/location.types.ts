// packages/types/src/location.types.ts
import { z } from "zod";

// ==== Base Schemas (used by backend and frontend forms) ====

const StatusEnum = z.enum(["active", "inactive"]);

const requiredForeignKey = (label: string) =>
  z
    .string()
    .min(1, { message: `${label} is required` })
    .transform((val) => {
      const num = Number(val);
      return Number.isFinite(num) && num > 0 ? num : null;
    })
    .refine((val) => val !== null, { message: `${label} is required` });

export const CreateCountry = z.object({
  name: z.string().min(2, "Name is required"),
  code: z.string().min(2, "Code is required").max(10),
  status: StatusEnum,
});
export type CreateCountryDto = z.infer<typeof CreateCountry>;
export type CreateCountryOutputDto = z.output<typeof CreateCountry>;

export const UpdateCountry = CreateCountry.partial();
export type UpdateCountryDto = z.infer<typeof UpdateCountry>;
export type UpdateCountryOutputDto = z.output<typeof UpdateCountry>;

export const CreateState = z.object({
  name: z.string().min(2),
  country_id: requiredForeignKey("Country"),
  status: StatusEnum,
});

export type CreateStateDto = z.infer<typeof CreateState>;
export type CreateStateOutputDto = z.output<typeof CreateState>;
export type CreateStateInputDto = z.input<typeof CreateState>;

export const UpdateState = CreateState.partial();
export type UpdateStateDto = z.infer<typeof UpdateState>;
export type UpdateStateOutputDto = z.output<typeof UpdateState>;

export const CreateCity = z.object({
  name: z.string().min(2),
  state_id: requiredForeignKey("State"),
  status: StatusEnum,
});
export type CreateCityDto = z.infer<typeof CreateCity>;
export type CreateCityOutputDto = z.output<typeof CreateCity>;
export type CreateCityInputDto = z.input<typeof CreateCity>;

export const UpdateCity = CreateCity.partial();
export type UpdateCityDto = z.infer<typeof UpdateCity>;
export type UpdateCityOutputDto = z.output<typeof UpdateCity>;

// ==== API Response Types (what the frontend queries receive) ====

export type Country = {
  id: number;
  name: string;
  code: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
};

export type State = {
  id: number;
  name: string;
  status: "active" | "inactive";
  status_effective: "active" | "inactive";
  // Joined from the 'countries' table in our GET list endpoint
  country_id: number;
  country_name: string;
  country_status: "active" | "inactive";
  country_status_effective: "active" | "inactive";
};

export type CityDropdownItem = {
  id: number;
  name: string;
  state_id: number; // Important for filtering by state
  status?: "active" | "inactive";
};

export type City = {
  id: number;
  name: string;
  status: "active" | "inactive";
  status_effective: "active" | "inactive";
  // Joined from 'states' and 'countries' tables
  state_id: number;
  state_name: string;
  state_status: "active" | "inactive";
  state_status_effective: "active" | "inactive";
  country_id: number;
  country_name: string;
  country_status: "active" | "inactive";
  country_status_effective: "active" | "inactive";
};

// For paginated responses
export type PaginatedResponse<T> = {
  items: T[];
  totalCount: number;
};

// For the /all dropdown endpoints
export type CountryDropdownItem = {
  id: number;
  name: string;
  status?: "active" | "inactive";
};

export type StateDropdownItem = {
  id: number;
  name: string;
  country_id: number;
  status?: "active" | "inactive";
  status_effective?: "active" | "inactive";
};
