/**
 * WarningBanner renders a high-severity warning callout for personnel safety hazards.
 * Uses a red accent to indicate danger.
 *
 * @param props.text - The warning message text.
 */

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface WarningBannerProps {
  text: string;
}

export default function WarningBanner({ text }: WarningBannerProps) {
  return (
    <div className="flex items-start gap-3 rounded-r-lg bg-red-50 border-l-4 border-red-500 p-4">
      <ExclamationTriangleIcon className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
      <p className="text-sm text-red-800">
        <span className="font-bold">WARNING</span> &mdash; {text}
      </p>
    </div>
  );
}
