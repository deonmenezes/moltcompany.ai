# MoltCompany.ai

> Deploy and manage AI companions at scale. Browse the marketplace, connect Telegram, pay once—get a dedicated OpenClaw instance in minutes.

A Next.js SaaS platform powered by [OpenClaw](https://github.com/coollabsio/openclaw). Users choose companions and models, complete Stripe checkout, and receive a dedicated EC2 instance running OpenClaw with their configuration.

---

## Table of contents

- [What this project does](#what-this-project-does)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Key files](#key-files)
- [Security](#security)
- [Running the project](#running-the-project)
- [Known issues and fixes](#known-issues-and-fixes)
- [Troubleshooting](#troubleshooting)
- [Future improvements](#future-improvements)
- [Support](#support)

---

## What this project does

MoltCompany.ai automates deployment and hosting of **OpenClaw**, an open-source AI assistant that integrates with Telegram, Discord, Slack, and WhatsApp.

**Users can:**

| Capability | Description |
|------------|-------------|
| **Sign in** | Google or phone (Supabase Auth) |
| **Browse** | Official and community AI companions on the marketplace |
| **Create** | Build and publish their own companions |
| **Configure** | Choose model (Claude, GPT, Gemini, Kimi, MiniMax), API key, Telegram bot token |
| **Subscribe** | Complete Stripe checkout to activate deployment |
| **Deploy** | Receive a dedicated EC2 instance with OpenClaw after payment |
| **Access** | Private web UI at `http://<PUBLIC_IP>:8080` and connect Telegram |

The **Console** (`/console`) is where users manage instances, subscription, and billing.

---

## Architecture

### Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (Google OAuth and phone) |
| **Payments** | Stripe (checkout + webhooks; payment required before EC2 launch) |
| **Infrastructure** | AWS EC2, AWS SDK for JavaScript v3 |
| **Runtime** | Docker on EC2 instances |

### Deployment flow

| Step | What happens |
|------|----------------|
| **1. Deploy request** | User submits the form (model, API key, Telegram token, optional character files). Must be signed in. |
| **2. Instance record** | Row created in `instances` with status `pending_payment`. Sensitive fields encrypted. |
| **3. Stripe checkout** | User redirected to Stripe to complete payment (or trial). |
| **4. Post-payment** | Stripe webhook (`checkout.session.completed`) or client-side fulfill API fetches pending instance, calls `launchInstance()` in `lib/aws.ts`, updates status to `provisioning` then `running`. |
| **5. EC2 and OpenClaw** | User-data script installs Docker, runs OpenClaw browser sidecar and main app, applies character files and env. Console shows public IP and gateway token. |

### Project structure

<details>
<summary>Click to expand full tree</summary>

```
moltcompany.ai/
├── app/
│   ├── page.tsx                      # Landing: marketplace, trending, search
│   ├── layout.tsx                    # Root layout, Navbar, AuthProvider
│   ├── globals.css
│   ├── deploy/page.tsx               # Multi-step deploy form
│   ├── dashboard/page.tsx            # Redirects to /console
│   ├── console/page.tsx             # User console (instances, subscription)
│   ├── companions/page.tsx           # Browse companions
│   ├── companion/[id]/page.tsx       # Companion detail
│   ├── companions/community/[id]/    # Community companion detail
│   ├── create/page.tsx               # Create custom companion
│   ├── community/
│   │   ├── page.tsx                  # Community bots
│   │   └── publish/page.tsx         # Publish to community
│   ├── login/page.tsx
│   ├── profile/page.tsx
│   ├── tutorials/page.tsx
│   ├── docs/page.tsx
│   ├── support/page.tsx
│   ├── terms/page.tsx
│   ├── privacy/page.tsx
│   ├── company-package/page.tsx
│   ├── sell/page.tsx
│   └── api/
│       ├── deploy/route.ts           # POST – pending instance + Stripe URL
│       ├── fulfill/route.ts          # POST – post-payment EC2 launch
│       ├── instance/route.ts         # GET/PATCH/DELETE – instances
│       ├── billing/route.ts          # Stripe billing portal
│       ├── webhooks/stripe/route.ts  # Stripe webhooks
│       ├── bots/
│       │   ├── route.ts              # GET – list bots
│       │   ├── like/route.ts         # POST – like/unlike
│       │   └── liked/route.ts        # GET – user's liked IDs
│       ├── community/
│       │   ├── route.ts
│       │   ├── fork/route.ts
│       │   └── vote/route.ts
│       ├── reviews/route.ts
│       ├── profile/route.ts
│       └── phone-verify/route.ts
├── components/
│   ├── InstanceCard.tsx
│   ├── ModelSelector.tsx
│   ├── ChannelSelector.tsx
│   ├── ApiKeyInput.tsx
│   ├── AuthProvider.tsx
│   ├── CharacterEditor.tsx          # Tabbed editor, 8KB limit
│   ├── DeployButton.tsx
│   ├── Navbar.tsx
│   ├── TelegramConnect.tsx
│   ├── BotCard.tsx
│   ├── BotGrid.tsx
│   ├── PumpBotCard.tsx
│   ├── CompanionCard.tsx
│   └── TestimonialCard.tsx
├── lib/
│   ├── aws.ts                        # EC2: launch, IP/state, stop/start/terminate
│   ├── supabase.ts
│   ├── supabase-browser.ts
│   ├── auth.ts                       # getUser(req) for API routes
│   ├── stripe.ts
│   ├── encryption.ts
│   ├── sanitize.ts                   # sanitizeUrl, rateLimit
│   ├── bots.ts                       # Official bot definitions
│   ├── character-files.ts            # Preset character files per bot
│   └── providers.ts                  # LLM providers and models
├── scripts/
│   └── build-ami.sh                  # Optional: AMI with Docker + OpenClaw
├── supabase-migration.sql            # Base schema
├── supabase-migration-v2.sql        # instance: bot_id, companion_*
├── supabase-migration-v3.sql        # companion_reviews
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```
</details>

| Folder | Purpose |
|--------|---------|
| **app/** | Next.js App Router: pages and API routes (deploy, instance, billing, bots, community, webhooks). |
| **components/** | React UI: auth, deploy form, instance cards, bot cards, navbar, character editor. |
| **lib/** | Server and shared logic: AWS EC2, Supabase, Stripe, auth, encryption, sanitize, bot data, providers. |
| **scripts/** | Optional AMI build for faster EC2 boot. |

---

## Key files

| File | Role |
|------|------|
| **lib/aws.ts** | `launchInstance()`, `getInstancePublicIp()`, `getInstanceState()`, `stopInstance()`, `startInstance()`, `terminateInstance()`. 20GB root volume; ports 22, 8080; `OPENCLAW_GATEWAY_ALLOWED_ORIGINS="*"`. |
| **app/api/deploy/route.ts** | Validates auth, rate limit (5/min), required fields, model; enforces 8 KB character files; creates user/instance `pending_payment`, returns Stripe checkout URL. No EC2 launch here. |
| **app/api/fulfill/route.ts** | Post-payment: fetches pending instance, calls `launchInstance()`, updates status. Subscription upsert. |
| **app/api/webhooks/stripe/route.ts** | `checkout.session.completed`: same launch flow; subscription insert. Handles subscription deleted and payment failed. |
| **app/api/instance/route.ts** | GET: list instances, sync AWS state, subscription. PATCH: start/stop, update API key. DELETE: terminate and cancel Stripe. |

**Database (migrations):** `users` (email/phone, Stripe customer ID), `instances` (status, encrypted keys, gateway token, character files, companion metadata), `subscriptions`, `companion_reviews` (v3).

---

## Security

- **Secrets** – API keys and Telegram tokens encrypted at rest (`lib/encryption.ts`). Set `ENCRYPTION_KEY` or `NEXTAUTH_SECRET` in production.
- **Gateway** – Per-instance UUID as OpenClaw web UI password.
- **Network** – Security group allows only ports 22 and 8080.
- **API** – Deploy endpoint rate-limited; Stripe webhook signature verified.

---

## Running the project

### Prerequisites

- Node.js and npm  
- AWS credentials (`~/.aws/credentials` or env)  
- Supabase project (Auth: Google, optionally phone)  
- Stripe account (checkout + webhook)

### Environment variables (.env.local)

| Group | Variables |
|-------|-----------|
| **Stripe** | `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| **Supabase** | `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **Auth** | `NEXTAUTH_SECRET`, `NEXTAUTH_URL`; Google OAuth via Supabase |
| **AWS** | `AWS_REGION`, optional `OPENCLAW_AMI_ID` |
| **Encryption** | `ENCRYPTION_KEY` or `NEXTAUTH_SECRET` |

### Commands

```bash
npm install
npm run dev
```

Then open **http://localhost:3000**.

### Database

Run `supabase-migration.sql`, then `supabase-migration-v2.sql` and `supabase-migration-v3.sql` in the Supabase SQL Editor as needed.

### Optional: custom AMI

Faster instance boot by pre-baking Docker and OpenClaw images:

```bash
bash scripts/build-ami.sh
```

Set the AMI ID as `OPENCLAW_AMI_ID` in `.env.local`.

---

## Known issues and fixes

| Issue | Fix |
|-------|-----|
| **Browser sidecar** | `lib/aws.ts` creates `openclaw-net`, runs `openclaw-browser` first, then OpenClaw with `BROWSER_CDP_URL=http://browser:9223`. |
| **Disk space** | 20GB gp3 root volume (default 8GB too small). |
| **Gateway origin** | `OPENCLAW_GATEWAY_ALLOWED_ORIGINS="*"` set for web UI from public IP. |
| **Gateway token in UI** | `InstanceCard` shows token with copy button. |

---

## Troubleshooting

| Symptom | Checks |
|---------|--------|
| Instance "Running" but web UI not loading | Security group allows 8080; on instance: `docker ps`, `docker logs openclaw`, `docker logs browser`. |
| Gateway / CORS errors | Confirm `OPENCLAW_GATEWAY_ALLOWED_ORIGINS="*"` in container env. |
| Containers restarting | `df -h`, logs; ensure both images present. |
| No public IP | Wait a few minutes; VPC internet gateway and subnet auto-assign public IP. |

---

## Future improvements

- Auto-stop instances after inactivity  
- Health checks and auto-restart for containers  
- Custom domain and SSL (e.g. Route53)  
- Multi-region and instance size options  
- Backup/restore for OpenClaw data  
- Telegram bot configuration via web UI  

---

## Support

- **OpenClaw:** https://github.com/coollabsio/openclaw  
- **This platform:** Inspect instance logs in AWS or run `docker logs openclaw` on the EC2 instance.

---

Built with care for simple, reliable OpenClaw deployment.
