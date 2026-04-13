import { describe, it, expect, vi, beforeEach } from "vitest";
import { CorruptedFileError } from "../errors";

/**
 * Mock the pdf-parse module to avoid requiring actual PDF infrastructure
 * in unit tests. We mock the PDFParse class and its methods.
 */
const mockGetText = vi.fn();
const mockDestroy = vi.fn();

vi.mock("pdf-parse", () => {
  return {
    PDFParse: class MockPDFParse {
      constructor(_options: unknown) {
        // constructor is called with { data: Uint8Array }
      }
      getText = mockGetText;
      destroy = mockDestroy;
    },
  };
});

// Import after mock setup
import { parsePdf } from "../parsers/pdf-parser";

describe("parsePdf", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDestroy.mockResolvedValue(undefined);
  });

  it("extracts text and metadata from a PDF buffer", async () => {
    mockGetText.mockResolvedValue({
      text: "Page 1 content\nPage 2 content",
      total: 2,
      pages: [
        { num: 1, text: "Page 1 content" },
        { num: 2, text: "Page 2 content" },
      ],
    });

    const buffer = Buffer.from("fake-pdf-data");
    const result = await parsePdf(buffer, "test.pdf");

    expect(result.text).toBe("Page 1 content\nPage 2 content");
    expect(result.pages).toHaveLength(2);
    expect(result.pages[0]).toEqual({ pageNumber: 1, text: "Page 1 content" });
    expect(result.pages[1]).toEqual({ pageNumber: 2, text: "Page 2 content" });
    expect(result.metadata.filename).toBe("test.pdf");
    expect(result.metadata.mimeType).toBe("application/pdf");
    expect(result.metadata.pageCount).toBe(2);
  });

  it("wraps library errors in CorruptedFileError", async () => {
    mockGetText.mockRejectedValue(new Error("Invalid PDF structure"));

    const buffer = Buffer.from("not-a-pdf");

    await expect(parsePdf(buffer, "bad.pdf")).rejects.toThrow(
      CorruptedFileError
    );
    await expect(parsePdf(buffer, "bad.pdf")).rejects.toThrow(
      "File appears to be corrupted: Invalid PDF structure"
    );
  });

  it("calls destroy after successful parsing", async () => {
    mockGetText.mockResolvedValue({
      text: "content",
      total: 1,
      pages: [{ num: 1, text: "content" }],
    });

    await parsePdf(Buffer.from("data"), "test.pdf");

    expect(mockDestroy).toHaveBeenCalled();
  });

  it("calls destroy even when parsing fails", async () => {
    mockGetText.mockRejectedValue(new Error("parse error"));

    await expect(parsePdf(Buffer.from("data"), "test.pdf")).rejects.toThrow();
    expect(mockDestroy).toHaveBeenCalled();
  });

  it("handles single-page PDF", async () => {
    mockGetText.mockResolvedValue({
      text: "Single page",
      total: 1,
      pages: [{ num: 1, text: "Single page" }],
    });

    const result = await parsePdf(Buffer.from("data"), "single.pdf");

    expect(result.pages).toHaveLength(1);
    expect(result.metadata.pageCount).toBe(1);
  });
});
