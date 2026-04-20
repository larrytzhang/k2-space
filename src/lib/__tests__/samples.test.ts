/**
 * Contract tests for the pre-authored sample procedures shipped under
 * /public/samples/. Each sample's JSON result must validate against the
 * StructuredProcedureSchema; otherwise the demo would crash in the viewer.
 *
 * These tests guard against the common mistake of updating a sample source
 * document without updating the matching JSON result (or vice versa).
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { SAMPLE_PROCEDURES } from "@/lib/samples";
import { StructuredProcedureSchema } from "@/lib/validation/procedure-schema";

/** Resolve a path under /public relative to the repo root. */
function publicPath(rel: string): string {
  return join(process.cwd(), "public", rel.replace(/^\//, ""));
}

describe("sample procedures", () => {
  it("declares at least three samples", () => {
    expect(SAMPLE_PROCEDURES.length).toBeGreaterThanOrEqual(3);
  });

  for (const sample of SAMPLE_PROCEDURES) {
    describe(sample.id, () => {
      it("has a readable source document on disk", () => {
        const path = publicPath(sample.sourcePath);
        expect(existsSync(path)).toBe(true);
        const content = readFileSync(path, "utf-8");
        expect(content.length).toBeGreaterThan(100);
      });

      it("has a result JSON that validates against the schema", () => {
        const path = publicPath(sample.resultPath);
        expect(existsSync(path)).toBe(true);
        const raw = readFileSync(path, "utf-8");
        const parsed = JSON.parse(raw) as unknown;
        const result = StructuredProcedureSchema.safeParse(parsed);
        if (!result.success) {
          throw new Error(
            `Sample ${sample.id} failed schema validation: ${result.error.message}`
          );
        }
        expect(result.success).toBe(true);
      });

      it("has a declared domain that matches a supported value", () => {
        expect(["test", "inspection", "safety"]).toContain(sample.domain);
      });
    });
  }
});
