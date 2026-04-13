/**
 * Types for the background job pipeline.
 *
 * These types track the lifecycle of an uploaded document as it
 * moves through parsing and AI structuring, and are consumed by
 * the SSE streaming endpoint and the export endpoint.
 */

import type { StructuredProcedure } from "@/lib/types/procedure";

/**
 * Possible states of a pipeline job.
 *
 * Lifecycle: pending -> parsing -> structuring -> completed
 *                                             \-> failed
 */
export type JobStatus =
  | "pending"
  | "parsing"
  | "structuring"
  | "completed"
  | "failed";

/**
 * Progress snapshot emitted via SSE to keep the client informed.
 * Each progress event carries the current status and an optional
 * human-readable message describing what the pipeline is doing.
 */
export interface JobProgress {
  /** Current pipeline stage. */
  status: JobStatus;

  /** Optional human-readable description of current activity. */
  message?: string;
}

/**
 * A pipeline job representing one uploaded document being processed.
 *
 * Created by the upload endpoint, mutated by the orchestrator,
 * read by the SSE stream and export endpoints.
 */
export interface Job {
  /** Unique identifier for this job (UUID v4). */
  id: string;

  /** Original filename of the uploaded document. */
  filename: string;

  /** Current status of the pipeline. */
  status: JobStatus;

  /** Timestamp when the job was created (ISO 8601). */
  createdAt: string;

  /** Timestamp when the job last changed status (ISO 8601). */
  updatedAt: string;

  /** The structured procedure produced on success, or null. */
  result: StructuredProcedure | null;

  /** Error message if the job failed, or null. */
  error: string | null;
}
