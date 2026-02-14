# OpenClaw Platform - One-Click AI Assistant Deployment SaaS

A Next.js-based SaaS platform that lets users deploy their own private OpenClaw AI assistant instances on AWS EC2 with a single click.

## 🎯 What This Project Does

This is a managed platform that automates the deployment and hosting of [OpenClaw](https://github.com/coollabsio/openclaw) - an open-source AI assistant that can be integrated with Telegram, Discord, Slack, and WhatsApp.

Users can:
- Sign in with Google (Supabase Auth)
- Choose their preferred AI model (Claude, GPT, Gemini)
- Enter their AI API key and Telegram bot token
- Click "Deploy" to get a fully configured OpenClaw instance running on a dedicated EC2 server
- Access their private OpenClaw web UI at `http://<PUBLIC_IP>:8080`
- Connect their Telegram bot to the instance

## 🏗️ Architecture

### Stack
- **Frontend**: Next.js 14 (React, TypeScript, Tailwind CSS)
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Google OAuth)
- **Payments**: Stripe (currently commented out for testing)
- **Infrastructure**: AWS EC2, AWS SDK for JavaScript v3
- **Container Runtime**: Docker (on EC2 instances)

### How Deployment Works

When a user clicks "Deploy":

1. **Instance Record Created** - Supabase stores instance metadata
2. **EC2 Instance Launched** - AWS SDK launches an m7i-flex.large instance with:
   - 20GB root volume (needed for Docker images)
   - Custom user-data script that runs on first boot
   - Security group allowing ports 22 (SSH) and 8080 (OpenClaw)
3. **Docker Containers Started** - User-data script:
   - Starts Docker service
   - Creates Docker network `openclaw-net`
   - Pulls and runs `coollabsio/openclaw-browser:latest` (browser sidecar for automation)
   - Pulls and runs `coollabsio/openclaw:latest` (main app)
4. **OpenClaw Configured** - Environment variables set:
   - AI API key (Anthropic/OpenAI/Gemini)
   - Primary model name
   - Gateway token (auto-generated UUID for authentication)
   - Browser sidecar URL
   - Allowed origins (to enable web UI access from public IP)
5. **User Accesses** - Dashboard shows public IP and gateway token

## 📁 Project Structure

```
openclaw-setup/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   ├── deploy/page.tsx             # Deployment form
│   ├── dashboard/page.tsx          # User dashboard (shows instance)
│   └── api/
│       ├── deploy/route.ts         # POST - Launch new instance
│       ├── instance/route.ts       # GET/PATCH/DELETE - Manage instance
│       └── billing/route.ts        # Stripe billing portal
├── components/
│   ├── InstanceCard.tsx            # Instance details card (with gateway token)
│   ├── ModelSelector.tsx           # AI model picker
│   ├── ChannelSelector.tsx         # Channel type picker
│   ├── ApiKeyInput.tsx             # API key input
│   └── AuthProvider.tsx            # Supabase auth wrapper
├── lib/
│   ├── aws.ts                      # AWS EC2 functions (launch, stop, start, terminate)
│   ├── supabase.ts                 # Supabase server client
│   ├── supabase-browser.ts         # Supabase browser client
│   ├── auth.ts                     # Auth helpers
│   ├── stripe.ts                   # Stripe integration
│   └── encryption.ts               # Encrypt sensitive data before storing
├── scripts/
│   └── build-ami.sh                # Build custom AMI with Docker + images pre-installed
├── supabase-migration.sql          # Database schema
└── .env.local                      # Environment variables
```

## 🔑 Key Files Explained

### `lib/aws.ts`
Contains all AWS EC2 operations:
- `launchInstance()` - Launches EC2 with user-data that installs Docker and runs OpenClaw
- `getInstancePublicIp()` - Fetches public IP
- `getInstanceState()` - Checks if instance is running/stopped
- `stopInstance()` - Stops EC2 instance
- `startInstance()` - Restarts stopped instance
- `terminateInstance()` - Permanently deletes instance
- `getOrCreateSecurityGroup()` - Ensures security group exists with ports 22, 8080 open

**Critical Configuration:**
- Uses **20GB root volume** (default 8GB is too small for both Docker images)
- Launches **both containers** (`openclaw` + `browser` sidecar) - OpenClaw requires the browser container
- Sets `OPENCLAW_GATEWAY_ALLOWED_ORIGINS="*"` to allow web UI access from public IP

### `app/api/deploy/route.ts`
Handles deployment:
1. Validates user authentication
2. Checks for existing active instance (only 1 per user)
3. Generates gateway token (UUID)
4. Calls `launchInstance()` from `lib/aws.ts`
5. Stores instance record in Supabase with encrypted API keys

### `app/api/instance/route.ts`
- **GET** - Fetches instance details, updates public IP/status from AWS
- **PATCH** - Start/stop instance
- **DELETE** - Terminate instance permanently

### `supabase-migration.sql`
Database schema:
- `users` - User accounts (linked to Google OAuth)
- `instances` - EC2 instances (one per user, stores encrypted API keys)
- `subscriptions` - Stripe subscriptions (currently unused)

## 🐛 Known Issues & Fixes Applied

### Issue 1: Missing Browser Sidecar (FIXED ✅)
**Problem**: Original deployment only launched the `openclaw` container. OpenClaw's nginx config references an upstream "browser" service that didn't exist, causing crash loop.

**Fix**: Updated `lib/aws.ts` to:
1. Create Docker network `openclaw-net`
2. Launch `coollabsio/openclaw-browser:latest` first
3. Launch `openclaw` container with `BROWSER_CDP_URL=http://browser:9223`

### Issue 2: Disk Space Exhaustion (FIXED ✅)
**Problem**: Default 8GB root volume filled up when pulling browser image (3GB + 3GB = 6GB for both images).

**Fix**: Added `BlockDeviceMappings` to `RunInstancesCommand` with 20GB `gp3` volume.

### Issue 3: Gateway Origin Blocking (FIXED ✅)
**Problem**: OpenClaw gateway rejected connections from public IP with error: `origin not allowed`

**Fix**: Added `OPENCLAW_GATEWAY_ALLOWED_ORIGINS="*"` environment variable to allow web UI access.

### Issue 4: Gateway Token Not Displayed (FIXED ✅)
**Problem**: Dashboard showed instance details but not the gateway token (password for web UI).

**Fix**: Updated `components/InstanceCard.tsx` to display gateway token with copy button.

## 🚀 Deployment Process

### Prerequisites
1. AWS credentials configured (`~/.aws/credentials` or environment variables)
2. Supabase project with Google OAuth configured
3. (Optional) Stripe account for payments

### Environment Variables (`.env.local`)
```bash
# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...

# AWS
AWS_REGION=ap-south-1
OPENCLAW_AMI_ID=ami-07b675c5a24f34a0b  # Optional: custom AMI with Docker pre-installed
```

### Run Locally
```bash
npm install
npm run dev
```
Go to http://localhost:3000

### Database Setup
Run `supabase-migration.sql` in your Supabase SQL Editor.

### Build Custom AMI (Optional but Recommended)
Pre-bakes Docker + OpenClaw images into an AMI for faster instance startup:
```bash
bash scripts/build-ami.sh
# Copy the AMI ID to .env.local as OPENCLAW_AMI_ID
```

## 🔐 Security Notes

- API keys are encrypted before storing in Supabase (`lib/encryption.ts`)
- Gateway token is generated per-instance (UUID) for authentication
- Basic auth enabled on OpenClaw web UI (username: `admin`, password: gateway token)
- Security group restricts inbound to ports 22, 8080 only

## 💰 Billing (Currently Disabled)

Stripe integration exists but is commented out in `app/api/deploy/route.ts`.

To enable:
1. Uncomment Stripe checkout session code
2. Set up Stripe webhook endpoint
3. Implement subscription validation before allowing instance creation

## 🛠️ Future Improvements

- [ ] Auto-stop instances after X hours of inactivity
- [ ] Health checks and auto-restart for failed containers
- [ ] Custom domain support (Route53 + SSL)
- [ ] Multi-region deployment
- [ ] Instance size selector (currently hardcoded to m7i-flex.large)
- [ ] Backup/restore for OpenClaw data volumes
- [ ] Telegram bot configuration via web UI (currently manual)

## 📞 Support

For issues with:
- **OpenClaw itself**: https://github.com/coollabsio/openclaw
- **This platform**: Check the instance logs via AWS Console or SSH into EC2 to run `docker logs openclaw`

## 🧪 Testing Checklist

Before deploying to production:
- [ ] Test deployment with all 3 AI providers (Anthropic, OpenAI, Google)
- [ ] Test stop/start/terminate instance actions
- [ ] Verify gateway token authentication works
- [ ] Test Telegram bot integration
- [ ] Load test OpenClaw web UI
- [ ] Verify all Docker containers stay running after reboot
- [ ] Check disk space doesn't fill up after multiple model switches
- [ ] Ensure database credentials are encrypted

---

## Quick Troubleshooting

**Instance shows "Running" but web UI won't load:**
- Check security group allows port 8080
- Check if both containers are running: SSH in and run `docker ps`
- Check OpenClaw logs: `docker logs openclaw`
- Check browser sidecar logs: `docker logs browser`

**Gateway connection error:**
- Verify `OPENCLAW_GATEWAY_ALLOWED_ORIGINS="*"` is set in container env
- Check browser console for CORS errors

**Container keeps restarting:**
- Check disk space: `df -h`
- Check logs: `docker logs openclaw --tail 100`
- Verify both Docker images are present: `docker images`

**No public IP assigned:**
- Instance may still be launching (wait 2-3 min)
- Check VPC has internet gateway attached
- Verify subnet has public IP auto-assign enabled

---

Built with ❤️ for easy OpenClaw deployment
