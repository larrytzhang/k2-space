/**
 * Application-level error class used across all backend modules.
 * Carries an error code, HTTP status, and human-readable message
 * so that API route handlers can translate errors into responses
 * without inspecting error types.
 */

/** Well-known error codes used throughout the application. */
export type AppErrorCode =
  | "EMPTY_FILE"
  | "FILE_TOO_LARGE"
  | "UNSUPPORTED_FILE_TYPE"
  | "VALIDATION_ERROR"
  | "JOB_NOT_FOUND"
  | "JOB_NOT_COMPLETE"
  | "PIPELINE_ERROR"
  | "INTERNAL_ERROR";

/**
 * Structured application error.
 *
 * Every thrown error in the backend should be an AppError so that
 * API route handlers can extract `httpStatus` and `code` without
 * guessing.
 *
 * @example
 * ```ts
 * throw new AppError("EMPTY_FILE", 400, "Uploaded file is empty");
 * ```
 */
export class AppError extends Error {
  /** Machine-readable error code for programmatic handling. */
  public readonly code: AppErrorCode;

  /** HTTP status code to return in the API response. */
  public readonly httpStatus: number;

  /**
   * Create a new AppError.
   *
   * @param code - Machine-readable error code.
   * @param httpStatus - HTTP status code to surface in API responses.
   * @param message - Human-readable error description.
   */
  constructor(code: AppErrorCode, httpStatus: number, message: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.httpStatus = httpStatus;
  }
}
