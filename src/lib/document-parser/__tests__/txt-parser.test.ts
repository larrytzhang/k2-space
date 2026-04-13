import { describe, it, expect } from "vitest";
import { parseTxt } from "../parsers/txt-parser";

describe("parseTxt", () => {
  it("parses a basic text buffer", async () => {
    const content = "Hello, world!\nThis is a test document.";
    const buffer = Buffer.from(content, "utf-8");

    const result = await parseTxt(buffer, "test.txt");

    expect(result.text).toBe(content);
    expect(result.pages).toHaveLength(1);
    expect(result.pages[0].pageNumber).toBe(1);
    expect(result.pages[0].text).toBe(content);
    expect(result.metadata.filename).toBe("test.txt");
    expect(result.metadata.mimeType).toBe("text/plain");
    expect(result.metadata.pageCount).toBe(1);
  });

  it("handles an empty buffer", async () => {
    const buffer = Buffer.from("", "utf-8");

    const result = await parseTxt(buffer, "empty.txt");

    expect(result.text).toBe("");
    expect(result.pages).toHaveLength(1);
    expect(result.pages[0].text).toBe("");
    expect(result.metadata.pageCount).toBe(1);
  });

  it("preserves line endings in the raw text", async () => {
    const content = "line1\r\nline2\nline3\rline4";
    const buffer = Buffer.from(content, "utf-8");

    const result = await parseTxt(buffer, "lines.txt");

    // parseTxt does NOT normalize — that's text-cleaner's job
    expect(result.text).toBe(content);
  });

  it("handles UTF-8 encoded content", async () => {
    const content = "Procedure \u2014 Step 1: Check \u2603 temperature";
    const buffer = Buffer.from(content, "utf-8");

    const result = await parseTxt(buffer, "utf8.txt");

    expect(result.text).toBe(content);
  });
});
