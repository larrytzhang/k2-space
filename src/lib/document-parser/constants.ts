/**
 * Constants for the document parsing engine.
 * Centralises limits, supported formats, and heading detection patterns.
 */

/** Maximum allowed file size in bytes (10 MB). */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * Map of supported MIME types to their canonical file extensions.
 * Used for input validation and format-specific parser dispatch.
 */
export const SUPPORTED_MIME_TYPES: ReadonlyMap<string, string> = new Map([
  ["application/pdf", ".pdf"],
  [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".docx",
  ],
  ["text/plain", ".txt"],
]);

/** File extensions accepted by the parser. */
export const SUPPORTED_EXTENSIONS: readonly string[] = [".pdf", ".docx", ".txt"];

/**
 * Regex patterns for detecting section headings in plain text.
 * Ordered from most specific (numbered) to least specific (ALL CAPS).
 * Each entry maps a pattern to a heading depth level.
 */
export const HEADING_PATTERNS: readonly { pattern: RegExp; level: number }[] = [
  // Numbered headings like "1.2.3 Some Title"
  { pattern: /^(\d+\.\d+\.\d+)\s+(.+)$/, level: 3 },
  // Numbered headings like "1.2 Some Title"
  { pattern: /^(\d+\.\d+)\s+(.+)$/, level: 2 },
  // Numbered headings like "1. Some Title" or "1 Some Title"
  { pattern: /^(\d+)\.?\s+([A-Z].+)$/, level: 1 },
  // ALL CAPS lines (at least 3 chars, no lowercase)
  { pattern: /^([A-Z][A-Z\s\d]{2,})$/, level: 1 },
  // Lines ending with a colon, e.g. "Safety Requirements:"
  { pattern: /^([A-Za-z][\w\s]{2,}):$/, level: 2 },
];
