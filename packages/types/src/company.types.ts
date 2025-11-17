import { z } from "zod";

export const CompanyProfileInput = z.object({
  name: z.string().min(1, "Company name is required"),
  publicEmail: z.string().email("Invalid email").nullish(),
  phone: z.string().min(1).max(64).nullish(),
  website: z.string().url("Invalid URL").nullish(),
  address: z.string().min(1).max(255).nullish(),
  city: z.string().min(1).max(191).nullish(),
  state: z.string().min(1).max(191).nullish(),
  zip: z.string().min(1).max(32).nullish(),
  countryId: z.string().nullable(),
  latitude: z.number().finite().nullish(),
  longitude: z.number().finite().nullish(),
});

export type CompanyProfileInputDto = z.infer<typeof CompanyProfileInput>;

export type CompanyProfileDto = CompanyProfileInputDto & {
  id: number;
  createdAt: string;
  updatedAt: string;
  countryName: string | null;
  countryStatus: "active" | "inactive" | null;
};
