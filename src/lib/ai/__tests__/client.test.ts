/**
 * Tests for the AI structuring engine client.
 * Uses a mock Anthropic client to verify behavior without real API calls.
 */

import { describe, it, expect } from "vitest";
import { structureDocument } from "../client";
import { createMockClient } from "./fixtures/mock-anthropic";
import type { ParsedDocument } from "@/lib/types/pipeline";

/** A minimal valid structured procedure JSON that passes Zod validation. */
const VALID_PROCEDURE_JSON = JSON.stringify({
  id: "test-1",
  title: "Test Procedure",
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
});

/** A mock parsed document with realistic metadata and raw text. */
function mockParsedDocument(rawText?: string): ParsedDocument {
  return {
    metadata: {
      filename: "test-proc.pdf",
      mimeType: "application/pdf",
      pageCount: 5,
      byteSize: 102400,
    },
    title: "Test Procedure",
    sections: [],
    rawText:
      rawText ??
      "1.0 PURPOSE\nThis procedure covers assembly of the widget.\n\n2.0 STEPS\n1.1 Attach bracket A to frame B.",
  };
}

describe("structureDocument", () => {
  it("returns success with a valid procedure on happy path", async () => {
    const client = createMockClient([
      { text: VALID_PROCEDURE_JSON, stopReason: "end_turn" },
    ]);

    const result = await structureDocument(mockParsedDocument(), client);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.procedure.id).toBe("test-1");
      expect(result.procedure.title).toBe("Test Procedure");
      expect(result.procedure.sections).toHaveLength(1);
      expect(result.procedure.sections[0].steps[0].instruction).toBe(
        "Do the thing"
      );
    }
  });

  it("retries on max_tokens truncation and succeeds", async () => {
    const client = createMockClient([
      // First response: truncated.
      { text: '{"id": "incomplete...', stopReason: "max_tokens" },
      // Second response: complete and valid.
      { text: VALID_PROCEDURE_JSON, stopReason: "end_turn" },
    ]);

    const result = await structureDocument(mockParsedDocument(), client);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.procedure.title).toBe("Test Procedure");
    }
  });

  it("retries on rate limit (429) and succeeds", async () => {
    const error429 = Object.assign(new Error("Rate limited"), { status: 429 });
    const client = createMockClient([
      // First call: rate limited.
      { error: error429 },
      // Second call: success.
      { text: VALID_PROCEDURE_JSON, stopReason: "end_turn" },
    ]);

    const result = await structureDocument(mockParsedDocument(), client);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.procedure.title).toBe("Test Procedure");
    }
  });

  it("returns failure on authentication error (401)", async () => {
    const error401 = Object.assign(new Error("Unauthorized"), { status: 401 });
    const client = createMockClient([{ error: error401 }]);

    const result = await structureDocument(mockParsedDocument(), client);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Authentication failed");
    }
  });

  it("returns failure when AI returns invalid JSON", async () => {
    const client = createMockClient([
      { text: "This is not JSON at all!", stopReason: "end_turn" },
    ]);

    const result = await structureDocument(mockParsedDocument(), client);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("JSON");
    }
  });

  it("returns failure for empty input text", async () => {
    const client = createMockClient([]);

    const result = await structureDocument(mockParsedDocument(""), client);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Document has no text content");
    }
  });
});
