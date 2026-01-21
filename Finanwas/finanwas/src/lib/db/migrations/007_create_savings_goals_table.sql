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
