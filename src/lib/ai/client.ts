/**
 * AI structuring engine client.
 * Sends parsed documents to the Anthropic API for structured extraction,
 * with retry logic, response cleaning, and Zod validation.
 */

import Anthropic from "@anthropic-ai/sdk";
import { StructuredProcedureSchema } from "@/lib/validation/procedure-schema";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompts";
import type { ParsedDocument, StructuringResult } from "@/lib/types/pipeline";

/** Default max_tokens for the initial API call. */
const DEFAULT_MAX_TOKENS = 16384;

/** Elevated max_tokens used when the first attempt is truncated. */
const ELEVATED_MAX_TOKENS = 32768;

/** Maximum number of retries for transient errors. */
const MAX_RETRIES = 2;

/** Base delay in milliseconds for exponential backoff. */
const BASE_DELAY_MS = 1000;

/** Singleton Anthropic client instance. */
let _client: Anthropic | null = null;

/**
 * Get or create the singleton Anthropic client.
 * Uses the ANTHROPIC_API_KEY environment variable by default.
 *
 * @returns The Anthropic client instance.
 */
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic();
  return _client;
}

/**
 * Determine whether an error represents a retryable HTTP status.
 * Retryable statuses: 429 (rate limit) and 5xx (server errors).
 *
 * @param error - The caught error object.
 * @returns True if the request should be retried.
 */
function isRetryableError(error: unknown): boolean {
  if (error && typeof error === "object" && "status" in error) {
    const status = (error as { status: number }).status;
    return status === 429 || status >= 500;
  }
  return false;
}

/**
 * Determine whether an error is an authentication failure (401).
 *
 * @param error - The caught error object.
 * @returns True if the error is an auth failure.
 */
function isAuthError(error: unknown): boolean {
  if (error && typeof error === "object" && "status" in error) {
    return (error as { status: number }).status === 401;
  }
  return false;
}

/**
 * Sleep for a given number of milliseconds.
 *
 * @param ms - Duration to sleep.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Call the Anthropic messages API with exponential-backoff retry logic.
 * Retries on 429 and 5xx errors. Does NOT retry on 401.
 *
 * @param client - The Anthropic client to use.
 * @param userPrompt - The formatted user prompt.
 * @param maxTokens - Maximum tokens for the response.
 * @param maxRetries - Maximum number of retry attempts.
 * @returns The Anthropic Message response.
 * @throws On non-retryable errors or after exhausting retries.
 */
async function callWithRetry(
  client: Anthropic,
  userPrompt: string,
  maxTokens: number,
  maxRetries: number
): Promise<Anthropic.Message> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: maxTokens,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      });
      return response;
    } catch (error: unknown) {
      lastError = error;

      // Auth failures should not be retried.
      if (isAuthError(error)) {
        throw error;
      }

      // Only retry on transient errors.
      if (!isRetryableError(error)) {
        throw error;
      }

      // Don't sleep after the last attempt.
      if (attempt < maxRetries) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt);
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

/**
 * Strip markdown code fences from a string if present.
 * Handles ```json ... ``` and ``` ... ``` patterns.
 *
 * @param text - The raw text that may contain code fences.
 * @returns The text with code fences removed.
 */
function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  // Match ```json\n...\n``` or ```\n...\n```
  const fencePattern = /^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/;
  const match = trimmed.match(fencePattern);
  return match ? match[1].trim() : trimmed;
}

/**
 * Send a parsed document to Claude for structuring.
 * Handles the full lifecycle: prompt building, API call with retries,
 * response parsing, and Zod validation.
 *
 * This function NEVER throws. It always returns a StructuringResult
 * indicating success or failure.
 *
 * @param parsed - The parsed document from the document parser.
 * @param client - Optional Anthropic client override (for testing).
 * @returns A StructuringResult with either the validated procedure or an error.
 */
export async function structureDocument(
  parsed: ParsedDocument,
  client?: Anthropic
): Promise<StructuringResult> {
  try {
    // Guard: reject empty documents.
    if (!parsed.rawText.trim()) {
      return { success: false, error: "Document has no text content" };
    }

    const anthropic = client ?? getClient();
    const userPrompt = buildUserPrompt(parsed);

    // First attempt with default token limit.
    let response = await callWithRetry(
      anthropic,
      userPrompt,
      DEFAULT_MAX_TOKENS,
      MAX_RETRIES
    );

    // If truncated, retry once with a higher token limit.
    if (response.stop_reason === "max_tokens") {
      response = await callWithRetry(
        anthropic,
        userPrompt,
        ELEVATED_MAX_TOKENS,
        0 // No additional retries for the elevated attempt.
      );
    }

    // Extract text from the response.
    const firstBlock = response.content[0];
    if (!firstBlock || firstBlock.type !== "text" || !firstBlock.text) {
      return { success: false, error: "AI response contained no text content" };
    }

    const rawJson = stripCodeFences(firstBlock.text);

    // Parse as JSON.
    let parsed_json: unknown;
    try {
      parsed_json = JSON.parse(rawJson);
    } catch {
      return {
        success: false,
        error: `Failed to parse AI response as JSON: ${rawJson.slice(0, 200)}`,
      };
    }

    // Validate against the procedure schema.
    const validated = StructuredProcedureSchema.safeParse(parsed_json);
    if (!validated.success) {
      return {
        success: false,
        error: `AI response failed schema validation: ${validated.error.message}`,
      };
    }

    return { success: true, procedure: validated.data };
  } catch (error: unknown) {
    // Auth errors get a specific message.
    if (isAuthError(error)) {
      return {
        success: false,
        error: "Authentication failed: invalid or missing API key",
      };
    }

    // All other errors.
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return { success: false, error: `AI structuring failed: ${message}` };
  }
}
