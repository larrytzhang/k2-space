"use client";

/**
 * Main page component for the AI Procedure Generator demo.
 *
 * Drives a small reducer-based state machine across four phases:
 *
 *   idle        — landing page (hero, sample cards, upload zone)
 *   processing  — streaming progress indicator
 *   result      — rendered procedure + raw JSON toggle
 *   error       — idle UI with an error toast overlay
 *
 * Two ingest paths share the state machine:
 *   1. "upload"  — real file goes through the backend pipeline.
 *   2. "sample"  — pre-computed JSON loaded from /public/samples/results,
 *                  with a short simulated-progress animation for polish.
 */

import { useReducer, useCallback } from "react";
import type { StructuredProcedure } from "@/lib/types/procedure";
import { uploadFile } from "@/lib/api";
import { validateFile } from "@/hooks/useFileUpload";
import { useJobStream } from "@/hooks/useJobStream";
import { SAMPLE_PROCEDURES } from "@/lib/samples";

import HeroSection from "@/components/HeroSection";
import SampleProcedures from "@/components/SampleProcedures";
import UploadSection from "@/components/UploadSection";
import ProcessingIndicator from "@/components/ProcessingIndicator";
import ProcedureResult from "@/components/procedure/ProcedureResult";
import ErrorToast from "@/components/ErrorToast";
import ErrorBoundary from "@/components/ErrorBoundary";
import AboutLink from "@/components/AboutLink";
import Footer from "@/components/Footer";
import { friendlyError } from "@/lib/error-messages";

// ---------------------------------------------------------------------------
// State machine
// ---------------------------------------------------------------------------

type Phase = "idle" | "processing" | "result" | "error";
type Source = "upload" | "sample";

interface AppState {
  phase: Phase;
  source: Source | null;
  file: File | null;
  jobId: string | null;
  progress: { stage: string; progress: number };
  procedure: StructuredProcedure | null;
  error: string | null;
}

type AppAction =
  | { type: "FILE_SELECTED"; file: File }
  | { type: "FILE_REMOVED" }
  | { type: "UPLOAD_STARTED"; jobId: string }
  | { type: "SAMPLE_STARTED" }
  | { type: "PROCESSING_PROGRESS"; stage: string; progress: number }
  | { type: "PROCESSING_SUCCEEDED"; procedure: StructuredProcedure }
  | { type: "PROCESSING_FAILED"; error: string }
  | { type: "RESET" };

const initialState: AppState = {
  phase: "idle",
  source: null,
  file: null,
  jobId: null,
  progress: { stage: "", progress: 0 },
  procedure: null,
  error: null,
};

/** Reducer function for the application state machine. */
function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "FILE_SELECTED":
      return { ...state, file: action.file, error: null };
    case "FILE_REMOVED":
      return { ...state, file: null };
    case "UPLOAD_STARTED":
      return {
        ...state,
        phase: "processing",
        source: "upload",
        jobId: action.jobId,
        progress: { stage: "Uploading document", progress: 5 },
        error: null,
      };
    case "SAMPLE_STARTED":
      return {
        ...state,
        phase: "processing",
        source: "sample",
        jobId: null,
        progress: { stage: "Loading sample", progress: 10 },
        error: null,
      };
    case "PROCESSING_PROGRESS":
      return {
        ...state,
        progress: { stage: action.stage, progress: action.progress },
      };
    case "PROCESSING_SUCCEEDED":
      return {
        ...state,
        phase: "result",
        procedure: action.procedure,
      };
    case "PROCESSING_FAILED":
      return {
        ...state,
        phase: "error",
        error: action.error,
      };
    case "RESET":
      return { ...initialState };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Simulated-progress timeline for sample procedures
// ---------------------------------------------------------------------------

/**
 * A scripted sequence of progress ticks shown while a sample is loading.
 * Keeps the demo feeling "live" without pretending the result is newly
 * generated — total runtime is ~1.8 seconds.
 */
const SAMPLE_PROGRESS_TIMELINE: readonly {
  delayMs: number;
  stage: string;
  progress: number;
}[] = [
  { delayMs: 200, stage: "Extracting text from document", progress: 25 },
  { delayMs: 700, stage: "Identifying sections and steps", progress: 50 },
  { delayMs: 1200, stage: "Classifying safety warnings and sign-offs", progress: 75 },
  { delayMs: 1700, stage: "Validating output schema", progress: 95 },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Home() {
  const [state, dispatch] = useReducer(reducer, initialState);

  /** Validate and select a file for upload. */
  const handleFileSelected = useCallback((file: File) => {
    const result = validateFile(file);
    if (!result.valid) {
      dispatch({ type: "PROCESSING_FAILED", error: result.error! });
      return;
    }
    dispatch({ type: "FILE_SELECTED", file });
  }, []);

  /** Remove the selected file and return to a clean idle state. */
  const handleFileRemoved = useCallback(() => {
    dispatch({ type: "FILE_REMOVED" });
  }, []);

  /** Upload the selected file and enter processing. */
  const handleProcess = useCallback(async () => {
    if (!state.file) return;
    try {
      const jobId = await uploadFile(state.file);
      dispatch({ type: "UPLOAD_STARTED", jobId });
    } catch (err) {
      dispatch({
        type: "PROCESSING_FAILED",
        error: err instanceof Error ? err.message : "Upload failed.",
      });
    }
  }, [state.file]);

  /**
   * Kick off the sample-loading flow: transition to processing, then run the
   * scripted progress timeline in parallel with a fetch of the cached JSON.
   * The result is dispatched once both the timeline and the fetch complete.
   */
  const handleSampleSelected = useCallback((sampleId: string) => {
    const sample = SAMPLE_PROCEDURES.find((s) => s.id === sampleId);
    if (!sample) {
      dispatch({
        type: "PROCESSING_FAILED",
        error: "Sample not found.",
      });
      return;
    }

    dispatch({ type: "SAMPLE_STARTED" });

    // Fetch the cached JSON in parallel with the progress animation.
    const fetchPromise = fetch(sample.resultPath).then(async (res) => {
      if (!res.ok) {
        throw new Error(`Failed to load sample (status ${res.status})`);
      }
      return (await res.json()) as StructuredProcedure;
    });

    // Run the scripted progress timeline.
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (const tick of SAMPLE_PROGRESS_TIMELINE) {
      timers.push(
        setTimeout(() => {
          dispatch({
            type: "PROCESSING_PROGRESS",
            stage: tick.stage,
            progress: tick.progress,
          });
        }, tick.delayMs)
      );
    }

    // Minimum display time so the progress animation isn't jarringly short.
    const MINIMUM_DISPLAY_MS = 1800;
    const minimumDelay = new Promise<void>((resolve) =>
      setTimeout(resolve, MINIMUM_DISPLAY_MS)
    );

    Promise.all([fetchPromise, minimumDelay])
      .then(([procedure]) => {
        dispatch({ type: "PROCESSING_SUCCEEDED", procedure });
      })
      .catch((err: unknown) => {
        dispatch({
          type: "PROCESSING_FAILED",
          error:
            err instanceof Error
              ? err.message
              : "Could not load the sample procedure.",
        });
      })
      .finally(() => {
        for (const t of timers) clearTimeout(t);
      });
  }, []);

  /** Dismiss the error toast and return to the idle state. */
  const handleDismissError = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  // Subscribe to the backend SSE stream only for real uploads.
  useJobStream(
    state.phase === "processing" && state.source === "upload"
      ? state.jobId
      : null,
    (data) =>
      dispatch({
        type: "PROCESSING_PROGRESS",
        stage: data.stage,
        progress: data.progress,
      }),
    (procedure) =>
      dispatch({ type: "PROCESSING_SUCCEEDED", procedure }),
    (error) => dispatch({ type: "PROCESSING_FAILED", error })
  );

  const showLanding =
    state.phase === "idle" || state.phase === "error";

  return (
    <div className="flex flex-col min-h-full">
      <main className="flex-1 mx-auto w-full max-w-5xl px-6 md:px-10 py-6 md:py-10">
        {state.error && (
          <ErrorToast
            message={friendlyError(state.error)}
            onDismiss={handleDismissError}
          />
        )}

        {showLanding && (
          <div>
            <HeroSection />
            <SampleProcedures
              onSelect={handleSampleSelected}
              disabled={state.phase === "processing"}
            />
            <section className="py-10 mt-6">
              <div className="flex items-baseline justify-between border-b border-hairline pb-4">
                <h2 className="font-serif text-2xl text-ink tracking-tight">
                  Or upload your own
                </h2>
                <span className="hidden sm:block font-mono text-[11px] uppercase tracking-[0.15em] text-ink-subtle">
                  PDF · DOCX · TXT — up to 10 MB
                </span>
              </div>
              <div className="mt-8">
                <UploadSection
                  file={state.file}
                  onFileSelected={handleFileSelected}
                  onFileRemoved={handleFileRemoved}
                  onProcess={handleProcess}
                  loading={false}
                />
              </div>
            </section>
          </div>
        )}

        {state.phase === "processing" && (
          <ProcessingIndicator
            stage={state.progress.stage}
            progress={state.progress.progress}
          />
        )}

        {state.phase === "result" && state.procedure && (
          <ErrorBoundary onReset={() => dispatch({ type: "RESET" })}>
            <ProcedureResult
              procedure={state.procedure}
              onReset={() => dispatch({ type: "RESET" })}
            />
          </ErrorBoundary>
        )}
      </main>

      <Footer />
      <AboutLink />
    </div>
  );
}
