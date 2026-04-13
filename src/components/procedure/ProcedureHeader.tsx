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
  const metadataChips: string[] = [];
  if (procedure.documentNumber) {
    metadataChips.push(`Doc: ${procedure.documentNumber}`);
  }
  if (procedure.revision) {
    metadataChips.push(`Rev: ${procedure.revision}`);
  }
  if (procedure.effectiveDate) {
    metadataChips.push(`Date: ${procedure.effectiveDate}`);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900">{procedure.title}</h2>

      {/* Metadata chips */}
      {metadataChips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {metadataChips.map((chip) => (
            <span
              key={chip}
              className="inline-flex items-center rounded-md bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200"
            >
              {chip}
            </span>
          ))}
        </div>
      )}

      {/* Domain badge and counts */}
      <div className="flex flex-wrap items-center gap-3">
        {procedure.metadata.domain && (
          <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 uppercase tracking-wide">
            {procedure.metadata.domain}
          </span>
        )}
        <span className="text-sm text-slate-500">
          {procedure.sections.length} section
          {procedure.sections.length !== 1 ? "s" : ""} &middot;{" "}
          {procedure.metadata.totalSteps} step
          {procedure.metadata.totalSteps !== 1 ? "s" : ""} &middot;{" "}
          {procedure.metadata.totalWarnings} warning
          {procedure.metadata.totalWarnings !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Purpose */}
      {procedure.purpose && (
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-1">
            Purpose
          </h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            {procedure.purpose}
          </p>
        </div>
      )}

      {/* Scope */}
      {procedure.scope && (
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-1">Scope</h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            {procedure.scope}
          </p>
        </div>
      )}
    </div>
  );
}
