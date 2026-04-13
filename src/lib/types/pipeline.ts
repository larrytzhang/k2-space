/**
 * Types for the document processing pipeline.
 * Defines the data flowing between parser, AI engine, and backend.
 */

import type { StructuredProcedure } from "./procedure";

/** A table extracted from a document (headers + data rows). */
export interface ParsedTable {
  headers: string[];
  rows: string[][];
}

/** A section detected within a parsed document. */
export interface ParsedSection {
  /** Section heading text, or null for untitled preamble. */
  heading: string | null;
  /** Heading depth: 1 = top-level, 2 = subsection, etc. */
  level: number;
  /** Raw text content of the section. */
  content: string;
  /** Tables found within this section. */
  tables: ParsedTable[];
  /** List items extracted from this section. */
  listItems: string[];
}

/** Metadata about the source document. */
export interface DocumentMetadata {
  filename: string;
  mimeType: string;
  pageCount: number;
  byteSize: number;
}

/**
 * The output of the document parser (Module 1).
 * Input to the AI structuring engine (Module 2).
 */
export interface ParsedDocument {
  metadata: DocumentMetadata;
  /** Inferred document title, or null if not detected. */
  title: string | null;
  /** Sections detected in the document. */
  sections: ParsedSection[];
  /** Full raw text as a single string (fallback for AI). */
  rawText: string;
}

/**
 * The result of AI structuring (Module 2).
 * Either succeeds with a procedure, or fails with an error message.
 */
export type StructuringResult =
  | { success: true; procedure: StructuredProcedure }
  | { success: false; error: string };
