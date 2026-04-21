"use client";

/**
 * EquipmentList renders a collapsible table of required equipment and materials.
 * Uses useState to toggle the collapsed/expanded state.
 *
 * @param props.equipment - Array of EquipmentItem objects to display.
 */

import { useState } from "react";
import type { EquipmentItem } from "@/lib/types/procedure";

interface EquipmentListProps {
  equipment: EquipmentItem[];
}

export default function EquipmentList({ equipment }: EquipmentListProps) {
  const [expanded, setExpanded] = useState(false);

  if (equipment.length === 0) return null;

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-baseline justify-between text-left group"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-subtle">
          Equipment &amp; materials
          <span className="ml-2 text-ink-muted">({equipment.length})</span>
        </p>
        <span className="text-xs text-ink-muted group-hover:text-ink transition-colors">
          {expanded ? "Hide" : "Show"}
        </span>
      </button>

      {expanded && (
        <div className="mt-4 overflow-x-auto border-t border-hairline">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline">
                <th className="py-3 pr-4 text-left font-mono text-[11px] uppercase tracking-[0.15em] text-ink-subtle font-normal">
                  Name
                </th>
                <th className="py-3 pr-4 text-left font-mono text-[11px] uppercase tracking-[0.15em] text-ink-subtle font-normal">
                  Qty
                </th>
                <th className="py-3 pr-4 text-left font-mono text-[11px] uppercase tracking-[0.15em] text-ink-subtle font-normal">
                  Spec
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {equipment.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3 pr-4 text-ink">{item.name}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-ink-muted tabular-nums">
                    {item.quantity || "—"}
                  </td>
                  <td className="py-3 pr-4 text-ink-muted">
                    {item.specification || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
