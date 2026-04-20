/**
 * Unit tests for the friendlyError translator. Verifies that raw error
 * strings from the upload, pipeline, and SSE layers are rewritten into
 * user-friendly guidance, and that unknown errors fall through unchanged.
 */

import { describe, it, expect } from "vitest";
import { friendlyError } from "@/lib/error-messages";

describe("friendlyError", () => {
  it("translates empty-file errors", () => {
    expect(friendlyError("Uploaded file is empty")).toMatch(/empty/i);
  });

  it("translates file-too-large errors", () => {
    expect(friendlyError("FILE_TOO_LARGE")).toMatch(/10 MB/);
  });

  it("translates unsupported-type errors", () => {
    expect(friendlyError("UNSUPPORTED_FILE_TYPE")).toMatch(/PDF, DOCX, or TXT/);
  });

  it("translates scanned-PDF errors", () => {
    expect(
      friendlyError("Document has no text content")
    ).toMatch(/scanned/i);
  });

  it("translates timeouts", () => {
    expect(
      friendlyError("Processing timed out after 120 seconds.")
    ).toMatch(/longer than expected|sample/i);
  });

  it("translates auth errors", () => {
    expect(
      friendlyError("Authentication failed: invalid or missing API key")
    ).toMatch(/server-side/i);
  });

  it("translates rate limits", () => {
    expect(friendlyError("429 Too Many Requests")).toMatch(/minute|sample/i);
  });

  it("translates connection errors", () => {
    expect(friendlyError("Lost connection to the server.")).toMatch(
      /network/i
    );
  });

  it("translates schema validation failures", () => {
    expect(
      friendlyError("AI response failed schema validation: ...")
    ).toMatch(/unexpected shape|retry|sample/i);
  });

  it("returns a default message for empty input", () => {
    expect(friendlyError("")).toMatch(/went wrong/i);
  });

  it("falls through for unknown errors", () => {
    const raw = "Totally novel error that nobody has ever seen before xyz";
    expect(friendlyError(raw)).toBe(raw);
  });
});
