"use client";

/**
 * ProcessingIndicator displays a spinner, stage label, and progress bar
 * while the backend processes a procedure document.
 *
 * @param props.stage - Current processing stage label.
 * @param props.progress - Progress percentage from 0 to 100.
 */

interface ProcessingIndicatorProps {
  stage: string;
  progress: number;
}

export default function ProcessingIndicator({
  stage,
  progress,
}: ProcessingIndicatorProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-16 animate-[fadeIn_0.3s_ease-out]">
      {/* CSS Spinner */}
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />

      {/* Stage label */}
      <p className="text-lg font-medium text-slate-700">
        {stage || "Parsing document..."}
      </p>

      {/* Progress bar */}
      <div className="w-full max-w-md">
        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          />
        </div>
        <p className="mt-2 text-center text-sm text-slate-500">
          {Math.round(progress)}% complete
        </p>
      </div>

      <p className="text-sm text-slate-400">
        This typically takes 10-30 seconds
      </p>
    </div>
  );
}
