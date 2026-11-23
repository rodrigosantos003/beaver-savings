# CLAUDE.md

@AGENTS.md

Beaver Savings is a savings calculator (with a savings "dam" tracker and an AI
coach). It is one Next.js 16 / React 19 app: pages and API route handlers deploy
together to Vercel. Full details are in
[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) and [README.md](README.md).

## Commands

Package manager is **Yarn 1** (`yarn.lock`); don't use npm or pnpm.

```bash
yarn dev          # http://localhost:3000 (no service worker in dev)
yarn lint
yarn typecheck    # next typegen && tsc --noEmit
yarn test         # Vitest, runs {shared,server}/**/*.test.ts
yarn vitest run shared/savings/calculate.test.ts   # single test file
yarn format       # Prettier (sorts imports too)
yarn build        # eslint + next build --webpack
```

Builds must use `--webpack`: `@serwist/next` does not support Turbopack, so the
service worker would be missing. Test the PWA with `yarn build && yarn start`.

CI (PRs to `main`) runs lint, typecheck, test and build. Run all four before
calling a change done.

## Architecture

| Folder                | Contents                                                       | May import                 |
| --------------------- | -------------------------------------------------------------- | -------------------------- |
| `shared/`             | Pure TS (calculations, currency, PDF). No React/Next/Node/IO   | `shared/` only             |
| `server/`             | DB, auth, email, AI, secrets. Every file imports `server-only` | `shared/`, `server/`       |
| `components/`, `lib/` | UI and browser code (API client, auth client, hooks)           | `shared/`, never `server/` |
| `app/`                | Pages, layouts, route handlers: where both sides meet          | anything                   |

ESLint enforces these boundaries. Use the `@/` path alias.

- **Features** in `server/<feature>/` follow `*.schema.ts` (Zod),
  `*.repository.ts` (Mongoose model via `getModel()` from
  `server/db/connection.ts`, `.lean()` queries, always scoped by `userId`) and
  `*.service.ts` (business logic, maps documents to response DTOs).
- **Route handlers** (`app/api/**/route.ts`) stay thin: wrap them in `route()`
  from `server/lib/route.ts`, which handles session auth (`auth: false` to opt
  out), rate limiting (60/min default, keyed by `name`), `HttpError`/Zod →
  status mapping, and 204 for `undefined`. Read input with `readJson` /
  `readQuery` and a Zod schema. Throw helpers from `server/lib/errors.ts`.
- **Server components** call services directly (e.g.
  `server/calculator/page-data.ts`) and use `getSession()` from
  `server/auth/session.ts`, not the HTTP API.
- **Client** calls the API through `lib/api/*` (`request()` in
  `lib/api/index.ts`).
- **Auth**: Better Auth with Mongo adapter and passkeys, mounted at
  `/api/auth/[...all]`; config in `server/auth/auth.ts`, client in
  `lib/auth-client.ts`.
- **Routing/i18n**: `next-intl`, locales `pt` (default) and `en`,
  `localePrefix: 'as-needed'`. All pages live under `app/[locale]/`. `proxy.ts`
  (Next 16's replacement for `middleware.ts`) runs i18n and redirects signed-in
  users away from `/`, `/login`, `/signup`.
- **PWA**: Serwist, source `app/sw.ts`, configured in `next.config.ts`.
  `public/sw.js` is generated.

## Conventions

- Every UI string goes in **both** `languages/pt.json` and `languages/en.json`.
- Prettier: single quotes, semicolons, width 100, trailing commas; import order
  is react/next → `node:` → third party → `@/` → relative. Markdown wraps at 80.
- Unit tests sit next to the code as `*.test.ts` in `shared/` or `server/`;
  `server-only` is stubbed for Vitest.
- Commits use Conventional Commits (`feat(scope):`, `fix:`, `refactor(pwa):`,
  `chore(compliance):` ...). Work happens on `dev`; `main` deploys to
  production. Vercel deployments from `dev` are disabled.
- Environment variables are documented in `docs/DEVELOPMENT.md`; local values
  live in `.env` (never commit it).
- Inactive accounts are deleted after 24 months by a daily GitHub Action calling
  `/api/maintenance/inactive-accounts`. Any change to stored user data must also
  be covered by account export (`server/account/`), user-requested deletion
  (`user.deleteUser.afterDelete` in `server/auth/auth.ts`) and retention
  (`server/retention/`), plus the legal-file rules in AGENTS.md.
- Infrastructure (Vercel project, MongoDB Atlas M0 cluster) is Terraform in
  `infrastructure/terraform/`, applied manually.
