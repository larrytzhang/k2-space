/**
 * Mock Anthropic client for testing the AI structuring engine.
 * Returns pre-configured responses in sequence without making real API calls.
 */

/** Shape of a single mock response or error to return. */
interface MockResponse {
  /** The text content to return in the message. */
  text?: string;
  /** The stop reason (e.g., "end_turn", "max_tokens"). */
  stopReason?: string;
  /** If set, the create() call will throw this error. */
  error?: Error;
}

/**
 * Create a mock Anthropic client that returns responses in order.
 * Each call to messages.create() consumes the next response from the array.
 *
 * @param responses - Ordered list of responses the mock will return.
 * @returns A mock object with the same shape as the Anthropic client.
 */
export function createMockClient(responses: MockResponse[]): any {
  let callIndex = 0;
  return {
    messages: {
      create: async () => {
        const response = responses[callIndex++];
        if (response?.error) throw response.error;
        return {
          content: [{ type: "text", text: response?.text ?? "" }],
          stop_reason: response?.stopReason ?? "end_turn",
          usage: { input_tokens: 100, output_tokens: 200 },
        };
      },
    },
  };
}
