import { NextRequest } from 'next/server';

import { ipAddress } from '@vercel/functions';
import 'server-only';
import { z } from 'zod';

import { type SessionUser, requireUser } from '@/server/auth/session';

import { HttpError, badRequest, payloadTooLarge } from './errors';
import { type RateLimit, enforceRateLimit } from './rate-limit';

const MAX_BODY_BYTES = 1_000_000;

/** 60 requests per minute per route and caller. */
const DEFAULT_RATE_LIMIT: RateLimit = { limit: 60 };

type RouteContext<P> = { params: Promise<P> };

type BaseOptions = {
  /** Identifies the route in rate-limit keys, e.g. 'dam.create'. */
  name: string;
  /** `false` disables rate limiting (health checks, cron). */
  rateLimit?: RateLimit | false;
  /** Status for a non-empty result. Empty results are always 204. */
  status?: number;
};

type Handler<P, U> = (args: { req: NextRequest; params: P; user: U }) => Promise<unknown>;

export function route<P = Record<string, never>>(
  options: BaseOptions & { auth?: true },
  handler: Handler<P, SessionUser>,
): (req: NextRequest, ctx: RouteContext<P>) => Promise<Response>;
export function route<P = Record<string, never>>(
  options: BaseOptions & { auth: false },
  handler: Handler<P, null>,
): (req: NextRequest, ctx: RouteContext<P>) => Promise<Response>;

/**
 * Wraps a route handler with a session check (opt out with `auth: false`), rate limiting,
 * error → status mapping and JSON serialisation.
 */
export function route<P>(
  {
    name,
    auth = true,
    rateLimit = DEFAULT_RATE_LIMIT,
    status = 200,
  }: BaseOptions & {
    auth?: boolean;
  },
  handler: Handler<P, SessionUser> | Handler<P, null>,
) {
  // The overloads tie `auth` to the handler's user type, so this widening is safe.
  const run = handler as Handler<P, SessionUser | null>;

  return async (req: NextRequest, ctx: RouteContext<P>): Promise<Response> => {
    try {
      const user = auth ? await requireUser() : null;

      if (rateLimit) {
        const caller = user?.id ?? clientIp(req);
        await enforceRateLimit(`${name}:${caller}`, rateLimit);
      }

      const result = await run({ req, params: await ctx.params, user });

      if (result instanceof Response) return result;
      if (result === undefined) return new Response(null, { status: 204 });
      return Response.json(result, { status });
    } catch (error) {
      return errorResponse(error);
    }
  };
}

function clientIp(req: NextRequest): string {
  return ipAddress(req) ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}

function errorResponse(error: unknown): Response {
  if (error instanceof HttpError) {
    // 404s carry no message, so ids/resources aren't echoed.
    const body =
      error.status === 404
        ? { statusCode: 404 }
        : { statusCode: error.status, message: error.message };
    return Response.json(body, { status: error.status, headers: error.headers });
  }

  if (error instanceof z.ZodError) {
    return Response.json(
      { statusCode: 400, message: error.issues.map(formatIssue) },
      { status: 400 },
    );
  }

  console.error(error);
  return Response.json({ statusCode: 500, message: 'Internal Server Error' }, { status: 500 });
}

function formatIssue(issue: z.core.$ZodIssue): string {
  return issue.path.length ? `${issue.path.join('.')}: ${issue.message}` : issue.message;
}

/** Reads and validates a JSON body (max 1 MB). Unknown keys are stripped by the schema. */
export async function readJson<T extends z.ZodType>(
  req: NextRequest,
  schema: T,
): Promise<z.infer<T>> {
  return schema.parse(await readRawJson(req));
}

/** Reads a JSON body (max 1 MB) without validating it. */
export async function readRawJson(req: NextRequest): Promise<unknown> {
  if (Number(req.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) throw payloadTooLarge();

  const text = await req.text();
  if (text.length > MAX_BODY_BYTES) throw payloadTooLarge();

  try {
    return JSON.parse(text);
  } catch {
    throw badRequest('Invalid JSON body');
  }
}

export function readQuery<T extends z.ZodType>(req: NextRequest, schema: T): z.infer<T> {
  return schema.parse(Object.fromEntries(req.nextUrl.searchParams));
}
