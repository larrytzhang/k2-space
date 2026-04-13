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
    <div className="flex items-center gap-3 py-2">
      <label className="text-sm font-medium text-slate-700 min-w-[120px]">
        {label}
      </label>
      {inputType === "checkbox" ? (
        <div className="h-5 w-5 rounded border-2 border-slate-300 bg-white" />
      ) : (
        <div className="flex items-center gap-1">
          <div className="h-9 w-40 rounded-md border border-slate-300 bg-slate-50 px-3 flex items-center">
            <span className="text-sm text-slate-400">
              {inputType === "number" ? "0" : "---"}
            </span>
          </div>
          {unit && (
            <span className="text-sm text-slate-500 ml-1">{unit}</span>
          )}
        </div>
      )}
    </div>
  );
}
