/**
 * SignOffLine renders a signature/approval line for a specific role.
 * Shows the role name followed by a dashed line to represent a signature space.
 *
 * @param props.role - The role abbreviation or name (e.g., "TC", "QA").
 * @param props.label - A label describing the sign-off purpose.
 */

interface SignOffLineProps {
  role: string;
  label: string;
}

export default function SignOffLine({ role, label }: SignOffLineProps) {
  return (
    <div className="flex items-end gap-4 py-2">
      <div className="shrink-0">
        <p className="text-xs text-slate-500 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm font-semibold text-slate-700">{role}</p>
      </div>
      <div className="flex-1 border-b-2 border-dashed border-slate-300 mb-0.5" />
      <p className="text-xs text-slate-400 shrink-0">Date: ___/___/___</p>
    </div>
  );
}
