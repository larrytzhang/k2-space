/**
 * Upload validation logic for incoming files.
 *
 * Validates that uploaded files are non-empty, within size limits,
 * and of a supported MIME type before they enter the pipeline.
 */

import { AppError } from "@/lib/errors";
import { getConfig } from "@/lib/config";

/** MIME types accepted by the upload endpoint. */
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

/**
 * Validate an uploaded file before it enters the processing pipeline.
 *
 * Checks are run in the following order:
 *   1. File must not be empty (zero bytes).
 *   2. File must not exceed the configured maximum size.
 *   3. File MIME type must be in the allow-list.
 *
 * @param file - The File object received from FormData.
 * @throws {AppError} With code EMPTY_FILE if the file has no content.
 * @throws {AppError} With code FILE_TOO_LARGE if the file exceeds the limit.
 * @throws {AppError} With code UNSUPPORTED_FILE_TYPE if the MIME type is not allowed.
 */
export function validateUploadedFile(file: File): void {
  if (file.size === 0) {
    throw new AppError("EMPTY_FILE", 400, "Uploaded file is empty");
  }

  const { maxFileSizeBytes } = getConfig();
  if (file.size > maxFileSizeBytes) {
    throw new AppError(
      "FILE_TOO_LARGE",
      413,
      `File size ${file.size} bytes exceeds maximum of ${maxFileSizeBytes} bytes`
    );
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new AppError(
      "UNSUPPORTED_FILE_TYPE",
      415,
      `Unsupported file type: ${file.type}`
    );
  }
}
