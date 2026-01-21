-- Migration 016: Portfolio Performance Tracking
-- Description: Creates table for storing daily portfolio value snapshots for performance tracking

CREATE TABLE IF NOT EXISTS portfolio_performance_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  total_value DECIMAL(20, 2) NOT NULL,
  total_cost DECIMAL(20, 2) NOT NULL,
  total_gain_loss DECIMAL(20, 2) NOT NULL,
  gain_loss_percentage DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ARS',
  asset_breakdown JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_snapshot_date UNIQUE (user_id, snapshot_date)
);

-- Index for fast user lookups sorted by date (most recent first)
CREATE INDEX idx_portfolio_snapshots_user_date ON portfolio_performance_snapshots(user_id, snapshot_date DESC);

-- Index for date-based queries
CREATE INDEX idx_portfolio_snapshots_date ON portfolio_performance_snapshots(snapshot_date);

-- Comments for documentation
COMMENT ON TABLE portfolio_performance_snapshots IS 'Daily portfolio value snapshots for performance tracking';
COMMENT ON COLUMN portfolio_performance_snapshots.id IS 'Unique identifier for the snapshot';
COMMENT ON COLUMN portfolio_performance_snapshots.user_id IS 'Reference to the user who owns this portfolio';
COMMENT ON COLUMN portfolio_performance_snapshots.snapshot_date IS 'Date of the snapshot (one per day per user)';
COMMENT ON COLUMN portfolio_performance_snapshots.total_value IS 'Total portfolio value at snapshot time';
COMMENT ON COLUMN portfolio_performance_snapshots.total_cost IS 'Total invested amount (purchase cost)';
COMMENT ON COLUMN portfolio_performance_snapshots.total_gain_loss IS 'Total gain or loss (total_value - total_cost)';
COMMENT ON COLUMN portfolio_performance_snapshots.gain_loss_percentage IS 'Percentage gain or loss';
COMMENT ON COLUMN portfolio_performance_snapshots.currency IS 'Currency for the snapshot values';
COMMENT ON COLUMN portfolio_performance_snapshots.asset_breakdown IS 'Optional breakdown by asset type (JSONB)';
COMMENT ON COLUMN portfolio_performance_snapshots.created_at IS 'Timestamp when snapshot was created';
