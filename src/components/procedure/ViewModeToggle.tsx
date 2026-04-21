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
      className="inline-flex items-center gap-6 font-mono text-[11px] uppercase tracking-[0.18em]"
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
            className={`relative pb-1.5 transition-colors focus:outline-none ${
              active ? "text-ink" : "text-ink-subtle hover:text-ink-muted"
            }`}
          >
            {opt.label}
            {active && (
              <span
                aria-hidden="true"
                className="absolute left-0 right-0 -bottom-px h-px bg-clay"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
