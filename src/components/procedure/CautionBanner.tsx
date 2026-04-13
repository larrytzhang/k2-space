/**
 * CautionBanner renders a medium-severity caution callout for equipment risks.
 * Uses an amber accent to indicate caution.
 *
 * @param props.text - The caution message text.
 */

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface CautionBannerProps {
  text: string;
}

export default function CautionBanner({ text }: CautionBannerProps) {
  return (
    <div className="flex items-start gap-3 rounded-r-lg bg-amber-50 border-l-4 border-amber-500 p-4">
      <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
      <p className="text-sm text-amber-800">
        <span className="font-bold">CAUTION</span> &mdash; {text}
      </p>
    </div>
  );
}
