/**
 * GET /api/jobs/[jobId]/stream
 *
 * Server-Sent Events (SSE) endpoint that streams pipeline progress
 * updates for a specific job. The client opens an EventSource to
 * this URL and receives events as the job progresses through
 * parsing, structuring, and completion (or failure).
 *
 * Events are sent in the standard SSE format:
 *   data: {"status":"parsing","message":"..."}
 *
 * The stream closes automatically when the job reaches a terminal
 * state ("completed" or "failed").
 */

import { getJobStore } from "@/lib/pipeline/job-store";
import type { JobProgress } from "@/lib/pipeline/types";

/**
 * Handle SSE subscription for job progress.
 *
 * Subscribes to the job store's pub/sub mechanism and pushes
 * each progress event to the client via a ReadableStream.
 * If the job is already in a terminal state, sends that state
 * immediately and closes the stream.
 *
 * Next.js 15+ wraps route params in a Promise — they must be awaited.
 *
 * @param _request - The incoming HTTP request (unused).
 * @param context - Route context containing the jobId parameter.
 * @returns A streaming Response with SSE content type.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ jobId: string }> }
): Promise<Response> {
  const { jobId } = await context.params;
  const store = getJobStore();

  const job = store.get(jobId);
  if (!job) {
    return new Response(
      JSON.stringify({ error: "Job not found" }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      /**
       * Send an SSE event to the client.
       *
       * @param progress - The progress snapshot to send.
       */
      function sendEvent(progress: JobProgress): void {
        const data = JSON.stringify(progress);
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      }

      // If the job is already terminal, send the final state and close.
      if (job.status === "completed" || job.status === "failed") {
        sendEvent({
          status: job.status,
          message: job.error ?? undefined,
        });
        controller.close();
        return;
      }

      // Send the current state as the first event.
      sendEvent({
        status: job.status,
        message: undefined,
      });

      // Subscribe to future updates.
      const unsubscribe = store.subscribe(jobId, (progress: JobProgress) => {
        sendEvent(progress);

        // Close the stream on terminal states.
        if (progress.status === "completed" || progress.status === "failed") {
          unsubscribe();
          controller.close();
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
