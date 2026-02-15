-- Run this in Supabase SQL Editor AFTER the initial migration
-- Adds multi-companion support columns to instances table

ALTER TABLE instances ADD COLUMN IF NOT EXISTS bot_id text;
ALTER TABLE instances ADD COLUMN IF NOT EXISTS companion_name text;
ALTER TABLE instances ADD COLUMN IF NOT EXISTS companion_role text;
ALTER TABLE instances ADD COLUMN IF NOT EXISTS companion_color text;
ALTER TABLE instances ADD COLUMN IF NOT EXISTS companion_avatar text;

-- Index for fetching all instances belonging to a user
CREATE INDEX IF NOT EXISTS idx_instances_user_status ON instances(user_id, status);
