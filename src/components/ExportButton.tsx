"use client";

/**
 * ExportButton downloads the current structured procedure as a JSON file
 * directly from the in-memory state. This is a pure client-side operation —
 * no backend round-trip is required, so the same button works for both
 * real uploads and pre-computed samples.
 *
 * @param props.procedure - The structured procedure to export.
 */

import { useCallback, useState } from "react";
import type { StructuredProcedure } from "@/lib/types/procedure";

interface ExportButtonProps {
  procedure: StructuredProcedure;
}

/**
 * Derive a safe, descriptive filename from the procedure title or fall back
 * to the procedure id. Strips characters that are unsafe in filenames on
 * Windows and macOS.
 */
function filenameFor(procedure: StructuredProcedure): string {
  const base =
    procedure.title
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60) || procedure.id;
  return `${base}.json`;
}

export default function ExportButton({ procedure }: ExportButtonProps) {
  const [justSaved, setJustSaved] = useState(false);

  const handleDownload = useCallback(() => {
    const json = JSON.stringify(procedure, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filenameFor(procedure);
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1500);
  }, [procedure]);

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="inline-flex items-center gap-2 rounded-sm bg-ink px-5 py-2.5 text-sm text-paper hover:bg-clay-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay transition-colors"
      aria-live="polite"
    >
      {justSaved ? "Downloaded" : "Download JSON"}
      <span aria-hidden="true" className="text-paper/60">
        ↓
      </span>
    </button>
  );
}
