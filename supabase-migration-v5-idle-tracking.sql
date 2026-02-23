-- Migration v5: Add idle activity tracking

ALTER TABLE instances
  ADD COLUMN IF NOT EXISTS last_activity_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_instances_last_activity
  ON instances(last_activity_at);