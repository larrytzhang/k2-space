/**
 * Text cleaning utility for normalizing raw document text.
 * Applied as a post-processing step after format-specific parsing.
 */

/**
 * Cleans raw extracted text through five sequential stages:
 *   1. Normalize non-breaking spaces (U+00A0) to regular spaces
 *   2. Normalize line endings (\r\n and \r) to \n
 *   3. Collapse runs of 3+ blank lines down to 2
 *   4. Trim trailing whitespace from each line
 *   5. Trim leading/trailing whitespace from the entire document
 *
 * @param text - The raw text to clean.
 * @returns The cleaned text.
 */
export function cleanText(text: string): string {
  // Stage 1: Normalize non-breaking spaces to regular spaces
  let result = text.replace(/\u00A0/g, " ");

  // Stage 2: Normalize line endings to \n
  result = result.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Stage 3: Collapse 3+ consecutive blank lines to 2 (one empty line)
  result = result.replace(/\n{3,}/g, "\n\n");

  // Stage 4: Trim trailing whitespace from each line
  result = result
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n");

  // Stage 5: Trim leading/trailing whitespace from the entire document
  result = result.trim();

  return result;
}
