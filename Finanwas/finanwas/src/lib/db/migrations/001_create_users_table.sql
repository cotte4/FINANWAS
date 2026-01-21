-- Migration: Create users table
-- Description: User accounts with authentication credentials

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_login TIMESTAMPTZ
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on role for admin queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Add check constraint for role values
ALTER TABLE users ADD CONSTRAINT check_user_role CHECK (role IN ('user', 'admin'));
