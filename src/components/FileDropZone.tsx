"use client";

/**
 * FileDropZone provides a drag-and-drop area for uploading procedure documents.
 * Also supports clicking to browse for files via a hidden input. Styled as a
 * quiet, thin-dashed surface on the cream canvas — intentionally understated
 * so it recedes next to the sample list above it.
 *
 * @param props.onFileSelected - Callback invoked with the selected File.
 * @param props.disabled - When true, the drop zone is visually and functionally disabled.
 */

import { useCallback, useRef, useState } from "react";
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
        relative flex flex-col items-center justify-center gap-3 rounded-sm border border-dashed px-6 py-14 transition-colors cursor-pointer
        ${
          isDragging
            ? "border-clay bg-clay-soft/60"
            : "border-hairline-strong bg-paper/50 hover:border-ink-subtle hover:bg-paper"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
      role="button"
      tabIndex={0}
      aria-label="Upload procedure document"
    >
      <p className="text-[15px] text-ink">
        Drop a procedure document, or{" "}
        <span className="text-clay-ink underline underline-offset-4 decoration-clay/40">
          click to browse
        </span>
      </p>
      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-subtle">
        PDF · DOCX · TXT — up to 10 MB
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
