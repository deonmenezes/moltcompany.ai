# moltcompany.ai (OpenClaw Platform)

A Next.js SaaS platform that lets users deploy private OpenClaw AI assistant instances on AWS EC2 with a single click, supporting Telegram, Discord, Slack, and WhatsApp integrations.

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database/Auth**: Supabase (PostgreSQL + Google OAuth)
- **Payments**: Stripe (integrated but currently disabled)
- **Infrastructure**: AWS EC2 (via AWS SDK v3), Docker on EC2

## Setup

```bash
npm install
```

Create `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
AWS_REGION=ap-south-1
OPENCLAW_AMI_ID=ami-...        # Optional: custom AMI with Docker pre-installed
STRIPE_SECRET_KEY=sk_test_...  # Optional: Stripe billing
NEXTAUTH_SECRET=your-secret
```

Run `supabase-migration.sql` (and migration v2–v4) in your Supabase SQL Editor to initialize the schema.

## Build / Run / Test

```bash
npm run dev      # Start development server at http://localhost:3000
npm run build    # Production build
npm start        # Start production server
npm run lint     # ESLint check
```

## Project Structure

```
app/                  Next.js App Router pages and API routes
  api/deploy/         POST - Launch new EC2 instance
  api/instance/       GET/PATCH/DELETE - Manage instances
  api/billing/        Stripe billing portal
  dashboard/          User dashboard (shows instance status)
  deploy/             Deployment form (model, API key, channel)
  companions/         AI companion browsing/creation pages
  community/          Community features
  sell/               Marketplace selling flow
components/           Shared React components
  InstanceCard.tsx    Shows instance status, IP, gateway token
  ModelSelector.tsx   AI model picker (Claude/GPT/Gemini)
  BotCard.tsx         Bot listing card
lib/
  aws.ts              AWS EC2 operations (launch/stop/start/terminate)
  supabase.ts         Supabase server client
  supabase-browser.ts Supabase browser client
  encryption.ts       Encrypt API keys before DB storage
  stripe.ts           Stripe integration
  bots.ts             Bot management helpers
  skills.ts           Skills/capabilities helpers
teams-bridge/         Multi-team bridge logic
supabase-migration*.sql  Database schema migrations (v1–v4)
scripts/build-ami.sh  Build custom AMI with Docker + images pre-baked
```

## Architecture & Key Files

- **Deployment flow**: User fills deploy form → `app/api/deploy/route.ts` → calls `lib/aws.ts:launchInstance()` → spins up EC2 with Docker user-data → stores encrypted config in Supabase.
- **EC2 instances** run two Docker containers: `coollabsio/openclaw:latest` (main app) and `coollabsio/openclaw-browser:latest` (browser sidecar, required). Both containers communicate via Docker network `openclaw-net`.
- **`lib/aws.ts`** is the core infrastructure file — all EC2 operations live here. Instances use m7i-flex.large with 20GB gp3 volume (Docker images need space).
- **Authentication**: Supabase Auth with Google OAuth. Server components use `lib/supabase.ts`; client components use `lib/supabase-browser.ts`.
- **API keys** are encrypted before Supabase storage (`lib/encryption.ts`). Gateway tokens are auto-generated UUIDs per instance.
- **Supabase migrations** must be run in order: `supabase-migration.sql` → v2 → v3 → `v4-teams`.

## Conventions & Notes for Agents

- This is a **Next.js 14 App Router** project — use server components by default; add `"use client"` only when needed.
- Stripe billing is **currently commented out** in `app/api/deploy/route.ts`; do not uncomment without testing.
- EC2 security group exposes ports 22 and 8080 only. OpenClaw web UI is at `http://<PUBLIC_IP>:8080`.
- `OPENCLAW_GATEWAY_ALLOWED_ORIGINS="*"` must be set in the container env for web UI access to work.
- One EC2 instance per user is enforced in the deploy API route.
- Never log or expose gateway tokens or API keys in client-side code.
- The `teams-bridge/` directory handles multi-team functionality added in migration v4.
- When modifying `lib/aws.ts`, ensure both containers (`openclaw` + `browser`) are always launched together — OpenClaw crashes without the browser sidecar.
