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
