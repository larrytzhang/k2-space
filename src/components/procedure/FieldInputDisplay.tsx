/**
 * FieldInputDisplay renders a read-only mock input field for procedure data entry placeholders.
 * Supports text, number (with optional unit), and checkbox input types.
 *
 * @param props.label - The field label.
 * @param props.inputType - The kind of input: "text", "number", or "checkbox".
 * @param props.unit - Optional unit suffix for number fields (e.g., "psi", "mm").
 */

interface FieldInputDisplayProps {
  label: string;
  inputType: "text" | "number" | "checkbox";
  unit?: string;
}

export default function FieldInputDisplay({
  label,
  inputType,
  unit,
}: FieldInputDisplayProps) {
  return (
    <div className="flex items-center gap-4 py-1.5">
      <label className="text-sm text-ink min-w-[140px]">{label}</label>
      {inputType === "checkbox" ? (
        <div className="h-4 w-4 border border-ink-subtle bg-paper" />
      ) : (
        <div className="flex items-baseline gap-2">
          <div className="h-8 w-44 border-b border-ink-subtle bg-transparent px-2 flex items-center">
            <span className="font-mono text-sm text-ink-subtle">
              {inputType === "number" ? "0" : "—"}
            </span>
          </div>
          {unit && (
            <span className="font-mono text-xs text-ink-muted">{unit}</span>
          )}
        </div>
      )}
    </div>
  );
}
