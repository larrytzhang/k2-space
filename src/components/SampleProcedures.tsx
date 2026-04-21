"use client";

/**
 * SampleProcedures renders three pre-authored procedure rows under a quiet
 * editorial heading. Clicking a row loads the matching pre-computed JSON
 * result and jumps straight to the procedure viewer, bypassing upload and
 * the Anthropic API. Designed as a list, not cards — hairline dividers,
 * generous whitespace, no shadows.
 *
 * @param props.onSelect - Callback invoked with the chosen sample id.
 * @param props.disabled - When true, rows are non-interactive (e.g. during an
 *                        in-flight processing job).
 */

import { SAMPLE_PROCEDURES, type SampleProcedure } from "@/lib/samples";

interface SampleProceduresProps {
  onSelect: (sampleId: string) => void;
  disabled?: boolean;
}

/** Short human-readable label for each domain. */
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
    <section aria-labelledby="samples-heading" className="py-10">
      <div className="flex items-baseline justify-between border-b border-hairline pb-4">
        <h2
          id="samples-heading"
          className="font-serif text-2xl text-ink tracking-tight"
        >
          Sample procedures
        </h2>
        <span className="hidden sm:block font-mono text-[11px] uppercase tracking-[0.15em] text-ink-subtle">
          Pre-computed · zero upload
        </span>
      </div>

      <ul className="mt-2 divide-y divide-hairline">
        {SAMPLE_PROCEDURES.map((sample, idx) => (
          <li key={sample.id}>
            <button
              type="button"
              onClick={() => onSelect(sample.id)}
              disabled={disabled}
              className="group grid w-full grid-cols-[3rem_1fr_auto] items-start gap-6 py-6 text-left transition-colors hover:bg-paper/60 focus:outline-none focus-visible:bg-paper disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              aria-label={`Try sample procedure: ${sample.title}`}
            >
              <span className="font-mono text-xs text-ink-subtle pt-1 tabular-nums">
                {String(idx + 1).padStart(2, "0")}
              </span>

              <div className="min-w-0">
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-subtle">
                  {DOMAIN_LABEL[sample.domain]}
                </p>
                <h3 className="mt-1.5 font-serif text-xl text-ink leading-snug tracking-tight">
                  {sample.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-muted max-w-[60ch]">
                  {sample.description}
                </p>
              </div>

              <span className="hidden md:inline-flex items-center gap-2 pt-2 text-sm text-ink-muted group-hover:text-clay-ink transition-colors">
                View output
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
