/**
 * Tests for Zod procedure validation schemas.
 * Covers valid documents, missing fields, content blocks,
 * discriminated union rejection, recursive substeps, and nullable fields.
 */

import { describe, it, expect } from "vitest";
import {
  StructuredProcedureSchema,
  ContentBlockSchema,
  ProcedureStepSchema,
} from "../procedure-schema";

/** A minimal valid procedure that passes full schema validation. */
function validProcedure() {
  return {
    id: "proc-1",
    title: "Minimal Test Procedure",
    documentNumber: null,
    revision: null,
    effectiveDate: null,
    purpose: null,
    scope: null,
    roles: [],
    equipment: [],
    sections: [
      {
        id: "s1",
        title: "Section 1",
        steps: [
          {
            id: "st1",
            number: "1.1",
            instruction: "Do the thing",
            contentBlocks: [],
            substeps: [],
          },
        ],
      },
    ],
    metadata: {
      domain: null,
      totalSteps: 1,
      totalWarnings: 0,
      estimatedDuration: null,
    },
  };
}

describe("StructuredProcedureSchema", () => {
  it("accepts a valid minimal procedure", () => {
    const result = StructuredProcedureSchema.safeParse(validProcedure());
    expect(result.success).toBe(true);
  });

  it("rejects a procedure missing required fields", () => {
    const incomplete = { id: "proc-1" }; // missing title, sections, etc.
    const result = StructuredProcedureSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it("rejects when title is an empty string", () => {
    const proc = validProcedure();
    proc.title = "";
    const result = StructuredProcedureSchema.safeParse(proc);
    expect(result.success).toBe(false);
  });
});

describe("ContentBlockSchema", () => {
  it("validates a warning block", () => {
    const result = ContentBlockSchema.safeParse({
      type: "warning",
      text: "HIGH VOLTAGE",
    });
    expect(result.success).toBe(true);
  });

  it("validates a caution block", () => {
    const result = ContentBlockSchema.safeParse({
      type: "caution",
      text: "Handle with care",
    });
    expect(result.success).toBe(true);
  });

  it("validates a note block", () => {
    const result = ContentBlockSchema.safeParse({
      type: "note",
      text: "See appendix A",
    });
    expect(result.success).toBe(true);
  });

  it("validates a field_input block with unit", () => {
    const result = ContentBlockSchema.safeParse({
      type: "field_input",
      label: "Torque reading",
      inputType: "number",
      unit: "ft-lbs",
    });
    expect(result.success).toBe(true);
  });

  it("validates a field_input block without unit", () => {
    const result = ContentBlockSchema.safeParse({
      type: "field_input",
      label: "Serial number",
      inputType: "text",
    });
    expect(result.success).toBe(true);
  });

  it("validates a pass_fail block", () => {
    const result = ContentBlockSchema.safeParse({
      type: "pass_fail",
      criteria: "Pressure within 14.5-15.5 psi",
    });
    expect(result.success).toBe(true);
  });

  it("validates a sign_off block", () => {
    const result = ContentBlockSchema.safeParse({
      type: "sign_off",
      role: "TC",
      label: "Test Conductor approval",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid content block type", () => {
    const result = ContentBlockSchema.safeParse({
      type: "unknown_type",
      text: "something",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a warning block with empty text", () => {
    const result = ContentBlockSchema.safeParse({
      type: "warning",
      text: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("ProcedureStepSchema — recursive substeps", () => {
  it("accepts a step with nested substeps", () => {
    const step = {
      id: "st1",
      number: "1.1",
      instruction: "Parent step",
      contentBlocks: [],
      substeps: [
        {
          id: "st1a",
          number: "1.1.1",
          instruction: "Child step",
          contentBlocks: [],
          substeps: [
            {
              id: "st1a1",
              number: "1.1.1.1",
              instruction: "Grandchild step",
              contentBlocks: [],
              substeps: [],
            },
          ],
        },
      ],
    };
    const result = ProcedureStepSchema.safeParse(step);
    expect(result.success).toBe(true);
  });
});

describe("Nullable fields", () => {
  it("accepts null for documentNumber, revision, effectiveDate, purpose, scope", () => {
    const proc = validProcedure();
    // All nullable fields are already null in the fixture — just verify it passes.
    const result = StructuredProcedureSchema.safeParse(proc);
    expect(result.success).toBe(true);
  });

  it("accepts non-null strings for nullable fields", () => {
    const proc = validProcedure();
    proc.documentNumber = "DOC-001";
    proc.revision = "A";
    proc.effectiveDate = "2026-01-15";
    proc.purpose = "To verify system readiness";
    proc.scope = "Applies to all flight hardware";
    const result = StructuredProcedureSchema.safeParse(proc);
    expect(result.success).toBe(true);
  });

  it("accepts null domain in metadata", () => {
    const proc = validProcedure();
    proc.metadata.domain = null;
    const result = StructuredProcedureSchema.safeParse(proc);
    expect(result.success).toBe(true);
  });

  it("accepts null estimatedDuration in metadata", () => {
    const proc = validProcedure();
    proc.metadata.estimatedDuration = null;
    const result = StructuredProcedureSchema.safeParse(proc);
    expect(result.success).toBe(true);
  });
});
