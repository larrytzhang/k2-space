/**
 * Plain text file parser.
 * The simplest parser — decodes a Buffer as UTF-8 and wraps the
 * content in the RawParseResult structure.
 */

import type { RawParseResult } from "../types";

/**
 * Parses a plain text file buffer into a RawParseResult.
 * Decodes the buffer as UTF-8, treats the entire content as a single page.
 *
 * @param buffer - The raw file content.
 * @param filename - The original filename (used in metadata).
 * @returns A RawParseResult with a single page and pageCount of 1.
 */
export async function parseTxt(
  buffer: Buffer,
  filename: string
): Promise<RawParseResult> {
  const text = buffer.toString("utf-8");

  return {
    text,
    pages: [{ pageNumber: 1, text }],
    metadata: {
      filename,
      mimeType: "text/plain",
      pageCount: 1,
    },
  };
}
