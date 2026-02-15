-- Run this in Supabase SQL Editor AFTER migration v2
-- Adds companion reviews/comments table

CREATE TABLE IF NOT EXISTS companion_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES users(id),
  user_name text,
  user_avatar text,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_bot_id ON companion_reviews(bot_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON companion_reviews(created_at DESC);
