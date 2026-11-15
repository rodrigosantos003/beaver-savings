# Beaver Savings — API

The backend for [Beaver Savings](../../README.md). It is a NestJS app that
handles authentication, stores calculator snapshots and savings ("dam") entries
in MongoDB, sends emails through Resend and runs the AI savings coach.

It is deployed to Vercel as the `beaver-savings-api` project.

## Stack

| Concern         | Technology                                                      |
| --------------- | --------------------------------------------------------------- |
| Framework       | NestJS 12 (ESM)                                                 |
| Database        | MongoDB Atlas through Mongoose                                  |
| Auth            | Better Auth (Mongo adapter) via `@thallesp/nestjs-better-auth`  |
| Email           | Resend                                                          |
| AI coach        | OpenAI-compatible chat completions API (Scaleway by default)    |
| Rate limiting   | `@nestjs/throttler`                                             |
| Resilience      | `@nestjs/resilience` (timeout, retry, circuit breaker)          |
| Shared logic    | `savings-core` workspace package                                |
| Edge middleware | `@vercel/functions` (method, CORS preflight and body-size gate) |

## Project structure

```
apps/api
├── lib/              # Shared infrastructure: database, email, AI client, pipes
├── middleware.ts     # Vercel edge middleware run before the Nest app
├── src/
│   ├── main.ts       # Bootstrap: validation, CORS, security headers
│   ├── app/          # Root module, health check, 404 filter
│   ├── auth/         # Better Auth config plus verification and recovery emails
│   ├── account/      # GDPR data export
│   ├── calculator/   # Calculator snapshots and spending habits
│   ├── coach/        # AI savings coach
│   ├── dam/          # Savings dam entries (money actually put aside)
│   ├── retention/    # Inactive-account cleanup job
│   └── savings/      # Email a savings summary
└── test/             # e2e tests
```

## Endpoints

All routes require a signed-in session unless marked **public**. The global rate
limit is 60 requests per minute.

| Method   | Path                             | Description                                             |
| -------- | -------------------------------- | ------------------------------------------------------- |
| `GET`    | `/`                              | **Public.** Root endpoint                               |
| `GET`    | `/health`                        | **Public.** API and database health                     |
| `*`      | `/api/auth/*`                    | Better Auth routes (sign-up, sign-in, reset, verify, …) |
| `POST`   | `/snapshots`                     | Save the current calculator input                       |
| `GET`    | `/snapshots/latest`              | Load the most recent calculator input                   |
| `GET`    | `/snapshots/habits`              | Spending habits derived from recent snapshots           |
| `DELETE` | `/snapshots`                     | Delete all of the user's snapshots                      |
| `GET`    | `/dam`                           | List savings dam entries                                |
| `POST`   | `/dam`                           | Add a savings dam entry                                 |
| `DELETE` | `/dam/:id`                       | Remove a savings dam entry                              |
| `GET`    | `/coach/insights`                | AI-generated insights (10 per minute)                   |
| `POST`   | `/coach/ask`                     | Ask the AI coach a question (10 per minute)             |
| `POST`   | `/savings/email`                 | Email the savings summary (5 per minute)                |
| `GET`    | `/account/export`                | Export all of the user's data (5 per minute)            |
| `GET`    | `/maintenance/inactive-accounts` | Cron only, needs `Authorization: Bearer $CRON_SECRET`   |

### Inactive-account retention

The Privacy Policy states that inactive accounts are deleted, and Vercel Cron
calls `/maintenance/inactive-accounts` to enforce it:

- After **24 months** without activity, the account and its sessions, dam
  entries and calculator snapshots are deleted.
- Verified users get a warning email **30 days** before deletion. Unverified
  accounts are deleted without a warning.
- Each run is capped at 20 warnings and 100 deletions so it fits within one
  serverless invocation.

## Environment variables

For local development, put these in `apps/api/.env`. On Vercel the `.env` file
is ignored and the variables come from the project settings.

| Variable             | Required | Description                                                       |
| -------------------- | -------- | ----------------------------------------------------------------- |
| `PORT`               | No       | Port to listen on (default `3001`)                                |
| `MONGODB_URI`        | Yes      | MongoDB connection string                                         |
| `DB_NAME`            | No       | Database name (default `dev`)                                     |
| `BETTER_AUTH_SECRET` | Yes      | Secret used to sign sessions                                      |
| `BETTER_AUTH_URL`    | No       | Public URL of this API (default `http://localhost:3001`)          |
| `WEB_ORIGIN`         | Yes      | Web app origin, used for CORS, trusted origins and email links    |
| `RESEND_API_KEY`     | Yes      | Resend API key                                                    |
| `RESEND_FROM`        | Yes      | Sender address for outgoing emails                                |
| `AI_KEY`             | Yes\*    | API key for the AI provider                                       |
| `AI_BASE_URL`        | No       | OpenAI-compatible base URL (default `https://api.scaleway.ai/v1`) |
| `AI_MODEL`           | No       | Model name (default `mistral-small-3.2-24b-instruct-2506`)        |
| `CRON_SECRET`        | Yes\*    | Bearer token Vercel Cron sends to the retention endpoint          |

\* Only needed for the coach and the retention job respectively.

## Development

Run these from the **repository root**. The root scripts build `savings-core`
first, which the API depends on.

```bash
yarn install

yarn dev:api     # build savings-core, then start Nest in watch mode
yarn build:api   # lint and compile to dist/
yarn start:api   # run the compiled app
yarn lint:api
yarn test:api    # unit tests
```

The workspace has more scripts that you can run with
`yarn workspace api <script>`:

```bash
yarn workspace api test:e2e   # e2e tests (need a reachable MongoDB)
yarn workspace api test:cov
yarn workspace api lint:fix
```

## Deployment

The API deploys to Vercel through the Git integration. Pushes to `main` go to
production, and other branches get preview deployments. Deployments from `dev`
are turned off in the root `vercel.json`. The Vercel project and the MongoDB
Atlas cluster are managed with Terraform in `infrastructure/terraform`. See the
[root README](../../README.md#devops-and-infrastructure) for details.
