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
COMMENT ON COLUMN portfolio_assets.type IS 'Asset type (Acción, ETF, Bono, Crypto, Efectivo, Fondo Común, Cedear, ON, Plazo Fijo, Otro)';
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
