import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateUploadedFile } from "../validation";
import { AppError } from "../errors";

/**
 * Mock getConfig so tests can control maxFileSizeBytes without
 * relying on environment variables.
 */
vi.mock("../config", () => ({
  getConfig: () => ({
    maxFileSizeBytes: 1024, // 1 KB for easy testing
    anthropicApiKey: "test-key",
  }),
}));

/**
 * Helper to create a mock File object with the given properties.
 *
 * @param name - The filename.
 * @param size - File size in bytes.
 * @param type - MIME type.
 * @returns A File instance.
 */
function createFile(name: string, size: number, type: string): File {
  const content = new Uint8Array(size);
  return new File([content], name, { type });
}

describe("validateUploadedFile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("accepts a valid PDF file within size limits", () => {
    const file = createFile("test.pdf", 512, "application/pdf");
    expect(() => validateUploadedFile(file)).not.toThrow();
  });

  it("accepts a valid DOCX file", () => {
    const file = createFile(
      "test.docx",
      100,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    expect(() => validateUploadedFile(file)).not.toThrow();
  });

  it("accepts a valid TXT file", () => {
    const file = createFile("test.txt", 50, "text/plain");
    expect(() => validateUploadedFile(file)).not.toThrow();
  });

  it("throws EMPTY_FILE for a zero-byte file", () => {
    const file = createFile("empty.pdf", 0, "application/pdf");

    expect(() => validateUploadedFile(file)).toThrow(AppError);

    try {
      validateUploadedFile(file);
    } catch (err) {
      const appErr = err as AppError;
      expect(appErr.code).toBe("EMPTY_FILE");
      expect(appErr.httpStatus).toBe(400);
      expect(appErr.message).toBe("Uploaded file is empty");
    }
  });

  it("throws FILE_TOO_LARGE when file exceeds max size", () => {
    // Config mock sets max to 1024 bytes
    const file = createFile("big.pdf", 2048, "application/pdf");

    expect(() => validateUploadedFile(file)).toThrow(AppError);

    try {
      validateUploadedFile(file);
    } catch (err) {
      const appErr = err as AppError;
      expect(appErr.code).toBe("FILE_TOO_LARGE");
      expect(appErr.httpStatus).toBe(413);
    }
  });

  it("throws UNSUPPORTED_FILE_TYPE for an unknown MIME type", () => {
    const file = createFile("image.png", 100, "image/png");

    expect(() => validateUploadedFile(file)).toThrow(AppError);

    try {
      validateUploadedFile(file);
    } catch (err) {
      const appErr = err as AppError;
      expect(appErr.code).toBe("UNSUPPORTED_FILE_TYPE");
      expect(appErr.httpStatus).toBe(415);
      expect(appErr.message).toContain("image/png");
    }
  });

  it("checks emptiness before size", () => {
    // A zero-byte file with unsupported type should fail on EMPTY_FILE first
    const file = createFile("empty.png", 0, "image/png");

    try {
      validateUploadedFile(file);
    } catch (err) {
      const appErr = err as AppError;
      expect(appErr.code).toBe("EMPTY_FILE");
    }
  });

  it("checks size before MIME type", () => {
    // An oversized file with unsupported type should fail on FILE_TOO_LARGE
    const file = createFile("big.png", 2048, "image/png");

    try {
      validateUploadedFile(file);
    } catch (err) {
      const appErr = err as AppError;
      expect(appErr.code).toBe("FILE_TOO_LARGE");
    }
  });

  it("accepts a file exactly at the size limit", () => {
    const file = createFile("exact.pdf", 1024, "application/pdf");
    expect(() => validateUploadedFile(file)).not.toThrow();
  });
});
