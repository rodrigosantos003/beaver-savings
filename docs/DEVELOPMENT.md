# Beaver Savings — Web

The frontend for [Beaver Savings](../../README.md). It is a Next.js app with the
savings calculator, the savings "dam", the AI coach, accounts and the legal
pages. It is available in Portuguese and English and can be installed as a PWA.

It is deployed to Vercel as the `beaver-savings` project, at
<https://beaver-savings.vercel.app>.

## Stack

| Concern      | Technology                                                    |
| ------------ | ------------------------------------------------------------- |
| Framework    | Next.js 16 (App Router), React 19                             |
| Styling      | Tailwind CSS 4                                                |
| i18n         | `next-intl` (`pt` by default, `en`, no locale prefix in URLs) |
| Auth         | Better Auth React client                                      |
| PWA          | Serwist service worker (production builds only)               |
| Shared logic | `savings-core` workspace package (calculations, currencies)   |

> This version of Next.js has breaking changes compared to older releases. Check
> the docs in `node_modules/next/dist/docs/` before changing framework code (see
> [AGENTS.md](AGENTS.md)).

## Project structure

```
apps/web
├── app/
│   ├── [locale]/            # Every page, with the locale resolved by next-intl
│   │   ├── landing/         # Marketing landing page
│   │   ├── calculator/      # Calculator, savings dam and AI coach
│   │   ├── login/, signup/, forgot-password/, reset-password/, confirm-account/
│   │   ├── delete-account/
│   │   └── privacy-policy/, terms-and-conditions/
│   ├── manifest.ts, robots.ts, sitemap.ts
│   └── sw.ts                # Service worker source
├── components/
│   ├── calculator/          # Form, results, export bar, dam, coach sidebar
│   ├── auth/                # Sign-in, sign-up, password and verification flows
│   └── account/             # Data download and account deletion
├── i18n/                    # next-intl routing and request config
├── languages/               # pt.json and en.json message files
└── lib/
    ├── api/                 # Client and server-side API helpers
    ├── auth-client.ts       # Better Auth client
    └── hooks/, currencies.ts, seo.ts, …
```

## How it talks to the API

The browser sends API calls to its own origin, and `next.config.ts` proxies them
to the API with rewrites. Auth cookies therefore stay first-party. These paths
are proxied:

`/api/auth/*`, `/account/*`, `/coach/*`, `/dam/*`, `/savings/*`, `/snapshots/*`

Server components call the API directly with `lib/api/server.ts` and pass along
the incoming request's cookies.

## Environment variables

For local development, put these in `apps/web/.env`.

| Variable                      | Description                                                       |
| ----------------------------- | ----------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`         | Base URL of the API, e.g. `http://localhost:3001`                 |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Better Auth base URL in development, e.g. `http://localhost:3001` |

In production the auth client is hard-coded to
`https://beaver-savings.vercel.app/api/auth`, which goes through the rewrite
above.

## Development

Run these from the **repository root**. The root scripts build `savings-core`
first. The API needs to be running too (`yarn dev:api`, see
[apps/api](../api/README.md)).

```bash
yarn install

yarn dev:web     # build savings-core, then start next dev on http://localhost:3000
yarn build:web   # lint and build for production
yarn start:web   # serve the production build
yarn lint:web
```

The service worker is only generated in production builds. Use
`yarn build:web && yarn start:web` to test the PWA install flow.

### Translations

The UI text lives in `languages/pt.json` and `languages/en.json`. Add every new
key to both files.

## Deployment

The web app deploys to Vercel through the Git integration. Pushes to `main` go
to production, and other branches get preview deployments. Deployments from
`dev` are turned off in `vercel.json`. See the
[root README](../../README.md#devops-and-infrastructure) for the infrastructure
and CI setup.
