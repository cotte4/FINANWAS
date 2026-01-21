-- Migration: Create notes table
-- Description: User notes with tags and ticker linking for financial research
-- Author: Ralph Agent
-- Date: 2026-01-20

CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  linked_ticker TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Comments for documentation
COMMENT ON TABLE notes IS 'User notes for financial research and personal tracking';
COMMENT ON COLUMN notes.id IS 'Unique identifier for the note';
COMMENT ON COLUMN notes.user_id IS 'Foreign key to users table';
COMMENT ON COLUMN notes.title IS 'Note title';
COMMENT ON COLUMN notes.content IS 'Note content';
COMMENT ON COLUMN notes.tags IS 'Array of tags for categorization and filtering';
COMMENT ON COLUMN notes.linked_ticker IS 'Optional ticker symbol to link note to a specific asset';
COMMENT ON COLUMN notes.created_at IS 'Timestamp when note was created';
COMMENT ON COLUMN notes.updated_at IS 'Timestamp when note was last updated';

-- Indexes for performance
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_tags ON notes USING GIN(tags);
CREATE INDEX idx_notes_linked_ticker ON notes(linked_ticker) WHERE linked_ticker IS NOT NULL;
CREATE INDEX idx_notes_updated_at ON notes(updated_at DESC);

-- GIN index on tags array for efficient tag searching
-- Partial index on linked_ticker for efficient ticker-based lookups
-- Index on updated_at for sorting by most recently updated
