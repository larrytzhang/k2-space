/**
 * Translates raw error strings bubbled up from the upload, pipeline, or SSE
 * layers into short, user-friendly messages that a non-technical reviewer
 * can act on.
 *
 * The matcher is intentionally loose — backend error codes, zod messages,
 * and network error wording all vary — so the translator errs on the side
 * of keyword matching. Unknown errors fall through to the original string.
 */

/** Condition → friendly message pairs, evaluated in order. */
const RULES: readonly { match: (raw: string) => boolean; message: string }[] = [
  {
    match: (r) => /empty|zero[- ]?byte/i.test(r),
    message:
      "That file looks empty. Try re-exporting it or pick one of the samples above.",
  },
  {
    match: (r) => /too large|FILE_TOO_LARGE/i.test(r),
    message:
      "File is larger than the 10 MB limit. Trim it down, or try a sample.",
  },
  {
    match: (r) => /UNSUPPORTED_FILE_TYPE|unsupported file type/i.test(r),
    message:
      "That file type isn't supported. Please upload a PDF, DOCX, or TXT file.",
  },
  {
    match: (r) => /no text content|empty document|could not extract text/i.test(r),
    message:
      "No readable text was found in that document. Scanned PDFs (images of text) aren't supported yet — use a sample or a PDF with selectable text.",
  },
  {
    match: (r) => /timed? out|timeout/i.test(r),
    message:
      "The request is taking longer than expected. Please try again, or click a sample for an instant result.",
  },
  {
    match: (r) => /authentication|invalid.*api key/i.test(r),
    message:
      "The AI service rejected the request. This is a server-side configuration issue — the samples will still work.",
  },
  {
    match: (r) => /rate limit|429|too many requests/i.test(r),
    message:
      "Too many requests right now. Try again in a minute, or click a sample.",
  },
  {
    match: (r) => /lost connection|Network/i.test(r),
    message:
      "Lost the connection to the server. Check your network and try again.",
  },
  {
    match: (r) => /schema validation|failed to parse/i.test(r),
    message:
      "The AI returned an unexpected shape. This is rare — please retry, or try a sample to see a known-good output.",
  },
];

/**
 * Convert a raw error string to a friendly one. If nothing matches, returns
 * the input unchanged so technical errors still surface (rather than being
 * silently swallowed).
 *
 * @param raw - The error message from the backend, SDK, or network layer.
 * @returns A short, action-oriented message for end users.
 */
export function friendlyError(raw: string): string {
  if (!raw) return "Something went wrong. Please try again.";
  for (const rule of RULES) {
    if (rule.match(raw)) return rule.message;
  }
  return raw;
}
