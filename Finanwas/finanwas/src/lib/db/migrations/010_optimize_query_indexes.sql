-- Migration 010: Optimize database query performance with additional indexes
-- Description: Add composite and missing indexes for frequently queried fields
-- Author: Ralph Agent
-- Date: 2026-01-21

-- Portfolio Assets Optimizations
-- Composite index for user portfolio queries (user_id + created_at for ordering)
CREATE INDEX IF NOT EXISTS idx_portfolio_assets_user_created
  ON portfolio_assets(user_id, created_at DESC);

-- Index on created_at for global portfolio queries
CREATE INDEX IF NOT EXISTS idx_portfolio_assets_created_at
  ON portfolio_assets(created_at DESC);

-- Index on updated_at for tracking recent changes
CREATE INDEX IF NOT EXISTS idx_portfolio_assets_updated_at
  ON portfolio_assets(updated_at DESC);

-- Composite index for price update queries (ticker + current_price_updated_at)
CREATE INDEX IF NOT EXISTS idx_portfolio_assets_ticker_price_updated
  ON portfolio_assets(ticker, current_price_updated_at DESC)
  WHERE ticker IS NOT NULL;

-- Savings Goals Optimizations
-- Composite index for user goals queries (user_id + created_at for ordering)
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_created
  ON savings_goals(user_id, created_at DESC);

-- Index on created_at for global goal queries
CREATE INDEX IF NOT EXISTS idx_savings_goals_created_at
  ON savings_goals(created_at DESC);

-- Index on updated_at for tracking recent changes
CREATE INDEX IF NOT EXISTS idx_savings_goals_updated_at
  ON savings_goals(updated_at DESC);

-- Composite index for active goals (user_id + completed_at NULL)
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_active
  ON savings_goals(user_id, target_date)
  WHERE completed_at IS NULL;

-- Savings Contributions Optimizations
-- Composite index for goal contributions queries (goal_id + date for ordering)
CREATE INDEX IF NOT EXISTS idx_savings_contributions_goal_date
  ON savings_contributions(goal_id, date DESC);

-- Index on created_at for tracking recent contributions
CREATE INDEX IF NOT EXISTS idx_savings_contributions_created_at
  ON savings_contributions(created_at DESC);

-- Lesson Progress Optimizations
-- Composite index for user progress queries (user_id + course_slug + completed)
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_course_completed
  ON lesson_progress(user_id, course_slug, completed);

-- Composite index for completed lessons ordering (user_id + completed_at)
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_completed_at
  ON lesson_progress(user_id, completed_at DESC NULLS LAST);

-- Notes Optimizations
-- Composite index for user notes with recent updates (user_id + updated_at)
CREATE INDEX IF NOT EXISTS idx_notes_user_updated
  ON notes(user_id, updated_at DESC);

-- Index on created_at for chronological sorting
CREATE INDEX IF NOT EXISTS idx_notes_created_at
  ON notes(created_at DESC);

-- Users Optimizations
-- Index on created_at for user registration analytics
CREATE INDEX IF NOT EXISTS idx_users_created_at
  ON users(created_at DESC);

-- Index on last_login for activity tracking
CREATE INDEX IF NOT EXISTS idx_users_last_login
  ON users(last_login DESC)
  WHERE last_login IS NOT NULL;

-- User Profiles Optimizations
-- Composite index for profile completion analytics (questionnaire_completed + questionnaire_completed_at)
CREATE INDEX IF NOT EXISTS idx_user_profiles_completion
  ON user_profiles(questionnaire_completed, questionnaire_completed_at DESC);

-- Index on updated_at for tracking profile changes
CREATE INDEX IF NOT EXISTS idx_user_profiles_updated_at
  ON user_profiles(updated_at DESC);

-- Invitation Codes Optimizations
-- Index on created_at for code generation analytics
CREATE INDEX IF NOT EXISTS idx_invitation_codes_created_at
  ON invitation_codes(created_at DESC);

-- Composite index for unused codes (used_at NULL + created_at)
CREATE INDEX IF NOT EXISTS idx_invitation_codes_unused
  ON invitation_codes(created_at DESC)
  WHERE used_at IS NULL;

-- Comments for documentation
COMMENT ON INDEX idx_portfolio_assets_user_created IS 'Composite index for user portfolio queries ordered by creation date';
COMMENT ON INDEX idx_savings_goals_user_created IS 'Composite index for user savings goals ordered by creation date';
COMMENT ON INDEX idx_lesson_progress_user_course_completed IS 'Composite index for course progress queries with completion status';
COMMENT ON INDEX idx_notes_user_updated IS 'Composite index for user notes ordered by last update';
COMMENT ON INDEX idx_savings_goals_user_active IS 'Partial index for active (incomplete) user goals';
COMMENT ON INDEX idx_invitation_codes_unused IS 'Partial index for unused invitation codes';
