/**
 * ProcedureHeader displays the title, metadata chips, domain badge,
 * and purpose/scope paragraphs for a structured procedure.
 *
 * @param props.procedure - The full structured procedure object.
 */

import type { StructuredProcedure } from "@/lib/types/procedure";

interface ProcedureHeaderProps {
  procedure: StructuredProcedure;
}

export default function ProcedureHeader({ procedure }: ProcedureHeaderProps) {
  const metadataChips: { label: string; value: string }[] = [];
  if (procedure.documentNumber) {
    metadataChips.push({ label: "Doc", value: procedure.documentNumber });
  }
  if (procedure.revision) {
    metadataChips.push({ label: "Rev", value: procedure.revision });
  }
  if (procedure.effectiveDate) {
    metadataChips.push({ label: "Date", value: procedure.effectiveDate });
  }

  return (
    <div>
      {procedure.metadata.domain && (
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-clay-ink">
          {procedure.metadata.domain}
        </p>
      )}

      <h2 className="mt-3 font-serif text-3xl md:text-4xl text-ink tracking-tight leading-[1.15] max-w-[34ch]">
        {procedure.title}
      </h2>

      {/* Metadata chips */}
      {metadataChips.length > 0 && (
        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 font-mono text-xs text-ink-muted">
          {metadataChips.map((chip) => (
            <div key={chip.label} className="flex items-baseline gap-2">
              <dt className="uppercase tracking-[0.15em] text-ink-subtle">
                {chip.label}
              </dt>
              <dd className="text-ink">{chip.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* Counts */}
      <p className="mt-6 text-sm text-ink-muted">
        {procedure.sections.length} section
        {procedure.sections.length !== 1 ? "s" : ""}
        <span className="mx-2 text-hairline-strong">·</span>
        {procedure.metadata.totalSteps} step
        {procedure.metadata.totalSteps !== 1 ? "s" : ""}
        <span className="mx-2 text-hairline-strong">·</span>
        {procedure.metadata.totalWarnings} warning
        {procedure.metadata.totalWarnings !== 1 ? "s" : ""}
      </p>

      {/* Purpose */}
      {procedure.purpose && (
        <div className="mt-8 border-t border-hairline pt-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-subtle">
            Purpose
          </p>
          <p className="mt-2 text-[15px] text-ink-muted leading-[1.7] max-w-[70ch]">
            {procedure.purpose}
          </p>
        </div>
      )}

      {/* Scope */}
      {procedure.scope && (
        <div className="mt-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-subtle">
            Scope
          </p>
          <p className="mt-2 text-[15px] text-ink-muted leading-[1.7] max-w-[70ch]">
            {procedure.scope}
          </p>
        </div>
      )}
    </div>
  );
}
