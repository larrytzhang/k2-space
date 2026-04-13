/**
 * File upload validation utilities.
 */

import {
  ACCEPTED_MIME_TYPES,
  ACCEPTED_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_LABEL,
} from "@/lib/constants";

/**
 * Validates a file against accepted MIME types, extensions, and size limit.
 * @param file - The file to validate.
 * @returns An object with `valid` boolean and optional `error` message.
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const extension = file.name
    .slice(file.name.lastIndexOf("."))
    .toLowerCase();

  const mimeValid = ACCEPTED_MIME_TYPES.includes(file.type);
  const extValid = ACCEPTED_EXTENSIONS.includes(extension);

  if (!mimeValid && !extValid) {
    return {
      valid: false,
      error: `Unsupported file type. Please upload a PDF, Word (.docx), or plain text file.`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File is too large. Maximum size is ${MAX_FILE_SIZE_LABEL}.`,
    };
  }

  return { valid: true };
}

/**
 * Formats a byte count into a human-readable size string.
 * @param bytes - Number of bytes.
 * @returns Formatted string like "1.2 MB" or "340 KB".
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
