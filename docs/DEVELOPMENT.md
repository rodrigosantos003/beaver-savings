# Beaver Savings — Development

How the [Beaver Savings](../README.md) code is organised and how to work on it.
It is a single Next.js app: the pages (calculator, savings "dam", AI coach,
accounts, legal pages) and the API they call are deployed together to Vercel as
the `beaver-savings` project, at <https://beaver-savings.vercel.app>. The UI is
available in Portuguese and English and can be installed as a PWA.

## Stack

| Concern       | Technology                                                    |
| ------------- | ------------------------------------------------------------- |
| Framework     | Next.js 16 (App Router, route handlers), React 19             |
| Styling       | Tailwind CSS 4                                                |
| i18n          | `next-intl` (`pt` by default, `en`, no locale prefix in URLs) |
| Database      | MongoDB Atlas through Mongoose                                |
| Auth          | Better Auth (Mongo adapter), mounted at `/api/auth`           |
| Validation    | Zod                                                           |
| Email         | Resend                                                        |
| AI coach      | OpenAI-compatible chat completions API (Scaleway by default)  |
| Rate limiting | Fixed window stored in MongoDB (`api_rate_limits`)            |
| PWA           | Serwist service worker (production builds only)               |
| Tests         | Vitest                                                        |

> This version of Next.js has breaking changes compared to older releases. Check
> the docs in `node_modules/next/dist/docs/` before changing framework code (see
> [AGENTS.md](../AGENTS.md)).

## Project structure

```
├── app/
│   ├── [locale]/            # Every page, with the locale resolved by next-intl
│   ├── api/                 # Route handlers (thin: validate → session → service)
│   ├── manifest.ts, robots.ts, sitemap.ts
│   └── sw.ts                # Service worker source
├── components/              # UI (calculator, auth, account)
├── i18n/                    # next-intl routing and request config
├── languages/               # pt.json and en.json message files
├── lib/                     # Browser/UI helpers: API client, auth client, hooks, SEO
├── server/                  # Server-only code (every file imports 'server-only')
│   ├── auth/                # Better Auth config, session helpers, auth emails
│   ├── db/                  # Cached Mongoose connection
│   ├── calculator/, dam/, coach/, savings/, account/, retention/, health/
│   │                        # One folder per feature: *.service.ts, *.repository.ts, *.schema.ts
│   └── lib/                 # route() wrapper, errors, rate limit, retry, email, AI client
├── shared/                  # Pure TypeScript used by both sides (calculations, currencies)
└── infrastructure/terraform/
```

### Folder rules

| Folder                | What goes in it                                        | Can import                 |
| --------------------- | ------------------------------------------------------ | -------------------------- |
| `shared/`             | Pure logic: no React, no Next, no Node APIs, no I/O    | `shared/` only             |
| `server/`             | Database, auth, email, AI, anything that needs secrets | `shared/`, `server/`       |
| `components/`, `lib/` | UI and browser code                                    | `shared/`, never `server/` |

ESLint enforces these boundaries (`eslint.config.mjs`), and
`import 'server-only'` makes the build fail if server code ever reaches a client
bundle. Pages, layouts and route handlers are where the two sides meet: they may
import from `server/`.

### Writing a route handler

Route handlers stay thin. `route()` from `server/lib/route.ts` does what Nest
used to do globally:

- requires a signed-in session (opt out with `auth: false`)
- rate limits per route and user/IP (60/min by default, configurable or `false`)
- maps `HttpError`s to their status and Zod errors to `400`
- returns `204` for empty results and JSON otherwise

```ts
export const POST = route(
  { name: 'dam.create', status: 201 },
  async ({ req, user }) =>
    dam.create(user.id, await readJson(req, createDamEntrySchema)),
);
```

Server components don't call the API over HTTP: they call the services directly
(see `server/calculator/page-data.ts`) and get the session with `getSession()`
from `server/auth/session.ts`.

## Endpoints

All routes live under `/api` and require a signed-in session unless marked
**public**. The default rate limit is 60 requests per minute per route.

| Method   | Path                                 | Description                                             |
| -------- | ------------------------------------ | ------------------------------------------------------- |
| `GET`    | `/api/health`                        | **Public.** App and database health                     |
| `*`      | `/api/auth/*`                        | Better Auth routes (sign-up, sign-in, reset, verify, …) |
| `POST`   | `/api/snapshots`                     | Save the current calculator input                       |
| `GET`    | `/api/snapshots/latest`              | Load the most recent calculator input                   |
| `GET`    | `/api/snapshots/habits`              | Spending habits derived from recent snapshots           |
| `DELETE` | `/api/snapshots`                     | Delete all of the user's snapshots                      |
| `GET`    | `/api/dam`                           | List savings dam entries                                |
| `POST`   | `/api/dam`                           | Add a savings dam entry                                 |
| `DELETE` | `/api/dam/:id`                       | Remove a savings dam entry                              |
| `GET`    | `/api/coach/insights`                | AI-generated insights (10 per minute)                   |
| `POST`   | `/api/coach/ask`                     | Ask the AI coach a question (10 per minute)             |
| `POST`   | `/api/savings/email`                 | Email the savings summary (5 per minute)                |
| `GET`    | `/api/account/export`                | Export all of the user's data (5 per minute)            |
| `GET`    | `/api/maintenance/inactive-accounts` | Cron only, needs `Authorization: Bearer $CRON_SECRET`   |

### Inactive-account retention

The Privacy Policy states that inactive accounts are deleted. The
`Beaver Savings - Inactive Accounts` GitHub Actions workflow calls
`/api/maintenance/inactive-accounts` every day to enforce it:

- After **24 months** without activity, the account and its sessions, dam
  entries and calculator snapshots are deleted.
- Verified users get a warning email **30 days** before deletion. Unverified
  accounts are deleted without a warning.
- Each run is capped at 20 warnings and 100 deletions so it fits within one
  serverless invocation.

The workflow reads the `API_URL` repository variable (set it to
`https://beaver-savings.vercel.app/api`) and the `CRON_SECRET` secret.

## Environment variables

For local development, put these in `.env` at the repository root. On Vercel
they come from the project settings.

| Variable             | Required | Description                                                         |
| -------------------- | -------- | ------------------------------------------------------------------- |
| `MONGODB_URI`        | Yes      | MongoDB connection string                                           |
| `DB_NAME`            | No       | Database name (default `dev`)                                       |
| `BETTER_AUTH_SECRET` | Yes      | Secret used to sign sessions (at least 32 characters)               |
| `RESEND_API_KEY`     | Yes      | Resend API key                                                      |
| `RESEND_FROM`        | Yes      | Sender address for outgoing emails                                  |
| `AI_KEY`             | Yes\*    | API key for the AI provider                                         |
| `AI_BASE_URL`        | No       | OpenAI-compatible base URL (default `https://api.scaleway.ai/v1`)   |
| `AI_MODEL`           | No       | Model name (default `mistral-small-3.2-24b-instruct-2506`)          |
| `CRON_SECRET`        | Yes\*    | Bearer token the retention workflow sends                           |
| `APP_URL`            | No       | Overrides the app origin used by Better Auth and in email links\*\* |

\* Only needed for the coach and the retention job respectively.

\*\* By default: `https://beaver-savings.vercel.app` in production, the
deployment URL on previews, and `http://localhost:3000` locally.

## Development

```bash
yarn install

yarn dev          # next dev on http://localhost:3000
yarn lint
yarn typecheck    # generates Next's route types, then runs tsc
yarn test         # Vitest (shared/ and server/ unit tests)
yarn build        # lint and build for production
yarn start        # serve the production build
```

The service worker is only generated in production builds. Use
`yarn build && yarn start` to test the PWA install flow.

### Translations

The UI text lives in `languages/pt.json` and `languages/en.json`. Add every new
key to both files.

## Deployment

The app deploys to Vercel through the Git integration. Pushes to `main` go to
production, and other branches get preview deployments. Deployments from `dev`
are turned off in `vercel.json`, which also pins functions to `fra1` (next to
the MongoDB Atlas cluster in `eu-central-1`). See the
[root README](../README.md#devops-and-infrastructure) for the infrastructure and
CI setup.
