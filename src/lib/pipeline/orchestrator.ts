/**
 * Pipeline orchestrator.
 *
 * Drives a document through the two-stage pipeline:
 *   1. Parse the raw file into a structured ParsedDocument.
 *   2. Send the parsed document to the AI engine for structuring.
 *
 * Updates the job store and notifies SSE listeners at each stage.
 * This function NEVER throws — all errors are caught and recorded
 * on the job as a failure.
 */

import { parseDocument } from "@/lib/document-parser";
import { structureDocument } from "@/lib/ai/client";
import { getJobStore } from "./job-store";
import type { Job } from "./types";

/**
 * Run the full document processing pipeline for a given job.
 *
 * Stages:
 *   1. **Parsing** — the raw buffer is parsed into sections, text, and metadata.
 *   2. **Structuring** — the parsed document is sent to the AI engine which
 *      returns a StructuredProcedure or an error message.
 *
 * On success the job status becomes `"completed"` and `job.result` is set.
 * On failure the job status becomes `"failed"` and `job.error` is set.
 *
 * This function never throws. All errors are caught internally and
 * recorded on the job so that SSE listeners receive a terminal event.
 *
 * @param jobId - The ID of the job to process.
 * @param buffer - The raw file content as a Buffer.
 * @param filename - The original filename including extension.
 * @param mimeType - The MIME type of the uploaded file.
 */
export async function runPipeline(
  jobId: string,
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<void> {
  const store = getJobStore();

  /**
   * Helper to update job fields, persist, and notify listeners.
   */
  function updateJob(patch: Partial<Job>): void {
    const current = store.get(jobId);
    if (!current) return;

    const updated: Job = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    store.set(updated);
    store.notify(jobId, {
      status: updated.status,
      message: updated.error ?? undefined,
    });
  }

  try {
    // Stage 1: Parsing
    updateJob({ status: "parsing" });

    const parsed = await parseDocument({ buffer, filename, mimeType });

    // Stage 2: AI Structuring
    updateJob({ status: "structuring" });

    const result = await structureDocument(parsed);

    if (result.success) {
      updateJob({ status: "completed", result: result.procedure });
    } else {
      updateJob({ status: "failed", error: result.error });
    }
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown pipeline error";
    updateJob({ status: "failed", error: message });
  }
}
