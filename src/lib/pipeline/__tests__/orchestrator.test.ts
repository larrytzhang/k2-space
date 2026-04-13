import { describe, it, expect, vi, beforeEach } from "vitest";
import { runPipeline } from "../orchestrator";
import { JobStore } from "../job-store";
import type { Job } from "../types";
import type { ParsedDocument, StructuringResult } from "@/lib/types/pipeline";
import type { StructuredProcedure } from "@/lib/types/procedure";

/**
 * Mock the document parser module.
 */
vi.mock("@/lib/document-parser", () => ({
  parseDocument: vi.fn(),
}));

/**
 * Mock the AI client module.
 */
vi.mock("@/lib/ai/client", () => ({
  structureDocument: vi.fn(),
}));

/**
 * Mock the job store module to use a fresh store per test.
 */
let mockStore: JobStore;

vi.mock("../job-store", () => ({
  JobStore: vi.fn(),
  getJobStore: () => mockStore,
}));

// Import mocked modules so we can control their return values.
import { parseDocument } from "@/lib/document-parser";
import { structureDocument } from "@/lib/ai/client";

const mockParseDocument = vi.mocked(parseDocument);
const mockStructureDocument = vi.mocked(structureDocument);

/**
 * Helper to create a seed job in the store.
 *
 * @param store - The job store to seed.
 * @param id - The job ID.
 * @returns The created job.
 */
function seedJob(store: JobStore, id: string): Job {
  const job: Job = {
    id,
    filename: "test.pdf",
    status: "pending",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    result: null,
    error: null,
  };
  store.set(job);
  return job;
}

/**
 * Minimal parsed document fixture for testing.
 */
const MOCK_PARSED_DOC: ParsedDocument = {
  metadata: {
    filename: "test.pdf",
    mimeType: "application/pdf",
    pageCount: 1,
    byteSize: 100,
  },
  title: "Test Procedure",
  sections: [],
  rawText: "Some procedure text",
};

/**
 * Minimal structured procedure fixture for testing.
 */
const MOCK_PROCEDURE: StructuredProcedure = {
  id: "proc-1",
  title: "Test Procedure",
  documentNumber: null,
  revision: null,
  effectiveDate: null,
  purpose: null,
  scope: null,
  roles: [],
  equipment: [],
  sections: [],
  metadata: {
    domain: null,
    totalSteps: 0,
    totalWarnings: 0,
    estimatedDuration: null,
  },
};

describe("runPipeline", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const actual = await vi.importActual<{ JobStore: typeof JobStore }>("../job-store");
    mockStore = new actual.JobStore();
  });

  it("completes successfully through all stages", async () => {
    seedJob(mockStore, "job-1");

    mockParseDocument.mockResolvedValue(MOCK_PARSED_DOC);
    mockStructureDocument.mockResolvedValue({
      success: true,
      procedure: MOCK_PROCEDURE,
    } satisfies StructuringResult);

    const events: string[] = [];
    mockStore.subscribe("job-1", (p) => events.push(p.status));

    await runPipeline(
      "job-1",
      Buffer.from("content"),
      "test.pdf",
      "application/pdf"
    );

    const job = mockStore.get("job-1");
    expect(job?.status).toBe("completed");
    expect(job?.result).toEqual(MOCK_PROCEDURE);
    expect(job?.error).toBeNull();

    // Should have progressed through parsing -> structuring -> completed
    expect(events).toContain("parsing");
    expect(events).toContain("structuring");
    expect(events).toContain("completed");
  });

  it("records failure when parseDocument throws", async () => {
    seedJob(mockStore, "job-2");

    mockParseDocument.mockRejectedValue(new Error("Parse failed"));

    await runPipeline(
      "job-2",
      Buffer.from("bad content"),
      "test.pdf",
      "application/pdf"
    );

    const job = mockStore.get("job-2");
    expect(job?.status).toBe("failed");
    expect(job?.error).toBe("Parse failed");
    expect(job?.result).toBeNull();
  });

  it("records failure when structureDocument returns success=false", async () => {
    seedJob(mockStore, "job-3");

    mockParseDocument.mockResolvedValue(MOCK_PARSED_DOC);
    mockStructureDocument.mockResolvedValue({
      success: false,
      error: "AI could not parse",
    } satisfies StructuringResult);

    await runPipeline(
      "job-3",
      Buffer.from("content"),
      "test.pdf",
      "application/pdf"
    );

    const job = mockStore.get("job-3");
    expect(job?.status).toBe("failed");
    expect(job?.error).toBe("AI could not parse");
  });

  it("records failure when structureDocument throws", async () => {
    seedJob(mockStore, "job-4");

    mockParseDocument.mockResolvedValue(MOCK_PARSED_DOC);
    mockStructureDocument.mockRejectedValue(new Error("Network timeout"));

    await runPipeline(
      "job-4",
      Buffer.from("content"),
      "test.pdf",
      "application/pdf"
    );

    const job = mockStore.get("job-4");
    expect(job?.status).toBe("failed");
    expect(job?.error).toBe("Network timeout");
  });

  it("never throws even on unexpected errors", async () => {
    seedJob(mockStore, "job-5");

    mockParseDocument.mockRejectedValue("string error");

    // Should not throw
    await expect(
      runPipeline(
        "job-5",
        Buffer.from("content"),
        "test.pdf",
        "application/pdf"
      )
    ).resolves.toBeUndefined();

    const job = mockStore.get("job-5");
    expect(job?.status).toBe("failed");
    expect(job?.error).toBe("Unknown pipeline error");
  });

  it("calls parseDocument with the correct arguments", async () => {
    seedJob(mockStore, "job-6");

    mockParseDocument.mockResolvedValue(MOCK_PARSED_DOC);
    mockStructureDocument.mockResolvedValue({
      success: true,
      procedure: MOCK_PROCEDURE,
    });

    const buffer = Buffer.from("test content");
    await runPipeline("job-6", buffer, "doc.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

    expect(mockParseDocument).toHaveBeenCalledWith({
      buffer,
      filename: "doc.docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
  });

  it("calls structureDocument with the parsed document", async () => {
    seedJob(mockStore, "job-7");

    mockParseDocument.mockResolvedValue(MOCK_PARSED_DOC);
    mockStructureDocument.mockResolvedValue({
      success: true,
      procedure: MOCK_PROCEDURE,
    });

    await runPipeline(
      "job-7",
      Buffer.from("content"),
      "test.pdf",
      "application/pdf"
    );

    expect(mockStructureDocument).toHaveBeenCalledWith(MOCK_PARSED_DOC);
  });
});
