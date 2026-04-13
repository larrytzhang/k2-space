/**
 * Error classes for the document parsing engine.
 * All errors extend DocumentParseError so callers can catch
 * the base class for any parser-related failure.
 */

/**
 * Base error class for all document parsing failures.
 * Callers can catch this to handle any parser error generically.
 */
export class DocumentParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DocumentParseError";
  }
}

/**
 * Thrown when the input file's MIME type or extension is not supported.
 * @param mimeType - The unsupported MIME type that was provided.
 */
export class UnsupportedFileTypeError extends DocumentParseError {
  constructor(mimeType: string) {
    super(`Unsupported file type: ${mimeType}`);
    this.name = "UnsupportedFileTypeError";
  }
}

/**
 * Thrown when the input file exceeds the maximum allowed size.
 * @param size - The actual file size in bytes.
 * @param maxSize - The maximum allowed size in bytes.
 */
export class FileTooLargeError extends DocumentParseError {
  constructor(size: number, maxSize: number) {
    super(
      `File size ${size} bytes exceeds maximum of ${maxSize} bytes`
    );
    this.name = "FileTooLargeError";
  }
}

/**
 * Thrown when the parsed document contains no extractable text.
 */
export class EmptyDocumentError extends DocumentParseError {
  constructor() {
    super("Document contains no extractable text");
    this.name = "EmptyDocumentError";
  }
}

/**
 * Thrown when a format-specific parser encounters an unrecoverable
 * error, typically indicating the file is corrupted or malformed.
 * @param originalError - The underlying error from the parsing library.
 */
export class CorruptedFileError extends DocumentParseError {
  public readonly originalError: unknown;

  constructor(originalError: unknown) {
    const message =
      originalError instanceof Error
        ? originalError.message
        : String(originalError);
    super(`File appears to be corrupted: ${message}`);
    this.name = "CorruptedFileError";
    this.originalError = originalError;
  }
}
