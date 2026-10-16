import { next } from '@vercel/functions';

const ALLOWED_ORIGINS = new Set([`${process.env.WEB_ORIGIN}`]);
const MAX_BODY_BYTES = 1_000_000;

const json = (status: number, body: object, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });

export default function middleware(request: Request) {
  if (!['GET', 'POST', 'DELETE', 'OPTIONS'].includes(request.method)) {
    return json(405, { statusCode: 405 });
  }

  const origin = request.headers.get('origin') ?? '';
  if (request.method === 'OPTIONS' && ALLOWED_ORIGINS.has(origin)) {
    return new Response(null, {
      status: 204,
      headers: {
        'access-control-allow-origin': origin,
        'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE',
        'access-control-allow-headers': 'content-type,authorization',
        'access-control-max-age': '86400',
        vary: 'origin',
      },
    });
  }

  const length = Number(request.headers.get('content-length') ?? 0);
  if (length > MAX_BODY_BYTES) {
    return json(413, { statusCode: 413 });
  }

  return next();
}
