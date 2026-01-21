-- ============================================================================
-- FINANWAS MVP - Complete Database Setup
-- Run this entire script in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- STEP 1: Create all tables (9 migrations)
-- ============================================================================

-- 001: Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_login TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
ALTER TABLE users ADD CONSTRAINT check_user_role CHECK (role IN ('user', 'admin'));

-- 002: Invitation codes table
CREATE TABLE IF NOT EXISTS invitation_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  used_at timestamptz,
  used_by uuid REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_invitation_codes_code ON invitation_codes(code);
CREATE INDEX idx_invitation_codes_used_at ON invitation_codes(used_at);

-- 003: User profiles table
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

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_questionnaire_completed ON user_profiles(questionnaire_completed);

-- 004: Lesson progress table
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_slug TEXT NOT NULL,
  lesson_slug TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  CONSTRAINT lesson_progress_unique_user_course_lesson UNIQUE (user_id, course_slug, lesson_slug)
);

CREATE INDEX idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_course_slug ON lesson_progress(course_slug);
CREATE INDEX idx_lesson_progress_completed ON lesson_progress(completed);

-- 005: Tip views table
CREATE TABLE IF NOT EXISTS tip_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tip_id TEXT NOT NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  saved BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_tip_views_user_id ON tip_views(user_id);
CREATE INDEX idx_tip_views_tip_id ON tip_views(tip_id);
CREATE INDEX idx_tip_views_saved ON tip_views(saved);
CREATE INDEX idx_tip_views_viewed_at ON tip_views(viewed_at);

-- 006: Portfolio assets table
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

CREATE INDEX idx_portfolio_assets_user_id ON portfolio_assets(user_id);
CREATE INDEX idx_portfolio_assets_ticker ON portfolio_assets(ticker) WHERE ticker IS NOT NULL;
CREATE INDEX idx_portfolio_assets_type ON portfolio_assets(type);

-- 007: Savings goals table
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

CREATE INDEX idx_savings_goals_user_id ON savings_goals(user_id);
CREATE INDEX idx_savings_goals_completed_at ON savings_goals(completed_at);
CREATE INDEX idx_savings_goals_target_date ON savings_goals(target_date);

-- 008: Savings contributions table
CREATE TABLE IF NOT EXISTS savings_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES savings_goals(id) ON DELETE CASCADE,
  amount DECIMAL(20, 2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_savings_contributions_goal_id ON savings_contributions(goal_id);
CREATE INDEX idx_savings_contributions_date ON savings_contributions(date);

-- 009: Notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  linked_ticker TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_tags ON notes USING GIN(tags);
CREATE INDEX idx_notes_linked_ticker ON notes(linked_ticker) WHERE linked_ticker IS NOT NULL;
CREATE INDEX idx_notes_updated_at ON notes(updated_at DESC);

-- ============================================================================
-- STEP 2: Create initial invitation codes (Production)
-- ============================================================================

INSERT INTO invitation_codes (code) VALUES
  ('FINANWAS2026'),
  ('WELCOME2026'),
  ('BETA2026'),
  ('LANZAMIENTO'),
  ('INVERSION2026')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- STEP 3: Verify setup
-- ============================================================================

-- Check that all tables were created
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN (
    'users',
    'invitation_codes',
    'user_profiles',
    'lesson_progress',
    'tip_views',
    'portfolio_assets',
    'savings_goals',
    'savings_contributions',
    'notes'
  );

  RAISE NOTICE '✅ Created % out of 9 tables', table_count;

  IF table_count = 9 THEN
    RAISE NOTICE '✅ All tables created successfully!';
  ELSE
    RAISE WARNING '⚠️  Expected 9 tables but found %', table_count;
  END IF;
END $$;

-- Check invitation codes
SELECT '✅ Created ' || COUNT(*) || ' invitation codes' AS status
FROM invitation_codes;

-- List all available invitation codes
SELECT
  code,
  created_at,
  CASE
    WHEN used_at IS NULL THEN '✅ Available'
    ELSE '❌ Used'
  END AS status
FROM invitation_codes
ORDER BY created_at DESC;

-- ============================================================================
-- SETUP COMPLETE! 🎉
-- ============================================================================
--
-- Next steps:
-- 1. Verify all tables were created (should see "✅ All tables created successfully!")
-- 2. Note down your invitation codes
-- 3. Deploy your app to Vercel
-- 4. Test registration with one of the invitation codes
--
-- Invitation codes created:
-- - FINANWAS2026
-- - WELCOME2026
-- - BETA2026
-- - LANZAMIENTO
-- - INVERSION2026
--
-- ============================================================================
