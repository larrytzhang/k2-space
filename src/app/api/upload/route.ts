/**
 * POST /api/upload
 *
 * Accepts a multipart/form-data upload containing a single file,
 * validates it, creates a pipeline job, and fires off the
 * background processing pipeline. Returns the job ID immediately
 * so the client can subscribe to SSE progress updates.
 */

import { NextResponse } from "next/server";
import { validateUploadedFile } from "@/lib/validation";
import { AppError } from "@/lib/errors";
import { getJobStore } from "@/lib/pipeline/job-store";
import { runPipeline } from "@/lib/pipeline/orchestrator";
import type { Job } from "@/lib/pipeline/types";

/**
 * Handle file upload via POST.
 *
 * Expects a `multipart/form-data` body with a field named `file`.
 * On success, returns `{ jobId }` with HTTP 202 Accepted.
 *
 * @param request - The incoming HTTP request.
 * @returns A JSON response containing the job ID, or an error.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing required field: file" },
        { status: 400 }
      );
    }

    // Validate file constraints (empty, size, MIME type)
    validateUploadedFile(file);

    // Create the job record
    const jobId = crypto.randomUUID();
    const now = new Date().toISOString();
    const job: Job = {
      id: jobId,
      filename: file.name,
      status: "pending",
      createdAt: now,
      updatedAt: now,
      result: null,
      error: null,
    };

    const store = getJobStore();
    store.set(job);

    // Read the file into a Buffer for the pipeline
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Fire-and-forget: start the pipeline without awaiting it.
    // The orchestrator never throws — errors are recorded on the job.
    runPipeline(jobId, buffer, file.name, file.type);

    return NextResponse.json({ jobId }, { status: 202 });
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.httpStatus }
      );
    }

    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
