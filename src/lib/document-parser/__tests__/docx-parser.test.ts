import { describe, it, expect, vi, beforeEach } from "vitest";
import { CorruptedFileError } from "../errors";

/**
 * Mock mammoth and cheerio to avoid needing real DOCX files in unit tests.
 */
const mockConvertToHtml = vi.fn();
const mockExtractRawText = vi.fn();

vi.mock("mammoth", () => ({
  default: {
    convertToHtml: (...args: unknown[]) => mockConvertToHtml(...args),
    extractRawText: (...args: unknown[]) => mockExtractRawText(...args),
  },
}));

// Import after mock setup
import { parseDocx } from "../parsers/docx-parser";

describe("parseDocx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("extracts text and metadata from a DOCX buffer", async () => {
    mockConvertToHtml.mockResolvedValue({
      value: "<p>Hello World</p>",
      messages: [],
    });
    mockExtractRawText.mockResolvedValue({
      value: "Hello World",
      messages: [],
    });

    const buffer = Buffer.from("fake-docx-data");
    const result = await parseDocx(buffer, "test.docx");

    expect(result.text).toBe("Hello World");
    expect(result.pages).toHaveLength(1);
    expect(result.pages[0].pageNumber).toBe(1);
    expect(result.pages[0].text).toBe("Hello World");
    expect(result.metadata.filename).toBe("test.docx");
    expect(result.metadata.mimeType).toBe(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    expect(result.metadata.pageCount).toBe(1);
  });

  it("extracts tables from HTML output", async () => {
    const htmlWithTable = `
      <p>Introduction</p>
      <table>
        <tr><th>Step</th><th>Action</th></tr>
        <tr><td>1</td><td>Inspect</td></tr>
        <tr><td>2</td><td>Verify</td></tr>
      </table>
    `;
    mockConvertToHtml.mockResolvedValue({
      value: htmlWithTable,
      messages: [],
    });
    mockExtractRawText.mockResolvedValue({
      value: "Introduction\nStep\tAction\n1\tInspect\n2\tVerify",
      messages: [],
    });

    const buffer = Buffer.from("fake-docx");
    const result = await parseDocx(buffer, "table.docx");

    expect(result.tables).toHaveLength(1);
    expect(result.tables[0].headers).toEqual(["Step", "Action"]);
    expect(result.tables[0].rows).toEqual([
      ["1", "Inspect"],
      ["2", "Verify"],
    ]);
  });

  it("handles DOCX with no tables", async () => {
    mockConvertToHtml.mockResolvedValue({
      value: "<p>Just text</p>",
      messages: [],
    });
    mockExtractRawText.mockResolvedValue({
      value: "Just text",
      messages: [],
    });

    const buffer = Buffer.from("fake-docx");
    const result = await parseDocx(buffer, "noTable.docx");

    expect(result.tables).toHaveLength(0);
  });

  it("wraps mammoth errors in CorruptedFileError", async () => {
    mockConvertToHtml.mockRejectedValue(
      new Error("Could not find OOXML content")
    );

    const buffer = Buffer.from("not-a-docx");

    await expect(parseDocx(buffer, "bad.docx")).rejects.toThrow(
      CorruptedFileError
    );
    await expect(parseDocx(buffer, "bad.docx")).rejects.toThrow(
      "File appears to be corrupted"
    );
  });

  it("extracts table headers from first row when no <th> elements", async () => {
    const htmlWithTdHeaders = `
      <table>
        <tr><td>Name</td><td>Value</td></tr>
        <tr><td>Temp</td><td>72F</td></tr>
      </table>
    `;
    mockConvertToHtml.mockResolvedValue({
      value: htmlWithTdHeaders,
      messages: [],
    });
    mockExtractRawText.mockResolvedValue({
      value: "Name\tValue\nTemp\t72F",
      messages: [],
    });

    const buffer = Buffer.from("fake-docx");
    const result = await parseDocx(buffer, "tdHeaders.docx");

    expect(result.tables).toHaveLength(1);
    expect(result.tables[0].headers).toEqual(["Name", "Value"]);
    expect(result.tables[0].rows).toEqual([["Temp", "72F"]]);
  });
});
