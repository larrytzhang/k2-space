/**
 * POST /api/upload
 *
 * Accepts a multipart/form-data upload containing a single file, rate-limits
 * the request, validates the file, creates a pipeline job, and fires off the
 * background processing pipeline. Returns the job ID immediately so the
 * client can subscribe to SSE progress updates at /api/jobs/[jobId]/stream.
 *
 * Security posture:
 *   - Per-IP rate limit (10 req/hr) to protect the Anthropic key.
 *   - Strict multipart/form-data content-type gate before parsing the body.
 *   - Reject any form fields other than the expected "file" field.
 *   - Defers file-content validation to lib/validation.
 *   - Error responses do not include stack traces or internal paths.
 */

import { NextResponse } from "next/server";
import { validateUploadedFile } from "@/lib/validation";
import { AppError } from "@/lib/errors";
import { getJobStore } from "@/lib/pipeline/job-store";
import { runPipeline } from "@/lib/pipeline/orchestrator";
import type { Job } from "@/lib/pipeline/types";
import {
  clientIdentifier,
  rateLimitHeaders,
} from "@/lib/security/rate-limit";
import { UPLOAD_POLICY, uploadLimiter } from "@/lib/security/policies";

/** Upper bound on the total number of fields accepted in the form body. */
const MAX_FORM_FIELDS = 1;

/** The single field name this route expects. */
const EXPECTED_FIELD = "file";

/**
 * Handle a file upload.
 *
 * @param request - The incoming HTTP request.
 * @returns A JSON response with `{ jobId }` on success, or an error body.
 */
export async function POST(request: Request): Promise<NextResponse> {
  // 1. Rate-limit before touching the body. This prevents a client from
  //    ballooning memory by sending a huge multipart payload we'll reject.
  const identifier = clientIdentifier(request);
  const limitResult = uploadLimiter.check({
    bucket: "upload",
    identifier,
  });
  const limitHeaders = rateLimitHeaders(limitResult, UPLOAD_POLICY.limit);

  if (!limitResult.allowed) {
    return NextResponse.json(
      {
        error:
          "Rate limit exceeded. Samples still work — try one instead, or come back in a few minutes.",
        code: "RATE_LIMITED",
      },
      { status: 429, headers: limitHeaders }
    );
  }

  // 2. Enforce a multipart content-type gate. Skipping this allows attackers
  //    to send non-multipart bodies and observe different error paths.
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
    return NextResponse.json(
      {
        error: "Expected multipart/form-data body.",
        code: "INVALID_CONTENT_TYPE",
      },
      { status: 400, headers: limitHeaders }
    );
  }

  try {
    const formData = await request.formData();

    // 3. Reject bodies with unexpected fields. A legitimate client sends
    //    exactly one "file" field; anything else is either a bug or abuse.
    const keys = Array.from(new Set(Array.from(formData.keys())));
    if (keys.length > MAX_FORM_FIELDS || keys[0] !== EXPECTED_FIELD) {
      return NextResponse.json(
        {
          error: `Only a single "${EXPECTED_FIELD}" field is allowed.`,
          code: "INVALID_FORM_FIELDS",
        },
        { status: 400, headers: limitHeaders }
      );
    }

    const file = formData.get(EXPECTED_FIELD);
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: `Missing required field: ${EXPECTED_FIELD}` },
        { status: 400, headers: limitHeaders }
      );
    }

    // 4. Size, MIME, and emptiness checks live in lib/validation so that the
    //    rules stay in one place and can be tested in isolation.
    validateUploadedFile(file);

    // 5. Create the job record. The ID is a crypto-random UUID so an attacker
    //    cannot guess job IDs and read other users' results.
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

    getJobStore().set(job);

    // Read the file into a Buffer for the pipeline.
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Fire-and-forget: the orchestrator never throws — errors are recorded
    // on the job record and surfaced via the SSE stream.
    runPipeline(jobId, buffer, file.name, file.type);

    return NextResponse.json(
      { jobId },
      { status: 202, headers: limitHeaders }
    );
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.httpStatus, headers: limitHeaders }
      );
    }

    // Do not leak internal error details to the client. Log server-side if
    // needed, but the response is deliberately generic.
    return NextResponse.json(
      { error: "Upload failed. Please try again.", code: "INTERNAL_ERROR" },
      { status: 500, headers: limitHeaders }
    );
  }
}
