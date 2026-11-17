import 'server-only';

/** An error that maps directly to an HTTP response (see `route()` in ./route.ts). */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message?: string,
    readonly headers?: HeadersInit,
  ) {
    super(message ?? `HTTP ${status}`);
    this.name = 'HttpError';
  }
}

export const badRequest = (message?: string) => new HttpError(400, message ?? 'Bad Request');
export const unauthorized = () => new HttpError(401, 'Unauthorized');
export const notFound = (message?: string) => new HttpError(404, message ?? 'Not Found');
export const payloadTooLarge = () => new HttpError(413, 'Payload Too Large');
export const tooManyRequests = (retryAfterSeconds: number) =>
  new HttpError(429, 'Too Many Requests', { 'Retry-After': String(retryAfterSeconds) });
export const badGateway = (message?: string) => new HttpError(502, message ?? 'Bad Gateway');
export const gatewayTimeout = (message?: string) =>
  new HttpError(504, message ?? 'Gateway Timeout');
