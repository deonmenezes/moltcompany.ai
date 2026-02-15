# Changes — fixed-edits branch

## 1. Gateway Origin Error Fix (`lib/aws.ts`)
- Replaced IMDSv1 metadata fetch with IMDSv2 token-based approach (with IMDSv1 fallback)
- Simplified `allowedOrigins` to `["*"]` for single-tenant instances
- Removed conflicting bind mount and `OPENCLAW_CUSTOM_CONFIG` env var from Docker run
- Config now reads from the Docker volume only (single source of truth)

## 2. Character File Presets (`lib/character-files.ts` — new)
- 7 character files (SOUL, AGENTS, IDENTITY, HEARTBEAT, USER, TOOLS, BOOTSTRAP) for all 9 bots
- Role-specific content per bot persona
- Helper function `getCharacterFilesForBot()` for preset lookup

## 3. Character Editor UI (`components/CharacterEditor.tsx` — new)
- Tabbed markdown editor matching the comic-book design system
- Per-file character count and total size indicator with 8KB limit warning

## 4. Deploy Page Update (`app/deploy/page.tsx`)
- New Step 5: Customize Character (tabbed editor with auto-loaded presets)
- Deploy renumbered to Step 6
- Character files reset when switching bots
- `character_files` included in deploy POST body

## 5. Deploy API Update (`app/api/deploy/route.ts`)
- Accepts optional `character_files` field
- Validates total size does not exceed 8KB
- Passes character files through to EC2 launch

## 6. EC2 Character File Injection (`lib/aws.ts`)
- `launchInstance()` accepts optional `characterFiles` parameter
- Base64-encodes each .md file and writes to `/opt/openclaw-config/`
- Volume seeding step copies .md files into the Docker volume for OpenClaw
