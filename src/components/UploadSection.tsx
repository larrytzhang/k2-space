"use client";

/**
 * UploadSection orchestrates the file selection flow.
 * Shows a drop zone when no file is selected, or the file card + process button when a file is ready.
 *
 * @param props.file - The currently selected file, or null.
 * @param props.onFileSelected - Callback when a file is chosen.
 * @param props.onFileRemoved - Callback when the file is removed.
 * @param props.onProcess - Callback when the user clicks "Structure Procedure".
 * @param props.loading - Whether processing is currently in progress.
 */

import FileDropZone from "@/components/FileDropZone";
import UploadedFileCard from "@/components/UploadedFileCard";
import ProcessButton from "@/components/ProcessButton";

interface UploadSectionProps {
  file: File | null;
  onFileSelected: (file: File) => void;
  onFileRemoved: () => void;
  onProcess: () => void;
  loading: boolean;
}

export default function UploadSection({
  file,
  onFileSelected,
  onFileRemoved,
  onProcess,
  loading,
}: UploadSectionProps) {
  if (!file) {
    return <FileDropZone onFileSelected={onFileSelected} disabled={loading} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <UploadedFileCard file={file} onRemove={onFileRemoved} />
      <div className="flex justify-center">
        <ProcessButton
          onClick={onProcess}
          disabled={!file}
          loading={loading}
        />
      </div>
    </div>
  );
}
