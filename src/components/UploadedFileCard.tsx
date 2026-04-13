"use client";

/**
 * UploadedFileCard displays the selected file's name, size, and a remove button.
 *
 * @param props.file - The uploaded File object.
 * @param props.onRemove - Callback invoked when the user clicks the remove button.
 */

import { DocumentTextIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { formatFileSize } from "@/hooks/useFileUpload";

interface UploadedFileCardProps {
  file: File;
  onRemove: () => void;
}

export default function UploadedFileCard({
  file,
  onRemove,
}: UploadedFileCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <DocumentTextIcon className="h-8 w-8 text-indigo-500 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">
          {file.name}
        </p>
        <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        aria-label="Remove file"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
