/**
 * PDF file parser.
 * Uses pdf-parse v2 (PDFParse class) to extract text and page count
 * from PDF buffers.
 */

import { PDFParse } from "pdf-parse";
import type { RawParseResult, PageContent } from "../types";
import { CorruptedFileError } from "../errors";

/**
 * Parses a PDF buffer into a RawParseResult.
 * Extracts per-page text content and total page count.
 * Wraps any pdf-parse errors in a CorruptedFileError.
 *
 * @param buffer - The raw PDF file content.
 * @param filename - The original filename (used in metadata).
 * @returns A RawParseResult with per-page text and page count.
 * @throws {CorruptedFileError} If pdf-parse cannot process the buffer.
 */
export async function parsePdf(
  buffer: Buffer,
  filename: string
): Promise<RawParseResult> {
  let parser: PDFParse | null = null;
  try {
    parser = new PDFParse({ data: new Uint8Array(buffer) });
    const textResult = await parser.getText();

    const pages: PageContent[] = textResult.pages.map((page) => ({
      pageNumber: page.num,
      text: page.text,
    }));

    return {
      text: textResult.text,
      pages,
      metadata: {
        filename,
        mimeType: "application/pdf",
        pageCount: textResult.total,
      },
    };
  } catch (error) {
    if (error instanceof CorruptedFileError) {
      throw error;
    }
    throw new CorruptedFileError(error);
  } finally {
    if (parser) {
      await parser.destroy().catch(() => {
        // Ignore destroy errors — the document may not have loaded
      });
    }
  }
}
