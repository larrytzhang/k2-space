/**
 * PassFailCriteria renders a pass/fail acceptance criterion with a green accent.
 *
 * @param props.criteria - The acceptance criteria text.
 */

import { CheckBadgeIcon } from "@heroicons/react/24/outline";

interface PassFailCriteriaProps {
  criteria: string;
}

export default function PassFailCriteria({ criteria }: PassFailCriteriaProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-green-50 border border-green-200 p-3">
      <CheckBadgeIcon className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
      <p className="text-sm text-green-800">{criteria}</p>
    </div>
  );
}
