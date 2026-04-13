"use client";

/**
 * EquipmentList renders a collapsible table of required equipment and materials.
 * Uses useState to toggle the collapsed/expanded state.
 *
 * @param props.equipment - Array of EquipmentItem objects to display.
 */

import { useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import type { EquipmentItem } from "@/lib/types/procedure";

interface EquipmentListProps {
  equipment: EquipmentItem[];
}

export default function EquipmentList({ equipment }: EquipmentListProps) {
  const [expanded, setExpanded] = useState(false);

  if (equipment.length === 0) return null;

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between bg-slate-50 px-4 py-3 text-left hover:bg-slate-100 transition-colors"
      >
        <h4 className="text-sm font-semibold text-slate-700">
          Equipment &amp; Materials ({equipment.length})
        </h4>
        {expanded ? (
          <ChevronUpIcon className="h-4 w-4 text-slate-500" />
        ) : (
          <ChevronDownIcon className="h-4 w-4 text-slate-500" />
        )}
      </button>

      {expanded && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="px-4 py-2 text-left font-medium text-slate-600">
                  Name
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-600">
                  Qty
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-600">
                  Spec
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {equipment.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-2 text-slate-700">{item.name}</td>
                  <td className="px-4 py-2 text-slate-500">
                    {item.quantity || "—"}
                  </td>
                  <td className="px-4 py-2 text-slate-500">
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
