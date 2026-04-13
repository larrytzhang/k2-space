/**
 * Document Parsing Engine — public API.
 *
 * This is the ONLY public export of the document-parser module.
 * All other files are internal implementation details.
 *
 * Usage:
 *   import { parseDocument } from "@/lib/document-parser";
 *   const parsed = await parseDocument({ buffer, filename, mimeType });
 */

import type {
  ParsedDocument,
  ParsedSection,
  DocumentMetadata,
} from "@/lib/types/pipeline";
import type { DocumentInput, RawParseResult } from "./types";
import { MAX_FILE_SIZE_BYTES, SUPPORTED_MIME_TYPES } from "./constants";
import {
  UnsupportedFileTypeError,
  FileTooLargeError,
  EmptyDocumentError,
} from "./errors";
import { cleanText } from "./utils/text-cleaner";
import { detectSections } from "./utils/section-detector";
import { parseTxt } from "./parsers/txt-parser";
import { parsePdf } from "./parsers/pdf-parser";
import { parseDocx } from "./parsers/docx-parser";

// Re-export error classes and types for external consumers
export {
  DocumentParseError,
  UnsupportedFileTypeError,
  FileTooLargeError,
  EmptyDocumentError,
  CorruptedFileError,
} from "./errors";
export type { DocumentInput, RawParseResult, PageContent } from "./types";

/**
 * Parses a document buffer into a structured ParsedDocument.
 *
 * Pipeline:
 *   1. Validate input (file type, size)
 *   2. Dispatch to format-specific parser (TXT, PDF, DOCX)
 *   3. Clean extracted text
 *   4. Detect sections and headings
 *   5. Infer document title
 *   6. Assemble and return ParsedDocument
 *
 * @param input - The document input containing buffer, filename, and mimeType.
 * @returns A fully parsed document with metadata, sections, and raw text.
 * @throws {UnsupportedFileTypeError} If the MIME type is not supported.
 * @throws {FileTooLargeError} If the file exceeds MAX_FILE_SIZE_BYTES.
 * @throws {EmptyDocumentError} If no text could be extracted.
 * @throws {CorruptedFileError} If the file cannot be parsed by its format parser.
 */
export async function parseDocument(
  input: DocumentInput
): Promise<ParsedDocument> {
  // Step 1: Validate input
  validateInput(input);

  // Step 2: Dispatch to format-specific parser
  const rawResult = await dispatchParser(input);

  // Step 3: Clean extracted text
  const cleanedText = cleanText(rawResult.text);

  // Check for empty document after cleaning
  if (!cleanedText) {
    throw new EmptyDocumentError();
  }

  // Step 4: Detect sections
  let sections: ParsedSection[] = detectSections(cleanedText);

  // If the parser returned tables (DOCX), distribute them to sections
  if ("tables" in rawResult && Array.isArray((rawResult as Record<string, unknown>).tables)) {
    const tables = (rawResult as { tables: ParsedSection["tables"] }).tables;
    if (tables.length > 0 && sections.length > 0) {
      // Attach all tables to the first section (simple heuristic)
      // A more sophisticated approach would match tables to sections by position
      sections[0] = { ...sections[0], tables };
    }
  }

  // Step 5: Infer document title
  const title = inferTitle(sections, input.filename);

  // Step 6: Assemble metadata
  const metadata: DocumentMetadata = {
    filename: input.filename,
    mimeType: input.mimeType,
    pageCount: rawResult.metadata.pageCount ?? 1,
    byteSize: input.buffer.length,
  };

  return {
    metadata,
    title,
    sections,
    rawText: cleanedText,
  };
}

/**
 * Validates the document input for supported type and size constraints.
 *
 * @param input - The document input to validate.
 * @throws {UnsupportedFileTypeError} If the MIME type is not supported.
 * @throws {FileTooLargeError} If the file exceeds the size limit.
 */
function validateInput(input: DocumentInput): void {
  if (!SUPPORTED_MIME_TYPES.has(input.mimeType)) {
    throw new UnsupportedFileTypeError(input.mimeType);
  }

  if (input.buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new FileTooLargeError(input.buffer.length, MAX_FILE_SIZE_BYTES);
  }
}

/**
 * Dispatches to the appropriate format-specific parser based on MIME type.
 *
 * @param input - The document input.
 * @returns The raw parse result from the format parser.
 * @throws {UnsupportedFileTypeError} If no parser matches the MIME type.
 */
async function dispatchParser(input: DocumentInput): Promise<RawParseResult> {
  switch (input.mimeType) {
    case "text/plain":
      return parseTxt(input.buffer, input.filename);
    case "application/pdf":
      return parsePdf(input.buffer, input.filename);
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return parseDocx(input.buffer, input.filename);
    default:
      throw new UnsupportedFileTypeError(input.mimeType);
  }
}

/**
 * Infers the document title from section headings or the filename.
 * Uses the first heading found, or falls back to the filename
 * with the extension removed.
 *
 * @param sections - The detected sections.
 * @param filename - The original filename as fallback.
 * @returns The inferred title, or null if none can be determined.
 */
function inferTitle(
  sections: ParsedSection[],
  filename: string
): string | null {
  // Look for the first section with a heading
  for (const section of sections) {
    if (section.heading) {
      return section.heading;
    }
  }

  // Fall back to filename without extension
  const dotIndex = filename.lastIndexOf(".");
  if (dotIndex > 0) {
    return filename.substring(0, dotIndex);
  }

  return filename || null;
}
