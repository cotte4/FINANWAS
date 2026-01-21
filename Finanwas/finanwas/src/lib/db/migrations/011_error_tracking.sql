-- Migration 011: Error Tracking & Monitoring System
-- Description: Create error_logs table for centralized error tracking
-- Author: Ralph Agent
-- Date: 2026-01-21

-- Error Logs Table
-- Stores application errors from both client and server for monitoring and debugging
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Error Classification
  level TEXT NOT NULL CHECK (level IN ('error', 'warning', 'critical')),
  source TEXT NOT NULL CHECK (source IN ('client', 'server', 'api')),

  -- Error Details
  message TEXT NOT NULL,
  stack_trace TEXT,
  error_code TEXT,

  -- Context Information
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  url TEXT,
  user_agent TEXT,
  ip_address TEXT,

  -- Additional Metadata
  metadata JSONB DEFAULT '{}',

  -- Tracking
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT valid_timestamps CHECK (resolved_at IS NULL OR resolved_at >= created_at)
);

-- Indexes for Performance
-- Primary query pattern: recent errors by level and source
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX idx_error_logs_level_created ON error_logs(level, created_at DESC);
CREATE INDEX idx_error_logs_source_created ON error_logs(source, created_at DESC);

-- User-specific errors
CREATE INDEX idx_error_logs_user_created ON error_logs(user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

-- Unresolved errors for dashboard
CREATE INDEX idx_error_logs_unresolved ON error_logs(created_at DESC)
  WHERE resolved = false;

-- URL pattern analysis
CREATE INDEX idx_error_logs_url ON error_logs(url)
  WHERE url IS NOT NULL;

-- Metadata JSONB index for flexible querying
CREATE INDEX idx_error_logs_metadata ON error_logs USING GIN(metadata);

-- Row Level Security (RLS) Policies
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Admin users can view all error logs
CREATE POLICY admin_view_all_errors ON error_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Service role can insert error logs (for server-side logging)
CREATE POLICY service_insert_errors ON error_logs
  FOR INSERT
  WITH CHECK (true);

-- Admin users can update errors (mark as resolved)
CREATE POLICY admin_update_errors ON error_logs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Comments for documentation
COMMENT ON TABLE error_logs IS 'Centralized error tracking and monitoring system';
COMMENT ON COLUMN error_logs.level IS 'Error severity: error, warning, or critical';
COMMENT ON COLUMN error_logs.source IS 'Error origin: client, server, or api';
COMMENT ON COLUMN error_logs.message IS 'Human-readable error message';
COMMENT ON COLUMN error_logs.stack_trace IS 'Full error stack trace for debugging';
COMMENT ON COLUMN error_logs.error_code IS 'Application-specific error code';
COMMENT ON COLUMN error_logs.metadata IS 'Additional context data (component, route, request data, etc.)';
COMMENT ON COLUMN error_logs.resolved IS 'Whether the error has been acknowledged and resolved';

-- Sample query for monitoring dashboard
COMMENT ON INDEX idx_error_logs_unresolved IS 'Optimizes queries for unresolved errors in admin dashboard';
