-- Enhance lesson_progress table with time tracking and advanced analytics
-- This migration adds fields for tracking lesson start time, time spent, view count, and reading progress

-- Add new columns to lesson_progress table
ALTER TABLE lesson_progress
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS time_spent_seconds INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0;

-- Create index for time-based queries (for streak tracking and analytics)
CREATE INDEX IF NOT EXISTS idx_lesson_progress_started_at ON lesson_progress(started_at);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_last_accessed ON lesson_progress(last_accessed_at);

-- Add check constraint to ensure progress_percentage is between 0 and 100
ALTER TABLE lesson_progress
ADD CONSTRAINT check_progress_percentage CHECK (progress_percentage >= 0 AND progress_percentage <= 100);

-- Add check constraint to ensure time_spent_seconds is non-negative
ALTER TABLE lesson_progress
ADD CONSTRAINT check_time_spent_seconds CHECK (time_spent_seconds >= 0);

-- Add check constraint to ensure view_count is positive
ALTER TABLE lesson_progress
ADD CONSTRAINT check_view_count CHECK (view_count > 0);

-- Add column comments
COMMENT ON COLUMN lesson_progress.started_at IS 'Timestamp when the user first started the lesson';
COMMENT ON COLUMN lesson_progress.time_spent_seconds IS 'Total time spent on the lesson in seconds (cumulative across sessions)';
COMMENT ON COLUMN lesson_progress.last_accessed_at IS 'Timestamp of the most recent access to the lesson';
COMMENT ON COLUMN lesson_progress.view_count IS 'Number of times the user has accessed this lesson';
COMMENT ON COLUMN lesson_progress.progress_percentage IS 'Reading progress percentage (0-100) based on scroll position';
