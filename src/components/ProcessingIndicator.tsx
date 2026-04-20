"use client";

/**
 * ProcessingIndicator shows a stepped progress view while a procedure is
 * being processed (whether from a real upload or a cached sample).
 *
 * Instead of a single label + spinner, reviewers see the four canonical
 * pipeline stages with per-stage status (done / active / pending). The
 * component derives each stage's state from the incoming progress
 * percentage, so the same indicator works for both the SSE-driven real
 * pipeline and the scripted sample timeline.
 *
 * @param props.stage - Current stage label forwarded from the source.
 * @param props.progress - Progress percentage from 0 to 100.
 */

import {
  CheckCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";

interface ProcessingIndicatorProps {
  stage: string;
  progress: number;
}

/**
 * Canonical four-stage pipeline used by both the real backend and sample
 * flows. The `minProgress` value is the percentage at which each stage
 * transitions from "pending" to "active".
 */
const STAGES: readonly { label: string; minProgress: number }[] = [
  { label: "Extracting text from document", minProgress: 10 },
  { label: "Identifying sections and steps", minProgress: 35 },
  { label: "Classifying safety warnings and sign-offs", minProgress: 55 },
  { label: "Validating output schema", minProgress: 85 },
] as const;

/**
 * Compute the status of each stage given the overall progress percentage.
 * The highest-indexed stage whose threshold has been reached is "active"
 * (i.e. currently in progress); stages before it are "done"; stages after
 * it are "pending".
 */
function deriveStageStates(
  progress: number
): readonly ("done" | "active" | "pending")[] {
  let activeIndex = -1;
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (progress >= STAGES[i].minProgress) {
      activeIndex = i;
      break;
    }
  }
  return STAGES.map((_, i) => {
    if (i < activeIndex) return "done";
    if (i === activeIndex) return "active";
    return "pending";
  });
}

export default function ProcessingIndicator({
  stage,
  progress,
}: ProcessingIndicatorProps) {
  const clamped = Math.min(Math.max(progress, 0), 100);
  const stageStates = deriveStageStates(clamped);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-start gap-6 py-12 animate-[fadeIn_0.3s_ease-out]">
      <div className="w-full">
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Processing
        </p>
        <p className="mt-1 text-lg font-semibold text-slate-900">
          {stage || "Preparing document"}
        </p>
      </div>

      <div className="w-full">
        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-slate-900 transition-all duration-500 ease-out"
            style={{ width: `${clamped}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {Math.round(clamped)}% · typically completes in 8–12 seconds
        </p>
      </div>

      <ul className="w-full space-y-3">
        {STAGES.map((s, i) => {
          const state = stageStates[i];
          return (
            <li
              key={s.label}
              className="flex items-center gap-3 text-sm"
              aria-current={state === "active" ? "step" : undefined}
            >
              {state === "done" && (
                <CheckCircleIcon className="h-5 w-5 text-emerald-500 shrink-0" />
              )}
              {state === "active" && (
                <ArrowPathIcon className="h-5 w-5 text-slate-700 animate-spin shrink-0" />
              )}
              {state === "pending" && (
                <span className="h-5 w-5 rounded-full border-2 border-slate-200 shrink-0" />
              )}
              <span
                className={
                  state === "pending"
                    ? "text-slate-400"
                    : state === "done"
                      ? "text-slate-500 line-through decoration-slate-300"
                      : "text-slate-900 font-medium"
                }
              >
                {s.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
