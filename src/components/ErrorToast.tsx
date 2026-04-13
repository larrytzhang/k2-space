"use client";

/**
 * ErrorToast displays a dismissible error notification in the top-right corner.
 * Auto-dismisses after 8 seconds.
 *
 * @param props.message - The error message to display.
 * @param props.onDismiss - Callback invoked when the toast is dismissed.
 */

import { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ErrorToastProps {
  message: string;
  onDismiss: () => void;
}

export default function ErrorToast({ message, onDismiss }: ErrorToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 8000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 shadow-lg">
        <div className="flex-1">
          <p className="text-sm font-medium text-rose-800">Error</p>
          <p className="mt-1 text-sm text-rose-700">{message}</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-full p-1 text-rose-400 hover:bg-rose-100 hover:text-rose-600 transition-colors"
          aria-label="Dismiss error"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
