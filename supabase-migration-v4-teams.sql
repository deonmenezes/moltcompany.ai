-- Migration v4: Add Microsoft Teams + WhatsApp channel support
-- Adds teams and whatsapp credential columns to instances table
-- These are encrypted at the application level (same as telegram_bot_token)

ALTER TABLE instances
  ADD COLUMN IF NOT EXISTS teams_app_id TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS teams_app_password TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS whatsapp_phone_id TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS whatsapp_access_token TEXT DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN instances.teams_app_id IS 'Encrypted Microsoft Bot Framework App ID (for Teams channel)';
COMMENT ON COLUMN instances.teams_app_password IS 'Encrypted Microsoft Bot Framework App Password (for Teams channel)';
COMMENT ON COLUMN instances.whatsapp_phone_id IS 'WhatsApp Cloud API Phone Number ID (plaintext for webhook routing)';
COMMENT ON COLUMN instances.whatsapp_access_token IS 'Encrypted WhatsApp Cloud API permanent access token';
