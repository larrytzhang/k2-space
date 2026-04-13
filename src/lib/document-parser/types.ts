/**
 * Internal types for the document parsing engine.
 * These types are used within the parser pipeline and are not
 * part of the public API surface (use pipeline.ts types externally).
 */

import type { DocumentMetadata } from "@/lib/types/pipeline";

/**
 * Raw input to the document parser.
 * Represents a file uploaded by the user before any processing.
 */
export interface DocumentInput {
  /** The raw file content as a Node.js Buffer. */
  buffer: Buffer;
  /** Original filename including extension, e.g. "procedure.pdf". */
  filename: string;
  /** MIME type of the file, e.g. "application/pdf". */
  mimeType: string;
}

/**
 * Content extracted from a single page of a document.
 */
export interface PageContent {
  /** 1-based page number. */
  pageNumber: number;
  /** Plain text content of this page. */
  text: string;
}

/**
 * The raw output of a format-specific parser (PDF, DOCX, TXT).
 * This intermediate result is further processed by the main
 * parseDocument function (section detection, cleaning, etc.).
 */
export interface RawParseResult {
  /** Full concatenated plain text of the document. */
  text: string;
  /** Per-page text content. */
  pages: PageContent[];
  /** Partial metadata gathered by the format parser. */
  metadata: Partial<DocumentMetadata>;
}
