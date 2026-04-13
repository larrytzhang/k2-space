"use client";

/**
 * ProcessButton triggers the procedure structuring workflow.
 *
 * @param props.onClick - Callback invoked when the button is clicked.
 * @param props.disabled - When true, the button is non-interactive.
 * @param props.loading - When true, shows a loading spinner instead of the icon.
 */

import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";

interface ProcessButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function ProcessButton({
  onClick,
  disabled,
  loading,
}: ProcessButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : (
        <ArrowUpTrayIcon className="h-5 w-5" />
      )}
      Structure Procedure
    </button>
  );
}
