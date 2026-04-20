/**
 * Client-side API helpers for communicating with the backend.
 *
 * Export is performed entirely client-side (see ExportButton) so no helper is
 * needed for it — the structured procedure is already in memory by the time
 * the download button is shown.
 */

/**
 * Upload a procedure document file to the backend and return the job ID.
 * The caller should then subscribe to /api/jobs/[jobId]/stream for progress.
 *
 * @param file - The file to upload.
 * @returns The job ID string assigned by the server.
 * @throws Error if the upload request fails (the backend error message is
 *         preserved verbatim so the client translator can surface it).
 */
export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ||
        `Upload failed with status ${response.status}`
    );
  }

  const data = (await response.json()) as { jobId: string };
  return data.jobId;
}
