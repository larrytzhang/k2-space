"use client";

/**
 * SampleProcedures renders three pre-authored procedure cards on the landing
 * page. Clicking a card loads the matching pre-computed JSON result and jumps
 * straight to the procedure viewer, bypassing upload and the Anthropic API.
 *
 * This is the primary "try it in 5 seconds" path for demo viewers who do not
 * want to find and upload their own document.
 *
 * @param props.onSelect - Callback invoked with the chosen sample id.
 * @param props.disabled - When true, cards are non-interactive (e.g. during an
 *                        in-flight processing job).
 */

import { SAMPLE_PROCEDURES, type SampleProcedure } from "@/lib/samples";
import {
  BeakerIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

interface SampleProceduresProps {
  onSelect: (sampleId: string) => void;
  disabled?: boolean;
}

/** Icon component matched to each domain for visual differentiation. */
const DOMAIN_ICON: Record<SampleProcedure["domain"], typeof BeakerIcon> = {
  test: BeakerIcon,
  inspection: MagnifyingGlassIcon,
  safety: ShieldCheckIcon,
};

/** Short human-readable label for each domain, shown as a pill on cards. */
const DOMAIN_LABEL: Record<SampleProcedure["domain"], string> = {
  test: "Assembly / Test",
  inspection: "Inspection",
  safety: "Safety",
};

export default function SampleProcedures({
  onSelect,
  disabled,
}: SampleProceduresProps) {
  return (
    <section
      aria-labelledby="samples-heading"
      className="space-y-4"
    >
      <div className="flex items-baseline justify-between">
        <h2
          id="samples-heading"
          className="text-sm font-semibold tracking-wide text-slate-900 uppercase"
        >
          Try a sample
        </h2>
        <span className="text-xs text-slate-500">
          No upload required · results are pre-computed
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {SAMPLE_PROCEDURES.map((sample) => {
          const Icon = DOMAIN_ICON[sample.domain];
          return (
            <button
              key={sample.id}
              type="button"
              onClick={() => onSelect(sample.id)}
              disabled={disabled}
              className="group flex flex-col items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm"
              aria-label={`Try sample procedure: ${sample.title}`}
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {DOMAIN_LABEL[sample.domain]}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                {sample.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {sample.description}
              </p>
              <span className="mt-auto text-xs font-medium text-indigo-600 group-hover:text-indigo-700">
                View structured output →
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
