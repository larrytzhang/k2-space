"use client";

/**
 * Hook for streaming job progress via Server-Sent Events.
 */

import { useEffect, useRef } from "react";
import type { StructuredProcedure } from "@/lib/types/procedure";

/** Progress data emitted during processing. */
export interface JobProgress {
  stage: string;
  progress: number;
}

/**
 * Connects to an SSE endpoint for a given job and dispatches progress,
 * completion, and error callbacks.
 *
 * @param jobId - The job ID to stream, or null to skip.
 * @param onProgress - Called on each progress event with stage and percentage.
 * @param onComplete - Called when processing finishes with the structured procedure.
 * @param onError - Called if an error occurs during streaming.
 */
export function useJobStream(
  jobId: string | null,
  onProgress: (data: JobProgress) => void,
  onComplete: (procedure: StructuredProcedure) => void,
  onError: (error: string) => void
): void {
  const onProgressRef = useRef(onProgress);
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);

  // Keep the latest callback references in sync without mutating refs during
  // render (React 19 forbids the latter).
  useEffect(() => {
    onProgressRef.current = onProgress;
    onCompleteRef.current = onComplete;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    if (!jobId) return;

    const eventSource = new EventSource(`/api/jobs/${jobId}/stream`);
    let timeoutId: ReturnType<typeof setTimeout>;

    /** Reset the inactivity timeout. */
    const resetTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        onErrorRef.current("Processing timed out after 120 seconds.");
        eventSource.close();
      }, 120_000);
    };

    resetTimeout();

    eventSource.addEventListener("progress", (event: MessageEvent) => {
      resetTimeout();
      try {
        const data = JSON.parse(event.data) as JobProgress;
        onProgressRef.current(data);
      } catch {
        // Ignore malformed progress events.
      }
    });

    eventSource.addEventListener("complete", (event: MessageEvent) => {
      clearTimeout(timeoutId);
      try {
        const data = JSON.parse(event.data) as StructuredProcedure;
        onCompleteRef.current(data);
      } catch {
        onErrorRef.current("Failed to parse completed procedure data.");
      }
      eventSource.close();
    });

    eventSource.addEventListener("error", (event: MessageEvent) => {
      clearTimeout(timeoutId);
      const message =
        typeof event.data === "string" && event.data.length > 0
          ? event.data
          : "An unexpected error occurred during processing.";
      onErrorRef.current(message);
      eventSource.close();
    });

    eventSource.onerror = () => {
      clearTimeout(timeoutId);
      onErrorRef.current(
        "Lost connection to the server. Please try again."
      );
      eventSource.close();
    };

    return () => {
      clearTimeout(timeoutId);
      eventSource.close();
    };
  }, [jobId]);
}
