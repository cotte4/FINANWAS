-- Migration 005: Create tip_views table
-- Tracks which tips users have seen and saved

CREATE TABLE IF NOT EXISTS tip_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tip_id TEXT NOT NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  saved BOOLEAN NOT NULL DEFAULT false
);

-- Add indexes for efficient queries
CREATE INDEX idx_tip_views_user_id ON tip_views(user_id);
CREATE INDEX idx_tip_views_tip_id ON tip_views(tip_id);
CREATE INDEX idx_tip_views_saved ON tip_views(saved);
CREATE INDEX idx_tip_views_viewed_at ON tip_views(viewed_at);

-- Add table and column comments for documentation
COMMENT ON TABLE tip_views IS 'Tracks which tips users have viewed and saved';
COMMENT ON COLUMN tip_views.id IS 'Unique identifier for tip view record';
COMMENT ON COLUMN tip_views.user_id IS 'References the user who viewed the tip';
COMMENT ON COLUMN tip_views.tip_id IS 'Identifier for the tip content (matches tip ID in content files)';
COMMENT ON COLUMN tip_views.viewed_at IS 'Timestamp when the tip was viewed';
COMMENT ON COLUMN tip_views.saved IS 'Whether the user saved this tip for later';
