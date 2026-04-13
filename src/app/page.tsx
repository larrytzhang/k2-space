"use client";

/**
 * Main page component for the AI Procedure Generator.
 * Uses a useReducer state machine to manage the upload -> processing -> result flow.
 */

import { useReducer, useCallback } from "react";
import type { StructuredProcedure } from "@/lib/types/procedure";
import { uploadFile } from "@/lib/api";
import { validateFile } from "@/hooks/useFileUpload";
import { useJobStream } from "@/hooks/useJobStream";

import HeroSection from "@/components/HeroSection";
import UploadSection from "@/components/UploadSection";
import ProcessingIndicator from "@/components/ProcessingIndicator";
import ProcedureViewer from "@/components/procedure/ProcedureViewer";
import ExportButton from "@/components/ExportButton";
import ErrorToast from "@/components/ErrorToast";
import Footer from "@/components/Footer";

// ---------------------------------------------------------------------------
// State machine
// ---------------------------------------------------------------------------

type Phase = "idle" | "processing" | "result" | "error";

interface AppState {
  phase: Phase;
  file: File | null;
  jobId: string | null;
  progress: { stage: string; progress: number };
  procedure: StructuredProcedure | null;
  error: string | null;
}

type AppAction =
  | { type: "FILE_SELECTED"; file: File }
  | { type: "FILE_REMOVED" }
  | { type: "PROCESSING_STARTED"; jobId: string }
  | { type: "PROCESSING_PROGRESS"; stage: string; progress: number }
  | { type: "PROCESSING_SUCCEEDED"; procedure: StructuredProcedure }
  | { type: "PROCESSING_FAILED"; error: string }
  | { type: "RESET" };

const initialState: AppState = {
  phase: "idle",
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
    case "PROCESSING_STARTED":
      return {
        ...state,
        phase: "processing",
        jobId: action.jobId,
        progress: { stage: "Uploading...", progress: 0 },
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
// Component
// ---------------------------------------------------------------------------

export default function Home() {
  const [state, dispatch] = useReducer(reducer, initialState);

  /** Validate and select a file. */
  const handleFileSelected = useCallback((file: File) => {
    const result = validateFile(file);
    if (!result.valid) {
      dispatch({ type: "PROCESSING_FAILED", error: result.error! });
      return;
    }
    dispatch({ type: "FILE_SELECTED", file });
  }, []);

  /** Remove the selected file. */
  const handleFileRemoved = useCallback(() => {
    dispatch({ type: "FILE_REMOVED" });
  }, []);

  /** Upload the file and begin processing. */
  const handleProcess = useCallback(async () => {
    if (!state.file) return;
    try {
      const jobId = await uploadFile(state.file);
      dispatch({ type: "PROCESSING_STARTED", jobId });
    } catch (err) {
      dispatch({
        type: "PROCESSING_FAILED",
        error: err instanceof Error ? err.message : "Upload failed.",
      });
    }
  }, [state.file]);

  /** Dismiss the error toast and return to idle. */
  const handleDismissError = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  // Stream job progress when a jobId is set
  useJobStream(
    state.phase === "processing" ? state.jobId : null,
    (data) =>
      dispatch({
        type: "PROCESSING_PROGRESS",
        stage: data.stage,
        progress: data.progress,
      }),
    (procedure) =>
      dispatch({ type: "PROCESSING_SUCCEEDED", procedure }),
    (error) =>
      dispatch({ type: "PROCESSING_FAILED", error })
  );

  return (
    <div className="flex flex-col min-h-full">
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8">
        {/* Error overlay */}
        {state.error && (
          <ErrorToast message={state.error} onDismiss={handleDismissError} />
        )}

        {/* Idle phase: hero + upload */}
        {state.phase === "idle" && (
          <div className="space-y-8">
            <HeroSection />
            <UploadSection
              file={state.file}
              onFileSelected={handleFileSelected}
              onFileRemoved={handleFileRemoved}
              onProcess={handleProcess}
              loading={false}
            />
          </div>
        )}

        {/* Processing phase */}
        {state.phase === "processing" && (
          <ProcessingIndicator
            stage={state.progress.stage}
            progress={state.progress.progress}
          />
        )}

        {/* Result phase */}
        {state.phase === "result" && state.procedure && (
          <div className="space-y-8">
            <ProcedureViewer procedure={state.procedure} />
            <div className="flex items-center justify-center gap-4">
              <ExportButton jobId={state.jobId!} />
              <button
                type="button"
                onClick={() => dispatch({ type: "RESET" })}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
              >
                Process Another
              </button>
            </div>
          </div>
        )}

        {/* Error phase: show idle UI behind the toast */}
        {state.phase === "error" && (
          <div className="space-y-8">
            <HeroSection />
            <UploadSection
              file={state.file}
              onFileSelected={handleFileSelected}
              onFileRemoved={handleFileRemoved}
              onProcess={handleProcess}
              loading={false}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
