-- ============================================================================
-- 001_create_users_table.sql
-- ============================================================================

-- Migration: Create users table
-- Description: User accounts with authentication credentials

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_login TIMESTAMPTZ
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on role for admin queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Add check constraint for role values
ALTER TABLE users ADD CONSTRAINT check_user_role CHECK (role IN ('user', 'admin'));


-- ============================================================================
-- 002_create_invitation_codes_table.sql
-- ============================================================================

-- Migration: Create invitation_codes table
-- Purpose: Store invitation codes for registration gating
-- Created: 2026-01-20

CREATE TABLE IF NOT EXISTS invitation_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  used_at timestamptz,
  used_by uuid REFERENCES users(id) ON DELETE SET NULL
);

-- Create index on code for fast lookups during validation
CREATE INDEX idx_invitation_codes_code ON invitation_codes(code);

-- Create index on used_at to quickly find unused codes
CREATE INDEX idx_invitation_codes_used_at ON invitation_codes(used_at);

-- Add comment to table
COMMENT ON TABLE invitation_codes IS 'Stores invitation codes for user registration gating';
COMMENT ON COLUMN invitation_codes.code IS 'Unique invitation code string';
COMMENT ON COLUMN invitation_codes.used_at IS 'Timestamp when code was used (NULL if unused)';
COMMENT ON COLUMN invitation_codes.used_by IS 'Reference to user who used this code';


-- ============================================================================
-- 003_create_user_profiles_table.sql
-- ============================================================================

-- Migration: Create user_profiles table
-- Purpose: Store user questionnaire data and financial profile information
-- Created: 2026-01-20

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  country text,
  knowledge_level text,
  main_goal text,
  risk_tolerance text,
  has_debt boolean,
  has_emergency_fund boolean,
  has_investments boolean,
  income_range text,
  expense_range text,
  investment_horizon text,
  questionnaire_completed boolean DEFAULT false NOT NULL,
  questionnaire_completed_at timestamptz,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create index on user_id for fast lookups
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- Create index on questionnaire_completed for filtering
CREATE INDEX idx_user_profiles_questionnaire_completed ON user_profiles(questionnaire_completed);

-- Add comments for documentation
COMMENT ON TABLE user_profiles IS 'Stores user financial profile data from questionnaire';
COMMENT ON COLUMN user_profiles.user_id IS 'Foreign key to users table (one-to-one relationship)';
COMMENT ON COLUMN user_profiles.knowledge_level IS 'User financial knowledge level (Principiante, Intermedio, Avanzado)';
COMMENT ON COLUMN user_profiles.main_goal IS 'Primary financial goal (Ahorrar, Invertir, Salir de deudas, Jubilarme, Aprender)';
COMMENT ON COLUMN user_profiles.risk_tolerance IS 'Risk tolerance level (Conservador, Moderado, Agresivo)';
COMMENT ON COLUMN user_profiles.income_range IS 'Monthly income range';
COMMENT ON COLUMN user_profiles.expense_range IS 'Monthly expense range';
COMMENT ON COLUMN user_profiles.investment_horizon IS 'Investment time horizon (Corto plazo, Mediano plazo, Largo plazo)';
COMMENT ON COLUMN user_profiles.questionnaire_completed IS 'Flag indicating if user has completed the financial questionnaire';
COMMENT ON COLUMN user_profiles.questionnaire_completed_at IS 'Timestamp when questionnaire was completed';


-- ============================================================================
-- 004_create_lesson_progress_table.sql
-- ============================================================================

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


-- ============================================================================
-- 005_create_tip_views_table.sql
-- ============================================================================

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


-- ============================================================================
-- 006_create_portfolio_assets_table.sql
-- ============================================================================

-- Migration 006: Create portfolio_assets table
-- Description: Stores user portfolio assets (stocks, ETFs, bonds, crypto, etc.)

CREATE TABLE IF NOT EXISTS portfolio_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  ticker TEXT,
  name TEXT NOT NULL,
  quantity DECIMAL(20, 8) NOT NULL CHECK (quantity > 0),
  purchase_price DECIMAL(20, 2) NOT NULL CHECK (purchase_price > 0),
  purchase_date DATE NOT NULL,
  currency TEXT NOT NULL,
  current_price DECIMAL(20, 2),
  current_price_updated_at TIMESTAMPTZ,
  price_source TEXT DEFAULT 'manual',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user lookups
CREATE INDEX idx_portfolio_assets_user_id ON portfolio_assets(user_id);

-- Index for ticker lookups (useful for price refreshes)
CREATE INDEX idx_portfolio_assets_ticker ON portfolio_assets(ticker) WHERE ticker IS NOT NULL;

-- Index for asset type filtering
CREATE INDEX idx_portfolio_assets_type ON portfolio_assets(type);

-- Comments for documentation
COMMENT ON TABLE portfolio_assets IS 'Stores user portfolio assets including stocks, ETFs, bonds, crypto, and other investments';
COMMENT ON COLUMN portfolio_assets.id IS 'Unique identifier for the asset';
COMMENT ON COLUMN portfolio_assets.user_id IS 'Reference to the user who owns this asset';
COMMENT ON COLUMN portfolio_assets.type IS 'Asset type (Acción, ETF, Bono, Crypto, Efectivo, Otro)';
COMMENT ON COLUMN portfolio_assets.ticker IS 'Ticker symbol (optional, for stocks/ETFs)';
COMMENT ON COLUMN portfolio_assets.name IS 'Asset name or description';
COMMENT ON COLUMN portfolio_assets.quantity IS 'Number of units owned';
COMMENT ON COLUMN portfolio_assets.purchase_price IS 'Price per unit at purchase';
COMMENT ON COLUMN portfolio_assets.purchase_date IS 'Date of purchase';
COMMENT ON COLUMN portfolio_assets.currency IS 'Currency (ARS, USD, etc.)';
COMMENT ON COLUMN portfolio_assets.current_price IS 'Current price per unit';
COMMENT ON COLUMN portfolio_assets.current_price_updated_at IS 'Timestamp of last price update';
COMMENT ON COLUMN portfolio_assets.price_source IS 'Source of current price (manual, yahoo, api)';
COMMENT ON COLUMN portfolio_assets.notes IS 'User notes about the asset';
COMMENT ON COLUMN portfolio_assets.created_at IS 'Timestamp when record was created';
COMMENT ON COLUMN portfolio_assets.updated_at IS 'Timestamp when record was last updated';


-- ============================================================================
-- 007_create_savings_goals_table.sql
-- ============================================================================

-- Create savings_goals table
-- This table stores user savings goals with target amounts and dates

CREATE TABLE IF NOT EXISTS savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount DECIMAL(20, 2) NOT NULL CHECK (target_amount > 0),
  current_amount DECIMAL(20, 2) DEFAULT 0 CHECK (current_amount >= 0),
  currency TEXT NOT NULL,
  target_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create indexes for efficient queries
CREATE INDEX idx_savings_goals_user_id ON savings_goals(user_id);
CREATE INDEX idx_savings_goals_completed_at ON savings_goals(completed_at);
CREATE INDEX idx_savings_goals_target_date ON savings_goals(target_date);

-- Add comments for documentation
COMMENT ON TABLE savings_goals IS 'User savings goals with target amounts and dates';
COMMENT ON COLUMN savings_goals.id IS 'Unique identifier for the goal';
COMMENT ON COLUMN savings_goals.user_id IS 'Reference to the user who owns this goal';
COMMENT ON COLUMN savings_goals.name IS 'Name or description of the savings goal';
COMMENT ON COLUMN savings_goals.target_amount IS 'Target amount to save';
COMMENT ON COLUMN savings_goals.current_amount IS 'Current saved amount (calculated from contributions)';
COMMENT ON COLUMN savings_goals.currency IS 'Currency code (e.g., ARS, USD)';
COMMENT ON COLUMN savings_goals.target_date IS 'Optional target date to reach the goal';
COMMENT ON COLUMN savings_goals.created_at IS 'Timestamp when the goal was created';
COMMENT ON COLUMN savings_goals.updated_at IS 'Timestamp when the goal was last updated';
COMMENT ON COLUMN savings_goals.completed_at IS 'Timestamp when the goal was completed (reached target)';


-- ============================================================================
-- 008_create_savings_contributions_table.sql
-- ============================================================================

-- Create savings_contributions table
-- This table stores individual contributions made towards savings goals

CREATE TABLE IF NOT EXISTS savings_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES savings_goals(id) ON DELETE CASCADE,
  amount DECIMAL(20, 2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX idx_savings_contributions_goal_id ON savings_contributions(goal_id);
CREATE INDEX idx_savings_contributions_date ON savings_contributions(date);

-- Add comments for documentation
COMMENT ON TABLE savings_contributions IS 'Individual contributions made towards savings goals';
COMMENT ON COLUMN savings_contributions.id IS 'Unique identifier for the contribution';
COMMENT ON COLUMN savings_contributions.goal_id IS 'Reference to the savings goal this contribution is for';
COMMENT ON COLUMN savings_contributions.amount IS 'Amount contributed';
COMMENT ON COLUMN savings_contributions.date IS 'Date of the contribution';
COMMENT ON COLUMN savings_contributions.notes IS 'Optional notes about the contribution';
COMMENT ON COLUMN savings_contributions.created_at IS 'Timestamp when the contribution was recorded';


-- ============================================================================
-- 009_create_notes_table.sql
-- ============================================================================

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


