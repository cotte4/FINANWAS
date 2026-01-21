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
