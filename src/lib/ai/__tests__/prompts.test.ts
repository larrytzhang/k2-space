/**
 * Tests for AI prompt templates.
 * Validates system prompt content and user prompt formatting.
 */

import { describe, it, expect } from "vitest";
import { SYSTEM_PROMPT, buildUserPrompt } from "../prompts";
import type { ParsedDocument } from "@/lib/types/pipeline";

describe("SYSTEM_PROMPT", () => {
  it("contains the aerospace analyst identity", () => {
    expect(SYSTEM_PROMPT).toContain(
      "expert aerospace procedure analyst"
    );
  });

  it("contains extraction rules for content blocks", () => {
    expect(SYSTEM_PROMPT).toContain("warning");
    expect(SYSTEM_PROMPT).toContain("caution");
    expect(SYSTEM_PROMPT).toContain("field_input");
    expect(SYSTEM_PROMPT).toContain("pass_fail");
    expect(SYSTEM_PROMPT).toContain("sign_off");
  });

  it("contains the critical rule about preserving safety text", () => {
    expect(SYSTEM_PROMPT).toContain("Preserve ALL safety text");
  });

  it("instructs JSON-only output", () => {
    expect(SYSTEM_PROMPT).toContain("Respond with ONLY the JSON object");
  });

  it("distinguishes WARNING (personnel) from CAUTION (equipment)", () => {
    expect(SYSTEM_PROMPT).toContain("WARNING = personnel danger");
    expect(SYSTEM_PROMPT).toContain("CAUTION = equipment risk");
  });
});

describe("buildUserPrompt", () => {
  const mockParsed: ParsedDocument = {
    metadata: {
      filename: "procedure-001.pdf",
      mimeType: "application/pdf",
      pageCount: 12,
      byteSize: 204800,
    },
    title: "Assembly Procedure",
    sections: [],
    rawText: "Step 1: Attach bracket.\nStep 2: Torque to 25 ft-lbs.",
  };

  it("includes the filename", () => {
    const prompt = buildUserPrompt(mockParsed);
    expect(prompt).toContain("procedure-001.pdf");
  });

  it("includes the mimeType", () => {
    const prompt = buildUserPrompt(mockParsed);
    expect(prompt).toContain("application/pdf");
  });

  it("includes the pageCount", () => {
    const prompt = buildUserPrompt(mockParsed);
    expect(prompt).toContain("Pages: 12");
  });

  it("wraps raw text in document tags", () => {
    const prompt = buildUserPrompt(mockParsed);
    expect(prompt).toContain("<document>");
    expect(prompt).toContain("</document>");
  });

  it("includes the raw text content", () => {
    const prompt = buildUserPrompt(mockParsed);
    expect(prompt).toContain("Step 1: Attach bracket.");
    expect(prompt).toContain("Step 2: Torque to 25 ft-lbs.");
  });

  it("ends with extraction instruction", () => {
    const prompt = buildUserPrompt(mockParsed);
    expect(prompt).toContain(
      "Extract the structured procedure from the document above."
    );
  });
});
