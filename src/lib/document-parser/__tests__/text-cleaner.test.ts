import { describe, it, expect } from "vitest";
import { cleanText } from "../utils/text-cleaner";

describe("cleanText", () => {
  it("normalizes non-breaking spaces to regular spaces", () => {
    const input = "hello\u00A0world\u00A0test";
    const result = cleanText(input);
    expect(result).toBe("hello world test");
  });

  it("normalizes \\r\\n line endings to \\n", () => {
    const input = "line1\r\nline2\r\nline3";
    const result = cleanText(input);
    expect(result).toBe("line1\nline2\nline3");
  });

  it("normalizes bare \\r line endings to \\n", () => {
    const input = "line1\rline2\rline3";
    const result = cleanText(input);
    expect(result).toBe("line1\nline2\nline3");
  });

  it("collapses 3+ blank lines down to 2", () => {
    const input = "paragraph1\n\n\n\nparagraph2\n\n\n\n\nparagraph3";
    const result = cleanText(input);
    expect(result).toBe("paragraph1\n\nparagraph2\n\nparagraph3");
  });

  it("preserves double newlines (single blank line)", () => {
    const input = "paragraph1\n\nparagraph2";
    const result = cleanText(input);
    expect(result).toBe("paragraph1\n\nparagraph2");
  });

  it("trims trailing whitespace from each line", () => {
    const input = "line1   \nline2\t\nline3  \t  ";
    const result = cleanText(input);
    expect(result).toBe("line1\nline2\nline3");
  });

  it("trims leading and trailing whitespace from the document", () => {
    const input = "\n\n  hello world  \n\n";
    const result = cleanText(input);
    expect(result).toBe("hello world");
  });

  it("applies all stages in sequence", () => {
    const input =
      "  \r\n\u00A0Hello\u00A0World   \r\n\r\n\r\n\r\nSecond paragraph  \r\n  ";
    const result = cleanText(input);
    // Verified empirically: NBSP->space, \r\n->\n, collapse blank lines,
    // trimEnd each line, trim whole doc
    expect(result).toBe("Hello World\n\nSecond paragraph");
  });

  it("handles empty string", () => {
    expect(cleanText("")).toBe("");
  });

  it("handles string with only whitespace", () => {
    expect(cleanText("   \n\n\t  ")).toBe("");
  });
});
