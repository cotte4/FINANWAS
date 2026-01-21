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
