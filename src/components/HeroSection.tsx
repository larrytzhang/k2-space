"use client";

/**
 * HeroSection is the landing-page headline unit. It establishes what the app
 * does, who built it, and why it matters — all within the first viewport.
 *
 * Layout:
 *   - Small eyebrow label identifying the intended audience (K2 Space).
 *   - Primary H1 stating the direct value proposition.
 *   - Sub-headline giving the time-savings quantification.
 *   - Three-step pipeline visual (Upload → Parse → Export).
 */

import {
  ArrowUpTrayIcon,
  SparklesIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

/** One step in the pipeline visual shown below the hero copy. */
interface PipelineStep {
  label: string;
  icon: typeof ArrowUpTrayIcon;
}

const PIPELINE_STEPS: PipelineStep[] = [
  { label: "Upload", icon: ArrowUpTrayIcon },
  { label: "Parse with Claude", icon: SparklesIcon },
  { label: "Export JSON", icon: ArrowDownTrayIcon },
];

export default function HeroSection() {
  return (
    <section className="text-center py-10 animate-[fadeIn_0.3s_ease-out]">
      <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
        Prototype · Built for K2 Space
      </span>

      <h1 className="mt-5 text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 leading-tight max-w-3xl mx-auto">
        Turn paper aerospace procedures into structured JSON in seconds.
      </h1>

      <p className="mt-4 text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
        Hours of manual digitization collapsed into a single upload. Warnings,
        cautions, sign-offs, and pass/fail criteria are preserved verbatim and
        classified correctly for downstream tooling.
      </p>

      <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500">
        {PIPELINE_STEPS.map((step, idx) => {
          const Icon = step.icon;
          return (
            <span key={step.label} className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-1.5 text-slate-700">
                <Icon className="h-4 w-4" />
                <span className="font-medium">{step.label}</span>
              </span>
              {idx < PIPELINE_STEPS.length - 1 && (
                <span className="text-slate-300" aria-hidden="true">
                  →
                </span>
              )}
            </span>
          );
        })}
      </div>
    </section>
  );
}
