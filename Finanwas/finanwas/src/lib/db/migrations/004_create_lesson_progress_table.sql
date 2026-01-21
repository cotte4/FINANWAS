-- Create lesson_progress table
-- This table tracks which lessons users have completed

CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_slug TEXT NOT NULL,
  lesson_slug TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  CONSTRAINT lesson_progress_unique_user_course_lesson UNIQUE (user_id, course_slug, lesson_slug)
);

-- Create indexes for better query performance
CREATE INDEX idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_course_slug ON lesson_progress(course_slug);
CREATE INDEX idx_lesson_progress_completed ON lesson_progress(completed);

-- Add table comment
COMMENT ON TABLE lesson_progress IS 'Tracks user lesson completion for educational content';

-- Add column comments
COMMENT ON COLUMN lesson_progress.id IS 'Primary key';
COMMENT ON COLUMN lesson_progress.user_id IS 'Reference to user who completed the lesson';
COMMENT ON COLUMN lesson_progress.course_slug IS 'Slug identifier for the course';
COMMENT ON COLUMN lesson_progress.lesson_slug IS 'Slug identifier for the lesson within the course';
COMMENT ON COLUMN lesson_progress.completed IS 'Whether the lesson has been marked as completed';
COMMENT ON COLUMN lesson_progress.completed_at IS 'Timestamp when the lesson was completed';
