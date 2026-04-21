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
    <div className="py-10 space-y-10 animate-[fadeIn_0.4s_ease-out]">
      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-hairline pb-6">
        <ViewModeToggle mode={mode} onChange={setMode} />
        <div className="flex items-center gap-3">
          <ExportButton procedure={procedure} />
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-sm border border-hairline-strong bg-paper px-5 py-2.5 text-sm text-ink hover:border-ink hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay transition-colors"
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
