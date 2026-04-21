/**
 * ProcedureStats renders summary metadata as a restrained keyline row —
 * number + label pairs separated by hairlines, no pill chrome.
 *
 * @param props.metadata - The procedure metadata object.
 */

import type { ProcedureMetadata } from "@/lib/types/procedure";

interface ProcedureStatsProps {
  metadata: ProcedureMetadata;
}

export default function ProcedureStats({ metadata }: ProcedureStatsProps) {
  const stats: { label: string; value: string }[] = [
    { label: "Steps", value: String(metadata.totalSteps) },
    { label: "Warnings", value: String(metadata.totalWarnings) },
  ];

  if (metadata.estimatedDuration) {
    stats.push({ label: "Duration", value: metadata.estimatedDuration });
  }

  return (
    <dl className="mt-8 grid grid-cols-2 sm:grid-cols-3 border-t border-hairline">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="border-b border-hairline border-r last:border-r-0 sm:border-b-0 py-5 pr-6"
        >
          <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-subtle">
            {stat.label}
          </dt>
          <dd className="mt-2 font-serif text-3xl text-ink tabular-nums">
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
