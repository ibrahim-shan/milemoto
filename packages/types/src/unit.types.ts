import { z } from "zod";

// ==== Base Schemas ====

const StatusEnum = z.enum(["active", "inactive"]);

export const CreateUnit = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required").max(10, "Code is too long"),
  status: StatusEnum,
});

export type CreateUnitDto = z.infer<typeof CreateUnit>;
export type CreateUnitOutputDto = z.output<typeof CreateUnit>;

export const UpdateUnit = CreateUnit.partial();

export type UpdateUnitDto = z.infer<typeof UpdateUnit>;
export type UpdateUnitOutputDto = z.output<typeof UpdateUnit>;

// ==== API Response Types ====

export type Unit = {
  id: number;
  name: string;
  code: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
};

// For paginated responses (reusable pattern)
export type PaginatedUnitResponse = {
  items: Unit[];
  totalCount: number;
};

// For dropdowns (reusable pattern)
export type UnitDropdownItem = {
  id: number;
  name: string;
  code: string;
  status: "active" | "inactive";
};