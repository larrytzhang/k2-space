"use client";

/**
 * JsonView renders a structured procedure as a pretty-printed JSON block with
 * a single "Copy" button in the header. It is the "raw" counterpart to the
 * rendered ProcedureViewer and is intended for reviewers who want to inspect
 * the exact machine-readable output.
 *
 * @param props.procedure - The structured procedure to stringify and display.
 */

import { useCallback, useState } from "react";
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
    <div className="border border-hairline bg-paper">
      <div className="flex items-center justify-between border-b border-hairline px-5 py-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-subtle">
          Raw JSON · {(json.length / 1024).toFixed(1)} KB
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-sm border border-hairline-strong bg-cream px-3 py-1 text-xs text-ink hover:border-ink hover:bg-paper focus:outline-none focus:ring-2 focus:ring-clay/40 transition-colors"
          aria-live="polite"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-5 text-xs text-ink overflow-x-auto leading-relaxed font-mono max-h-[70vh] overflow-y-auto">
        {json}
      </pre>
    </div>
  );
}
