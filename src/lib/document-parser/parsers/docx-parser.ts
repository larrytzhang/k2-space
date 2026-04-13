/**
 * DOCX file parser.
 * Uses mammoth to extract text and HTML from Word documents,
 * then uses cheerio to parse tables from the HTML output.
 */

import mammoth from "mammoth";
import { load } from "cheerio";
import type { RawParseResult } from "../types";
import type { ParsedTable } from "@/lib/types/pipeline";
import { CorruptedFileError } from "../errors";
import { extractTablesFromHtml } from "../utils/table-extractor";

/**
 * Parses a DOCX buffer into a RawParseResult.
 * Uses mammoth.convertToHtml() to get HTML (for table extraction)
 * and mammoth.extractRawText() for plain text.
 * Tables extracted from the HTML are attached to the result metadata.
 *
 * @param buffer - The raw DOCX file content.
 * @param filename - The original filename (used in metadata).
 * @returns A RawParseResult with text, single page, and extracted tables.
 * @throws {CorruptedFileError} If mammoth cannot process the buffer.
 */
export async function parseDocx(
  buffer: Buffer,
  filename: string
): Promise<RawParseResult & { tables: ParsedTable[] }> {
  try {
    // Extract HTML for table parsing
    const htmlResult = await mammoth.convertToHtml({ buffer });
    const $ = load(htmlResult.value);
    const tables = extractTablesFromHtml($);

    // Extract plain text
    const textResult = await mammoth.extractRawText({ buffer });
    const text = textResult.value;

    return {
      text,
      pages: [{ pageNumber: 1, text }],
      metadata: {
        filename,
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        pageCount: 1,
      },
      tables,
    };
  } catch (error) {
    if (error instanceof CorruptedFileError) {
      throw error;
    }
    throw new CorruptedFileError(error);
  }
}
