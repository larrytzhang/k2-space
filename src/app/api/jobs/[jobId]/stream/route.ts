/**
 * GET /api/jobs/[jobId]/stream
 *
 * Server-Sent Events (SSE) endpoint that streams pipeline progress updates
 * for a specific job. The client opens an EventSource to this URL and receives
 * **named** events:
 *
 *   - `progress` — emitted on intermediate status changes. Payload shape:
 *       { stage: string, progress: number }
 *   - `complete` — emitted once when the job reaches the "completed" state.
 *       Payload shape: full StructuredProcedure object (job.result).
 *   - `error`    — emitted once when the job reaches the "failed" state.
 *       Payload shape: error message string.
 *
 * The stream closes automatically after a terminal event is sent.
 */

import { getJobStore } from "@/lib/pipeline/job-store";
import type { Job, JobProgress, JobStatus } from "@/lib/pipeline/types";
import {
  clientIdentifier,
  rateLimitHeaders,
} from "@/lib/security/rate-limit";
import { STREAM_POLICY, streamLimiter } from "@/lib/security/policies";

/** UUID v4 shape: 8-4-4-4-12 hex characters, with a version nibble. */
const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Human-readable stage label + completion percentage for each job status. */
const STATUS_DISPLAY: Record<
  Exclude<JobStatus, "completed" | "failed">,
  { stage: string; progress: number }
> = {
  // Start pending above the 10% threshold so the ProcessingIndicator step
  // list renders its first stage as "active" from the very first tick.
  pending: { stage: "Queued for processing", progress: 15 },
  parsing: { stage: "Extracting text from document", progress: 40 },
  structuring: {
    stage: "Classifying sections, warnings, and sign-offs with Claude",
    progress: 70,
  },
};

/**
 * Handle an SSE subscription for job progress.
 *
 * Subscribes to the job store's pub/sub and forwards each status change to
 * the client as a named SSE event. If the job is already in a terminal state
 * when the stream opens, sends the corresponding terminal event immediately
 * and closes the stream.
 *
 * Next.js 15+ wraps route params in a Promise; they must be awaited.
 *
 * @param _request - Incoming HTTP request (unused).
 * @param context  - Route context containing the jobId parameter.
 * @returns A streaming Response with `text/event-stream` content type.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ jobId: string }> }
): Promise<Response> {
  const { jobId } = await context.params;

  // Rate-limit per IP to prevent connection-floods from a single client.
  const identifier = clientIdentifier(request);
  const limitResult = streamLimiter.check({
    bucket: "stream",
    identifier,
  });
  const limitHeaders = rateLimitHeaders(limitResult, STREAM_POLICY.limit);

  if (!limitResult.allowed) {
    return new Response(
      JSON.stringify({
        error: "Too many stream connections. Try again shortly.",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          ...limitHeaders,
        },
      }
    );
  }

  // Reject anything that does not match the UUID v4 shape before touching
  // the store. Prevents accidental key-space probing and keeps error messages
  // uniform for missing vs. malformed IDs.
  if (!UUID_V4_REGEX.test(jobId)) {
    return new Response(
      JSON.stringify({ error: "Invalid job ID" }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...limitHeaders,
        },
      }
    );
  }

  const store = getJobStore();
  const job = store.get(jobId);

  if (!job) {
    return new Response(
      JSON.stringify({ error: "Job not found" }),
      {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          ...limitHeaders,
        },
      }
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      /**
       * Send a named SSE event. The SSE spec requires each event to have
       * `event:`, `data:`, and a trailing blank line.
       */
      function sendEvent(eventName: string, data: unknown): void {
        const payload = `event: ${eventName}\n` +
          `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      }

      /**
       * Translate a raw job progress update into one of the named SSE events
       * the client expects. Terminal events (complete/error) close the stream.
       */
      function handleProgress(
        current: Job,
        progress: JobProgress
      ): "terminal" | "ongoing" {
        if (progress.status === "completed") {
          if (current.result) {
            sendEvent("complete", current.result);
          } else {
            sendEvent("error", "Job completed without a result payload");
          }
          return "terminal";
        }

        if (progress.status === "failed") {
          sendEvent(
            "error",
            current.error ?? progress.message ?? "Processing failed"
          );
          return "terminal";
        }

        const display = STATUS_DISPLAY[progress.status];
        sendEvent("progress", {
          stage: progress.message ?? display.stage,
          progress: display.progress,
        });
        return "ongoing";
      }

      // If the job is already terminal, send the final event and close.
      if (job.status === "completed" || job.status === "failed") {
        handleProgress(job, {
          status: job.status,
          message: job.error ?? undefined,
        });
        controller.close();
        return;
      }

      // Otherwise, emit the current state as the first progress tick so the
      // client sees an initial stage label without waiting for the next
      // status transition.
      handleProgress(job, {
        status: job.status,
        message: undefined,
      });

      // Subscribe to future updates from the orchestrator.
      const unsubscribe = store.subscribe(jobId, (progress: JobProgress) => {
        // Re-read the job so terminal events can include the latest result
        // and error fields.
        const latest = store.get(jobId);
        if (!latest) return;

        const outcome = handleProgress(latest, progress);
        if (outcome === "terminal") {
          unsubscribe();
          controller.close();
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // Hint to proxies (e.g. Vercel Edge) not to buffer the response.
      "X-Accel-Buffering": "no",
      ...limitHeaders,
    },
  });
}
