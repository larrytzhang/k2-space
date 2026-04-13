"use client";

/**
 * ExportButton downloads the structured procedure as a JSON file.
 * Creates a temporary blob URL and triggers a download via a hidden anchor element.
 *
 * @param props.jobId - The job ID used to fetch the export.
 */

import { useCallback, useState } from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { exportProcedure } from "@/lib/api";

interface ExportButtonProps {
  jobId: string;
}

export default function ExportButton({ jobId }: ExportButtonProps) {
  const [downloading, setDownloading] = useState(false);

  /** Fetch the export blob and trigger a browser download. */
  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const blob = await exportProcedure(jobId);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `procedure-${jobId}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch {
      // Silently fail — the user can retry.
    } finally {
      setDownloading(false);
    }
  }, [jobId]);

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={downloading}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {downloading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
      ) : (
        <ArrowDownTrayIcon className="h-4 w-4" />
      )}
      Download JSON
    </button>
  );
}
