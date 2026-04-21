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
    <div className="flex items-end gap-5 py-2">
      <div className="shrink-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-subtle">
          {label}
        </p>
        <p className="font-mono text-sm text-ink mt-0.5">{role}</p>
      </div>
      <div className="flex-1 border-b border-dashed border-hairline-strong mb-1" />
      <p className="font-mono text-xs text-ink-subtle shrink-0">
        Date ___/___/___
      </p>
    </div>
  );
}
