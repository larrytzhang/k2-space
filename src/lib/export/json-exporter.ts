/**
 * JSON export utility for structured procedures.
 *
 * Serialises a StructuredProcedure into a formatted JSON string
 * suitable for file download by the client.
 */

import type { StructuredProcedure } from "@/lib/types/procedure";

/**
 * Export a structured procedure as a pretty-printed JSON string.
 *
 * The output uses 2-space indentation for human readability and
 * is ready to be served as a downloadable file with the
 * `application/json` content type.
 *
 * @param procedure - The fully structured procedure to export.
 * @returns A formatted JSON string representation of the procedure.
 */
export function exportAsJson(procedure: StructuredProcedure): string {
  return JSON.stringify(procedure, null, 2);
}
