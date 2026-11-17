import 'server-only';

type RetryOptions = {
  /** Total tries, including the first one. */
  attempts: number;
  /** Per-attempt timeout; the attempt's signal is aborted when it elapses. */
  timeoutMs: number;
  /** Delay before the second try; doubles on each further try. */
  backoffMs?: number;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Runs `fn` with a timeout, retrying on any error until `attempts` is used up. */
export async function withRetry<T>(
  fn: (signal: AbortSignal, attempt: number) => Promise<T>,
  { attempts, timeoutMs, backoffMs = 250 }: RetryOptions,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn(AbortSignal.timeout(timeoutMs), attempt);
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(backoffMs * 2 ** (attempt - 1));
    }
  }

  throw lastError;
}
