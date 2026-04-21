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
    <div className="fixed top-5 right-5 z-50 max-w-sm animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-start gap-3 border border-hairline-strong bg-paper px-5 py-4 shadow-sm">
        <div className="flex-1">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-clay-ink">
            Error
          </p>
          <p className="mt-1.5 text-sm text-ink leading-relaxed">{message}</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-full p-1 text-ink-subtle hover:bg-cream hover:text-ink transition-colors"
          aria-label="Dismiss error"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
