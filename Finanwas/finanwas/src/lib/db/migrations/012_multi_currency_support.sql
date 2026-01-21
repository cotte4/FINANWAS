-- Migration 012: Multi-Currency Support
-- Adds base currency preference to user profiles

-- Add preferred_currency column to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN preferred_currency VARCHAR(10) DEFAULT 'USD' NOT NULL;

-- Add comment explaining the column
COMMENT ON COLUMN user_profiles.preferred_currency IS 'User''s preferred base currency for portfolio aggregation (e.g., USD, ARS, EUR)';

-- Create index for faster queries (though not critical for this column)
CREATE INDEX idx_user_profiles_preferred_currency ON user_profiles(preferred_currency);
