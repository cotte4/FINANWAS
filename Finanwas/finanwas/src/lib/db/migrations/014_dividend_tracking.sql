-- Migration 014: Add Dividend Tracking
-- Description: Track dividend payments and reinvestment for income-focused investors

-- Create dividend_payments table
CREATE TABLE IF NOT EXISTS dividend_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES portfolio_assets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL,
  amount_per_share DECIMAL(20, 6) NOT NULL CHECK (amount_per_share >= 0),
  total_amount DECIMAL(20, 2) NOT NULL CHECK (total_amount >= 0),
  currency TEXT NOT NULL,
  payment_type TEXT NOT NULL DEFAULT 'cash', -- cash, stock, drip (dividend reinvestment)
  shares_received DECIMAL(20, 8), -- For stock dividends or DRIP
  reinvested BOOLEAN DEFAULT false,
  withholding_tax DECIMAL(20, 2) DEFAULT 0, -- Tax withheld at source
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add dividend-related fields to portfolio_assets
ALTER TABLE portfolio_assets
  ADD COLUMN IF NOT EXISTS dividend_yield DECIMAL(5, 2), -- Annual dividend yield percentage
  ADD COLUMN IF NOT EXISTS dividend_frequency TEXT, -- quarterly, monthly, annual, semi-annual
  ADD COLUMN IF NOT EXISTS next_dividend_date DATE, -- Expected next dividend payment
  ADD COLUMN IF NOT EXISTS last_dividend_amount DECIMAL(20, 6); -- Last dividend per share

-- Indexes for efficient queries
CREATE INDEX idx_dividend_payments_asset_id ON dividend_payments(asset_id);
CREATE INDEX idx_dividend_payments_user_id ON dividend_payments(user_id);
CREATE INDEX idx_dividend_payments_payment_date ON dividend_payments(payment_date DESC);
CREATE INDEX idx_dividend_payments_user_date ON dividend_payments(user_id, payment_date DESC);

-- Composite index for user portfolio dividend queries
CREATE INDEX idx_dividend_payments_user_asset_date ON dividend_payments(user_id, asset_id, payment_date DESC);

-- Comments for documentation
COMMENT ON TABLE dividend_payments IS 'Tracks dividend payments received from portfolio assets';
COMMENT ON COLUMN dividend_payments.id IS 'Unique identifier for the dividend payment';
COMMENT ON COLUMN dividend_payments.asset_id IS 'Reference to the portfolio asset that paid the dividend';
COMMENT ON COLUMN dividend_payments.user_id IS 'Reference to the user who owns the asset';
COMMENT ON COLUMN dividend_payments.payment_date IS 'Date when dividend was paid';
COMMENT ON COLUMN dividend_payments.amount_per_share IS 'Dividend amount per share';
COMMENT ON COLUMN dividend_payments.total_amount IS 'Total dividend amount received';
COMMENT ON COLUMN dividend_payments.currency IS 'Currency of the dividend payment';
COMMENT ON COLUMN dividend_payments.payment_type IS 'Type of dividend: cash, stock, or drip (dividend reinvestment)';
COMMENT ON COLUMN dividend_payments.shares_received IS 'Number of shares received (for stock dividends or DRIP)';
COMMENT ON COLUMN dividend_payments.reinvested IS 'Whether dividend was reinvested';
COMMENT ON COLUMN dividend_payments.withholding_tax IS 'Tax withheld at source';
COMMENT ON COLUMN dividend_payments.notes IS 'User notes about the dividend payment';
COMMENT ON COLUMN dividend_payments.created_at IS 'Timestamp when record was created';
COMMENT ON COLUMN dividend_payments.updated_at IS 'Timestamp when record was last updated';

COMMENT ON COLUMN portfolio_assets.dividend_yield IS 'Annual dividend yield percentage';
COMMENT ON COLUMN portfolio_assets.dividend_frequency IS 'Dividend payment frequency (quarterly, monthly, annual, semi-annual)';
COMMENT ON COLUMN portfolio_assets.next_dividend_date IS 'Expected next dividend payment date';
COMMENT ON COLUMN portfolio_assets.last_dividend_amount IS 'Last dividend amount per share';
