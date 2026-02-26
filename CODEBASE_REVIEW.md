# Codebase Walkthrough (High-Level)

I went through the full application code in this repository (excluding vendored dependencies such as `teams-bridge/node_modules`) and mapped how the product is organized.

## 1) What this repository is

- **Framework**: Next.js 14 App Router + TypeScript + Tailwind.
- **Core product**: A SaaS that lets users create/deploy AI companions and channel integrations (Telegram/Teams/WhatsApp), backed by Supabase, Stripe, and AWS EC2.
- **Main domains present in code**:
  - Companion marketplace/community + bot publishing/forking/voting.
  - Managed instance lifecycle (deploy/start/stop/delete).
  - Billing/subscriptions via Stripe.
  - Multi-channel messaging hooks (notably WhatsApp webhook handling).

## 2) Project layout

- `app/`: App Router pages + server route handlers.
- `components/`: Shared UI components for cards, selectors, forms, and integrations.
- `lib/`: Platform services (AWS, Supabase, auth, Stripe, providers, encryption, data catalogs).
- `scripts/`: Infra helper scripts (e.g., AMI prep script).
- `supabase-migration*.sql`: Evolving schema history.

## 3) Frontend routes (App Router pages)

Main UX pages include:

- Public marketing/info: `/`, `/docs`, `/privacy`, `/terms`, `/support`, `/tutorials`, `/sell`, `/company-package`.
- Auth/account: `/login`, `/profile`.
- Product workflows: `/create`, `/clone`, `/deploy`, `/dashboard`, `/console`, `/skills`.
- Companion browsing: `/companions`, `/companion/[id]`, `/community`, `/community/publish`.

## 4) API surface area

The API routes are split by capability:

- **Instance lifecycle**: `app/api/deploy`, `app/api/instance`, `app/api/clone`.
- **Billing/subscriptions**: `app/api/billing`, `app/api/fulfill`, `app/api/webhooks/stripe`, `app/api/skills/subscribe`.
- **User/account**: `app/api/profile`, `app/api/phone-verify`.
- **Marketplace/community**: `app/api/bots`, `app/api/bots/like`, `app/api/bots/liked`, `app/api/reviews`, `app/api/community`, `app/api/community/fork`, `app/api/community/vote`.
- **Channel/webhook integrations**: `app/api/whatsapp/webhook`.

## 5) Key backend/service modules

- `lib/aws.ts`
  - Encapsulates EC2 operations, AMI selection, security group setup, and launch configuration.
  - Has channel-aware runtime env wiring and model-provider env mapping.
- `lib/auth.ts`
  - Bearer-token auth helper (`getUser`) using Supabase auth lookup.
- `lib/supabase.ts` + `lib/supabase-browser.ts`
  - Server/admin and client/browser Supabase clients.
- `lib/stripe.ts`
  - Checkout + customer portal session creation helpers.
- `lib/providers.ts`, `lib/bots.ts`, `lib/skills.ts`
  - Data catalogs for supported models/providers, bot definitions, and purchasable skills.
- `lib/encryption.ts`
  - Sensitive-value encryption/decryption helpers used for credentials/tokens.

## 6) Observed architecture patterns

- **Thin route handlers + shared libs**: Most routes orchestrate validations/DB calls while infra logic is centralized in `lib/*`.
- **Supabase as source of truth**: user profile, instances, community artifacts, likes/votes/reviews, and subscription metadata.
- **External system orchestration**:
  - AWS for runtime provisioning.
  - Stripe for payment lifecycle.
  - Cloudflare Turnstile (community publish path) for anti-abuse.
  - Meta WhatsApp Graph API + forwarded LLM gateway calls for channel delivery.

## 7) Risk/maintenance notes from walkthrough

- Repository currently includes a large vendored dependency subtree under `teams-bridge/node_modules`, which can slow repo operations and increase noise during code search.
- Multiple SQL migration snapshots (`supabase-migration.sql`, `-v2`, `-v3`, `-v4-teams`) indicate iterative schema evolution; keeping one canonical migration chain/readme pointer would improve onboarding.
- API route set is broad and business-heavy; adding/maintaining endpoint-level tests (especially around auth + billing + webhook edge cases) would reduce regression risk.

## 8) If you want a deeper pass next

I can follow up with one of these focused audits:

1. **Security pass**: secret handling, auth boundaries, webhook verification, and SSRF/input-hardening checks.
2. **Reliability pass**: EC2 provisioning failure modes, retries, idempotency, and status reconciliation.
3. **Data model pass**: schema consistency across migration files and route query expectations.
4. **Frontend pass**: page/component map + UX flow gaps by funnel stage.

