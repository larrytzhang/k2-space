"use client";

/**
 * ViewModeToggle is a segmented control that switches the procedure result
 * between "rendered" (human-readable) and "json" (raw schema output) views.
 *
 * @param props.mode - The currently active view mode.
 * @param props.onChange - Callback invoked with the newly selected mode.
 */

export type ProcedureViewMode = "rendered" | "json";

interface ViewModeToggleProps {
  mode: ProcedureViewMode;
  onChange: (mode: ProcedureViewMode) => void;
}

/** The two view options rendered by the segmented control. */
const OPTIONS: readonly { value: ProcedureViewMode; label: string }[] = [
  { value: "rendered", label: "Rendered" },
  { value: "json", label: "Raw JSON" },
] as const;

export default function ViewModeToggle({
  mode,
  onChange,
}: ViewModeToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="Procedure view mode"
      className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1 shadow-sm"
    >
      {OPTIONS.map((opt) => {
        const active = mode === opt.value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              active
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
