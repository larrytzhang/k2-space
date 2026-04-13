import { describe, it, expect } from "vitest";
import {
  parseDocument,
  UnsupportedFileTypeError,
  FileTooLargeError,
  EmptyDocumentError,
} from "../index";
import type { DocumentInput } from "../types";

describe("parseDocument — integration tests", () => {
  it("parses a TXT buffer end-to-end", async () => {
    const content =
      "1. Introduction\nThis document describes the test procedure.\n\n2. Safety\nWear PPE at all times.\n- Goggles\n- Gloves";
    const input: DocumentInput = {
      buffer: Buffer.from(content, "utf-8"),
      filename: "procedure.txt",
      mimeType: "text/plain",
    };

    const result = await parseDocument(input);

    // Metadata
    expect(result.metadata.filename).toBe("procedure.txt");
    expect(result.metadata.mimeType).toBe("text/plain");
    expect(result.metadata.pageCount).toBe(1);
    expect(result.metadata.byteSize).toBe(input.buffer.length);

    // Title inferred from first heading
    expect(result.title).toBe("Introduction");

    // Sections detected
    expect(result.sections.length).toBeGreaterThanOrEqual(2);
    expect(result.sections[0].heading).toBe("Introduction");
    expect(result.sections[0].level).toBe(1);
    expect(result.sections[1].heading).toBe("Safety");

    // Raw text preserved
    expect(result.rawText).toContain("This document describes");
    expect(result.rawText).toContain("Wear PPE");
  });

  it("parses plain text without headings", async () => {
    const content = "Just a simple paragraph with no headings.\nAnother line.";
    const input: DocumentInput = {
      buffer: Buffer.from(content, "utf-8"),
      filename: "notes.txt",
      mimeType: "text/plain",
    };

    const result = await parseDocument(input);

    expect(result.sections).toHaveLength(1);
    expect(result.sections[0].heading).toBeNull();
    expect(result.sections[0].level).toBe(0);
    // Title falls back to filename
    expect(result.title).toBe("notes");
  });

  it("throws UnsupportedFileTypeError for unsupported MIME types", async () => {
    const input: DocumentInput = {
      buffer: Buffer.from("data"),
      filename: "image.png",
      mimeType: "image/png",
    };

    await expect(parseDocument(input)).rejects.toThrow(
      UnsupportedFileTypeError
    );
    await expect(parseDocument(input)).rejects.toThrow(
      "Unsupported file type: image/png"
    );
  });

  it("throws FileTooLargeError for oversized files", async () => {
    // Create a buffer just over 10 MB
    const bigBuffer = Buffer.alloc(10 * 1024 * 1024 + 1, "a");
    const input: DocumentInput = {
      buffer: bigBuffer,
      filename: "huge.txt",
      mimeType: "text/plain",
    };

    await expect(parseDocument(input)).rejects.toThrow(FileTooLargeError);
    await expect(parseDocument(input)).rejects.toThrow("exceeds maximum");
  });

  it("throws EmptyDocumentError for empty text files", async () => {
    const input: DocumentInput = {
      buffer: Buffer.from("", "utf-8"),
      filename: "empty.txt",
      mimeType: "text/plain",
    };

    await expect(parseDocument(input)).rejects.toThrow(EmptyDocumentError);
    await expect(parseDocument(input)).rejects.toThrow(
      "no extractable text"
    );
  });

  it("throws EmptyDocumentError for whitespace-only text files", async () => {
    const input: DocumentInput = {
      buffer: Buffer.from("   \n\n\t  \n  ", "utf-8"),
      filename: "blank.txt",
      mimeType: "text/plain",
    };

    await expect(parseDocument(input)).rejects.toThrow(EmptyDocumentError);
  });

  it("cleans text (NBSP, line endings, blank lines)", async () => {
    const content =
      "1. Title\r\n\u00A0Some\u00A0text\r\n\r\n\r\n\r\nMore text   ";
    const input: DocumentInput = {
      buffer: Buffer.from(content, "utf-8"),
      filename: "messy.txt",
      mimeType: "text/plain",
    };

    const result = await parseDocument(input);

    // NBSP replaced
    expect(result.rawText).not.toContain("\u00A0");
    expect(result.rawText).toContain(" Some text");
    // Blank lines collapsed
    expect(result.rawText).not.toContain("\n\n\n");
    // Trailing whitespace trimmed
    expect(result.rawText).not.toMatch(/[ \t]+$/m);
  });

  it("extracts list items from sections", async () => {
    const content =
      "1. Checklist\n- Safety goggles\n- Hard hat\n- Steel-toed boots";
    const input: DocumentInput = {
      buffer: Buffer.from(content, "utf-8"),
      filename: "checklist.txt",
      mimeType: "text/plain",
    };

    const result = await parseDocument(input);

    const checklistSection = result.sections.find(
      (s) => s.heading === "Checklist"
    );
    expect(checklistSection).toBeDefined();
    expect(checklistSection!.listItems).toContain("Safety goggles");
    expect(checklistSection!.listItems).toContain("Hard hat");
    expect(checklistSection!.listItems).toContain("Steel-toed boots");
  });
});
