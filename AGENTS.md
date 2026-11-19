<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Code comments

Do not write noise comments that explain obvious things.
Only add comments that explain logic beyond what the names of constants, variables, functions and components already describe.

## Regulatory compliance

Check EU and GDPR rules before confirming any change that touches personal data or user-facing terms. Examples include, but are not limited to:
- new or changed personal-data fields
- auth and identity data (passkeys, sessions, tokens)
- third-party processors, including email sending, analytics and telemetry
- cookies, local storage or similar client-side storage
- logging of user data
- data retention, deletion or export
- cross-border data transfers

If a change processes personal data differently, update all Privacy Policy files together:
- PRIVACY_POLICY.md, app/[locale]/privacy-policy/page.tsx, languages/en.json and languages/pt.json

If a change affects user obligations, features, pricing, account lifecycle or other service terms, update all Terms and Conditions files together:
- TERMS_AND_CONDITIONS.md, app/[locale]/terms-and-conditions/page.tsx, languages/en.json and languages/pt.json
