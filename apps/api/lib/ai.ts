/**
 * Scaleway Generative APIs client (OpenAI-compatible chat completions, hosted in Paris).
 * Uses the built-in fetch, so no SDK is needed.
 */

const DEFAULT_BASE_URL = 'https://api.scaleway.ai/v1';
const DEFAULT_MODEL = 'mistral-small-3.2-24b-instruct-2506';
const TIMEOUT_MS = 25_000;
const MAX_TOKENS = 600;

type AiConfig = { apiKey: string; baseUrl: string; model: string };

/**
 * Read on each call, not at import time: `.env` is loaded by ConfigModule.forRoot()
 * during AppModule.register(), which runs after every module has been imported.
 */
function getConfig(): AiConfig {
  const apiKey = process.env.AI_KEY;
  if (!apiKey) {
    throw new Error('AI_KEY is not set');
  }

  return {
    apiKey,
    // A project-scoped URL (https://api.scaleway.ai/<project_id>/v1) is needed for any
    // Scaleway project other than the default one.
    baseUrl: (process.env.AI_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, ''),
    model: process.env.AI_MODEL || DEFAULT_MODEL,
  };
}

/** Raised when the provider answers with a non-2xx status. */
export class AiApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'AiApiError';
    this.status = status;
  }
}

export function isAiApiError(error: unknown): error is AiApiError {
  return error instanceof AiApiError;
}

/** Pulls the provider's human-readable message out of an error body, if there is one. */
function upstreamMessage(body: string, fallback: string): string {
  try {
    const parsed = JSON.parse(body) as { error?: { message?: string }; message?: string };
    return parsed.error?.message ?? parsed.message ?? fallback;
  } catch {
    return body.trim() || fallback;
  }
}

type ChatCompletion = {
  model?: string;
  choices?: {
    finish_reason?: string | null;
    message?: { content?: string | null; reasoning?: string | null };
  }[];
};

export async function generateTextResponse(input: string, systemInstruction: string) {
  try {
    const { apiKey, baseUrl, model } = getConfig();

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: input },
        ],
        max_tokens: MAX_TOKENS,
      }),
      // Surfaces as a TimeoutError, which CoachService maps to a 504.
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new AiApiError(response.status, upstreamMessage(body, response.statusText));
    }

    const completion = (await response.json()) as ChatCompletion;
    const choice = completion.choices?.[0];
    const content = choice?.message?.content;
    if (!content?.trim()) {
      // Reasoning models can spend the whole token budget "thinking" and return no content.
      console.error('AI returned no content', {
        model: completion.model,
        finishReason: choice?.finish_reason,
        hasReasoning: Boolean(choice?.message?.reasoning),
      });
    }
    return content ?? undefined;
  } catch (error) {
    if (isAiApiError(error)) {
      console.error('AI API error', { status: error.status, message: error.message });
    } else {
      console.error('Non-API error (network, timeout, etc.)', error);
    }
    throw error;
  }
}
