/**
 * GET /api/export/[jobId]
 *
 * Returns the structured procedure for a completed job as a
 * downloadable JSON file. Returns 404 if the job does not exist,
 * or 409 if the job has not yet completed successfully.
 */

import { NextResponse } from "next/server";
import { getJobStore } from "@/lib/pipeline/job-store";
import { exportAsJson } from "@/lib/export/json-exporter";

/**
 * Handle JSON export download for a completed job.
 *
 * Next.js 15+ wraps route params in a Promise — they must be awaited.
 *
 * @param _request - The incoming HTTP request (unused).
 * @param context - Route context containing the jobId parameter.
 * @returns A JSON file download response, or an error.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ jobId: string }> }
): Promise<NextResponse> {
  const { jobId } = await context.params;
  const store = getJobStore();

  const job = store.get(jobId);
  if (!job) {
    return NextResponse.json(
      { error: "Job not found" },
      { status: 404 }
    );
  }

  if (job.status !== "completed" || !job.result) {
    return NextResponse.json(
      { error: "Job has not completed successfully", status: job.status },
      { status: 409 }
    );
  }

  const jsonContent = exportAsJson(job.result);

  // Derive a filename from the original upload, replacing the extension.
  const baseName = job.filename.replace(/\.[^.]+$/, "");
  const downloadName = `${baseName}-procedure.json`;

  return new NextResponse(jsonContent, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${downloadName}"`,
    },
  });
}
