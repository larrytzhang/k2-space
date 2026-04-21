"use client";

/**
 * UploadedFileCard displays the selected file's name, size, and a remove
 * button. Hairline border, no shadow — sits quietly on the cream canvas.
 *
 * @param props.file - The uploaded File object.
 * @param props.onRemove - Callback invoked when the user clicks the remove button.
 */

import { XMarkIcon } from "@heroicons/react/24/outline";
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
    <div className="flex items-center gap-4 border border-hairline bg-paper px-5 py-4">
      <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-subtle shrink-0">
        File
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-medium text-ink truncate">
          {file.name}
        </p>
        <p className="font-mono text-xs text-ink-subtle mt-0.5">
          {formatFileSize(file.size)}
        </p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-1 text-ink-subtle hover:bg-cream hover:text-ink transition-colors"
        aria-label="Remove file"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
