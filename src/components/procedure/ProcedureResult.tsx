"use client";

/**
 * ProcedureResult is the top-level container shown in the "result" phase of
 * the app. It composes:
 *   - the rendered/raw-JSON view toggle
 *   - the ProcedureViewer (rendered) or JsonView (raw) panel
 *   - the Download JSON and "Process another" action row
 *
 * Splitting this out of page.tsx keeps the top-level component focused on
 * state-machine wiring and keeps the result composition reusable.
 *
 * @param props.procedure - The structured procedure to display.
 * @param props.onReset   - Callback to reset the state machine to idle.
 */

import { useState } from "react";
import type { StructuredProcedure } from "@/lib/types/procedure";
import ProcedureViewer from "@/components/procedure/ProcedureViewer";
import JsonView from "@/components/procedure/JsonView";
import ViewModeToggle, {
  type ProcedureViewMode,
} from "@/components/procedure/ViewModeToggle";
import ExportButton from "@/components/ExportButton";

interface ProcedureResultProps {
  procedure: StructuredProcedure;
  onReset: () => void;
}

export default function ProcedureResult({
  procedure,
  onReset,
}: ProcedureResultProps) {
  const [mode, setMode] = useState<ProcedureViewMode>("rendered");

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ViewModeToggle mode={mode} onChange={setMode} />
        <div className="flex items-center gap-2">
          <ExportButton procedure={procedure} />
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
          >
            Process another
          </button>
        </div>
      </div>

      {mode === "rendered" ? (
        <ProcedureViewer procedure={procedure} />
      ) : (
        <JsonView procedure={procedure} />
      )}
    </div>
  );
}
