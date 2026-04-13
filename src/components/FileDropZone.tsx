"use client";

/**
 * FileDropZone provides a drag-and-drop area for uploading procedure documents.
 * Also supports clicking to browse for files via a hidden input.
 *
 * @param props.onFileSelected - Callback invoked with the selected File.
 * @param props.disabled - When true, the drop zone is visually and functionally disabled.
 */

import { useCallback, useRef, useState } from "react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { ACCEPTED_EXTENSIONS } from "@/lib/constants";

interface FileDropZoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export default function FileDropZone({
  onFileSelected,
  disabled,
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /** Handle files dropped onto the zone. */
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        onFileSelected(file);
      }
    },
    [disabled, onFileSelected]
  );

  /** Handle files selected via the hidden input. */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelected(file);
      }
      // Reset the input so re-selecting the same file triggers onChange.
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [onFileSelected]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`
        relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 transition-colors cursor-pointer
        ${isDragging ? "border-indigo-500 bg-indigo-50" : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
      role="button"
      tabIndex={0}
      aria-label="Upload procedure document"
    >
      <DocumentTextIcon className="h-10 w-10 text-slate-400" />
      <p className="text-slate-700 font-medium">
        Drop your procedure document here, or{" "}
        <span className="text-indigo-600 underline">click to browse</span>
      </p>
      <p className="text-sm text-slate-500">
        PDF, Word (.docx), or plain text up to 10MB
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS.join(",")}
        onChange={handleChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
}
