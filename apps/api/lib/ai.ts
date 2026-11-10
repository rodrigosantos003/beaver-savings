import { GoogleGenAI } from '@google/genai';

let client: GoogleGenAI | undefined;

/**
 * Created on first use, not at import time: `.env` is loaded by ConfigModule.forRoot()
 * during AppModule.register(), which runs after every module has been imported.
 */
function getClient(): GoogleGenAI {
  if (client) return client;

  const apiKey = process.env.AI_KEY;
  if (!apiKey) {
    throw new Error('AI_KEY is not set');
  }

  const model = process.env.AI_MODEL;
  if (!model) {
    throw new Error('AI_MODEL is not set');
  }

  client = new GoogleGenAI({ apiKey, httpOptions: { timeout: 25_000 } });
  return client;
}

/**
 * The SDK raises different classes per surface (`ApiError` for models, an unexported
 * `APIError`/`BadRequestError` hierarchy for interactions), so match on shape instead.
 */
export function isAiApiError(error: unknown): error is Error & { status: number } {
  return error instanceof Error && typeof (error as { status?: unknown }).status === 'number';
}

/** Pulls Google's human-readable message out of the raw error body, if there is one. */
function upstreamMessage(error: Error): string {
  const body = (error as { body?: unknown }).body;
  if (typeof body === 'string') {
    try {
      const parsed: unknown = JSON.parse(body);
      const first = (Array.isArray(parsed) ? parsed[0] : parsed) as
        { error?: { message?: string } } | undefined;
      if (first?.error?.message) return first.error.message;
    } catch {
      /* fall through to the SDK message */
    }
  }
  return error.message;
}

export async function generateTextResponse(input: string, systemInstruction: string) {
  try {
    const interaction = await getClient().interactions.create({
      model: process.env.AI_MODEL ?? 'gemini-flash-latest',
      input: input,
      system_instruction: systemInstruction,
    });

    return interaction.output_text;
  } catch (error) {
    if (isAiApiError(error)) {
      console.error('Gemini API error', {
        status: error.status,
        message: upstreamMessage(error),
      });
    } else {
      console.error('Non-API error (network, timeout, etc.)', error);
    }
    throw error;
  }
}
