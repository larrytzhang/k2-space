/**
 * PassFailCriteria renders a pass/fail acceptance criterion.
 * Green hue preserved for semantics, softened for the cream canvas.
 *
 * @param props.criteria - The acceptance criteria text.
 */

interface PassFailCriteriaProps {
  criteria: string;
}

export default function PassFailCriteria({ criteria }: PassFailCriteriaProps) {
  return (
    <div className="border-l-2 border-emerald-600 bg-emerald-50/60 px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-700">
        Pass / fail
      </p>
      <p className="mt-1 text-sm text-emerald-900 leading-relaxed">{criteria}</p>
    </div>
  );
}
