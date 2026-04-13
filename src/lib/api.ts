/**
 * Client-side API helpers for communicating with the backend.
 */

/**
 * Uploads a procedure document file to the server and returns the job ID.
 * @param file - The file to upload.
 * @returns The job ID string assigned by the server.
 * @throws Error if the upload request fails.
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

/**
 * Downloads the exported JSON file for a completed procedure job.
 * @param jobId - The job ID to export.
 * @returns A Blob containing the exported JSON.
 * @throws Error if the export request fails.
 */
export async function exportProcedure(jobId: string): Promise<Blob> {
  const response = await fetch(`/api/export/${jobId}`);

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ||
        `Export failed with status ${response.status}`
    );
  }

  return response.blob();
}
