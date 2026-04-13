/**
 * Centralised runtime configuration.
 *
 * All tuneable values are read from environment variables with
 * sensible defaults. Modules import `getConfig()` instead of
 * reading `process.env` directly so that configuration is
 * validated in one place and easy to stub in tests.
 */

/** Shape of the application configuration object. */
export interface AppConfig {
  /** Maximum allowed upload size in bytes (default: 10 MB). */
  maxFileSizeBytes: number;

  /** Anthropic API key for the AI structuring engine. */
  anthropicApiKey: string;
}

/** Default maximum file size: 10 MB. */
const DEFAULT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * Return the current application configuration.
 *
 * Values are read from environment variables on every call so that
 * test suites can override `process.env` without caching issues.
 *
 * @returns The resolved AppConfig.
 */
export function getConfig(): AppConfig {
  const maxFileSizeBytes = process.env.MAX_FILE_SIZE_BYTES
    ? Number(process.env.MAX_FILE_SIZE_BYTES)
    : DEFAULT_MAX_FILE_SIZE_BYTES;

  const anthropicApiKey = process.env.ANTHROPIC_API_KEY ?? "";

  return {
    maxFileSizeBytes,
    anthropicApiKey,
  };
}
