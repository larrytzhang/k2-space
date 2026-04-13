/**
 * ProcedureStats renders a row of summary badges for the procedure metadata.
 * Displays step count, warning count, and estimated duration.
 *
 * @param props.metadata - The procedure metadata object.
 */

import type { ProcedureMetadata } from "@/lib/types/procedure";

interface ProcedureStatsProps {
  metadata: ProcedureMetadata;
}

export default function ProcedureStats({ metadata }: ProcedureStatsProps) {
  const stats: { label: string; value: string }[] = [
    {
      label: "Steps",
      value: String(metadata.totalSteps),
    },
    {
      label: "Warnings",
      value: String(metadata.totalWarnings),
    },
  ];

  if (metadata.estimatedDuration) {
    stats.push({
      label: "Duration",
      value: metadata.estimatedDuration,
    });
  }

  return (
    <div className="flex flex-wrap gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2"
        >
          <span className="text-sm font-semibold text-slate-900">
            {stat.value}
          </span>
          <span className="text-sm text-slate-500">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
