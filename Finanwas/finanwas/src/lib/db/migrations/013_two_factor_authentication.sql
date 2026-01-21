-- Migration 013: Two-Factor Authentication (2FA)
-- Adds TOTP-based 2FA support to the users table

-- Add 2FA fields to users table
ALTER TABLE users
ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN two_factor_secret VARCHAR(32) NULL, -- Base32 encoded TOTP secret
ADD COLUMN two_factor_backup_codes TEXT[] NULL; -- Array of hashed backup codes

-- Add index for querying 2FA enabled users
CREATE INDEX idx_users_two_factor_enabled ON users(two_factor_enabled) WHERE two_factor_enabled = TRUE;

-- Add comment for documentation
COMMENT ON COLUMN users.two_factor_enabled IS 'Whether 2FA is enabled for this user';
COMMENT ON COLUMN users.two_factor_secret IS 'Base32-encoded TOTP secret for authenticator apps';
COMMENT ON COLUMN users.two_factor_backup_codes IS 'Array of bcrypt-hashed backup codes for account recovery';
