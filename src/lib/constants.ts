/**
 * Shared constants for file upload validation and display.
 */

/** MIME types accepted for procedure document uploads. */
export const ACCEPTED_MIME_TYPES: string[] = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

/** File extensions accepted for procedure document uploads. */
export const ACCEPTED_EXTENSIONS: string[] = [".pdf", ".docx", ".txt"];

/** Maximum allowed file size in bytes (10 MB). */
export const MAX_FILE_SIZE_BYTES: number = 10 * 1024 * 1024;

/** Human-readable label for the maximum file size. */
export const MAX_FILE_SIZE_LABEL: string = "10MB";
