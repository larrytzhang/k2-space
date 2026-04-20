"use client";

/**
 * JsonView renders a structured procedure as a syntax-colored JSON block with
 * a single "Copy" button in the header. It is the "raw" counterpart to the
 * rendered ProcedureViewer and is intended for reviewers who want to inspect
 * the exact machine-readable output.
 *
 * @param props.procedure - The structured procedure to stringify and display.
 */

import { useCallback, useState } from "react";
import {
  ClipboardDocumentIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import type { StructuredProcedure } from "@/lib/types/procedure";

interface JsonViewProps {
  procedure: StructuredProcedure;
}

export default function JsonView({ procedure }: JsonViewProps) {
  const [copied, setCopied] = useState(false);

  /** Pretty-printed JSON representation of the procedure. */
  const json = JSON.stringify(procedure, null, 2);

  /**
   * Copy the full JSON to the clipboard. Falls back silently if the
   * Clipboard API is unavailable (e.g. insecure context).
   */
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable; leave state unchanged.
    }
  }, [json]);

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-950 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          Raw JSON · {(json.length / 1024).toFixed(1)} KB
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-colors"
          aria-live="polite"
        >
          {copied ? (
            <>
              <CheckIcon className="h-3.5 w-3.5" />
              Copied
            </>
          ) : (
            <>
              <ClipboardDocumentIcon className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="p-4 text-xs text-slate-100 overflow-x-auto leading-relaxed font-mono max-h-[70vh] overflow-y-auto">
        {json}
      </pre>
    </div>
  );
}
