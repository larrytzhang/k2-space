/**
 * Zod validation schemas for structured aerospace procedures.
 * Mirrors the TypeScript types in @/lib/types/procedure.ts.
 * Used to validate AI-generated procedure JSON at runtime.
 */

import { z } from "zod";
import type { ProcedureStep } from "@/lib/types/procedure";

/** Schema for a personnel role (e.g., Test Conductor, QA). */
export const RoleSchema = z.object({
  abbreviation: z.string().min(1),
  fullName: z.string().min(1),
});

/** Schema for an equipment or material item. */
export const EquipmentItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.string().optional(),
  specification: z.string().optional(),
});

/**
 * Schema for a content block attached to a procedure step.
 * Discriminated union on the "type" field — covers warnings, cautions,
 * notes, field inputs, pass/fail criteria, and sign-off lines.
 */
export const ContentBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("warning"), text: z.string().min(1) }),
  z.object({ type: z.literal("caution"), text: z.string().min(1) }),
  z.object({ type: z.literal("note"), text: z.string().min(1) }),
  z.object({
    type: z.literal("field_input"),
    label: z.string().min(1),
    inputType: z.enum(["text", "number", "checkbox"]),
    unit: z.string().optional(),
  }),
  z.object({ type: z.literal("pass_fail"), criteria: z.string().min(1) }),
  z.object({
    type: z.literal("sign_off"),
    role: z.string().min(1),
    label: z.string().min(1),
  }),
]);

/**
 * Schema for a single procedure step.
 * Uses z.lazy() for recursive substeps.
 */
export const ProcedureStepSchema: z.ZodType<ProcedureStep> = z.lazy(() =>
  z.object({
    id: z.string().min(1),
    number: z.string().min(1),
    instruction: z.string().min(1),
    contentBlocks: z.array(ContentBlockSchema),
    substeps: z.array(ProcedureStepSchema),
  })
);

/** Schema for a named section containing ordered steps. */
export const ProcedureSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  steps: z.array(ProcedureStepSchema),
});

/** Schema for procedure summary metadata. */
export const ProcedureMetadataSchema = z.object({
  domain: z
    .enum([
      "assembly",
      "test",
      "inspection",
      "launch",
      "maintenance",
      "safety",
    ])
    .nullable(),
  totalSteps: z.number().int().nonnegative(),
  totalWarnings: z.number().int().nonnegative(),
  estimatedDuration: z.string().nullable(),
});

/**
 * Top-level schema for a fully structured aerospace procedure.
 * This is the primary validation target for AI-generated output.
 */
export const StructuredProcedureSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  documentNumber: z.string().nullable(),
  revision: z.string().nullable(),
  effectiveDate: z.string().nullable(),
  purpose: z.string().nullable(),
  scope: z.string().nullable(),
  roles: z.array(RoleSchema),
  equipment: z.array(EquipmentItemSchema),
  sections: z.array(ProcedureSectionSchema),
  metadata: ProcedureMetadataSchema,
});
