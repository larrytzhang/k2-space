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
    <div className="mx-auto flex max-w-xl flex-col items-start gap-10 py-16 md:py-24 animate-[fadeIn_0.4s_ease-out]">
      <div className="w-full">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-subtle">
          Processing
        </p>
        <p className="mt-3 font-serif text-2xl text-ink tracking-tight">
          {stage || "Preparing document"}
        </p>
      </div>

      <div className="w-full">
        <div className="h-px w-full bg-hairline overflow-hidden">
          <div
            className="h-full bg-ink transition-all duration-500 ease-out"
            style={{ width: `${clamped}%` }}
          />
        </div>
        <p className="mt-3 font-mono text-xs text-ink-subtle tabular-nums">
          {String(Math.round(clamped)).padStart(2, "0")}%  ·  typically 8–12s
        </p>
      </div>

      <ol className="w-full">
        {STAGES.map((s, i) => {
          const state = stageStates[i];
          return (
            <li
              key={s.label}
              className="grid grid-cols-[2.5rem_1fr] items-baseline gap-4 py-3 border-t border-hairline first:border-t-0"
              aria-current={state === "active" ? "step" : undefined}
            >
              <span
                className={`font-mono text-xs tabular-nums ${
                  state === "pending" ? "text-ink-subtle" : "text-ink-muted"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={`text-[15px] ${
                  state === "pending"
                    ? "text-ink-subtle"
                    : state === "done"
                      ? "text-ink-muted"
                      : "text-ink font-medium"
                }`}
              >
                {s.label}
                {state === "active" && (
                  <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-clay align-middle animate-pulse" />
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
