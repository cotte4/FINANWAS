/**
 * Error Tracking & Monitoring Logger
 *
 * Centralized error logging system that stores errors in the database
 * for monitoring and debugging. Supports both server-side and client-side errors.
 */

import { createClient } from '@supabase/supabase-js';

// Types
export type ErrorLevel = 'error' | 'warning' | 'critical';
export type ErrorSource = 'client' | 'server' | 'api';

export interface ErrorLogData {
  level: ErrorLevel;
  source: ErrorSource;
  message: string;
  stackTrace?: string;
  errorCode?: string;
  userId?: string;
  url?: string;
  userAgent?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

export interface ErrorLogResponse {
  id: string;
  level: ErrorLevel;
  source: ErrorSource;
  message: string;
  stack_trace: string | null;
  error_code: string | null;
  user_id: string | null;
  url: string | null;
  user_agent: string | null;
  ip_address: string | null;
  metadata: Record<string, any>;
  resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
}

/**
 * Log an error to the database
 *
 * This function should be called from server-side code only.
 * For client-side errors, use the /api/monitoring/log endpoint.
 */
export async function logError(data: ErrorLogData): Promise<void> {
  try {
    // Validate required environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[Logger] Missing Supabase configuration');
      return;
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert error log
    const { error } = await supabase
      .from('error_logs')
      .insert({
        level: data.level,
        source: data.source,
        message: truncateString(data.message, 5000),
        stack_trace: data.stackTrace ? truncateString(data.stackTrace, 10000) : null,
        error_code: data.errorCode || null,
        user_id: data.userId || null,
        url: data.url ? truncateString(data.url, 2048) : null,
        user_agent: data.userAgent ? truncateString(data.userAgent, 500) : null,
        ip_address: data.ipAddress || null,
        metadata: data.metadata || {},
      });

    if (error) {
      console.error('[Logger] Failed to insert error log:', error);
    }
  } catch (err) {
    // Don't let logging errors crash the application
    console.error('[Logger] Error in logError function:', err);
  }
}

/**
 * Helper function to log API errors
 */
export async function logApiError(
  error: Error | unknown,
  context: {
    endpoint: string;
    method: string;
    userId?: string;
    requestData?: any;
    statusCode?: number;
  }
): Promise<void> {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stackTrace = error instanceof Error ? error.stack : undefined;

  await logError({
    level: context.statusCode === 500 || !context.statusCode ? 'critical' : 'error',
    source: 'api',
    message: `${context.method} ${context.endpoint}: ${errorMessage}`,
    stackTrace,
    errorCode: context.statusCode?.toString(),
    userId: context.userId,
    url: context.endpoint,
    metadata: {
      method: context.method,
      requestData: context.requestData,
      statusCode: context.statusCode,
    },
  });
}

/**
 * Helper function to log server errors
 */
export async function logServerError(
  error: Error | unknown,
  context: {
    location: string;
    userId?: string;
    metadata?: Record<string, any>;
  }
): Promise<void> {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stackTrace = error instanceof Error ? error.stack : undefined;

  await logError({
    level: 'error',
    source: 'server',
    message: `${context.location}: ${errorMessage}`,
    stackTrace,
    userId: context.userId,
    metadata: {
      location: context.location,
      ...context.metadata,
    },
  });
}

/**
 * Truncate string to maximum length
 */
function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Console wrapper that logs to both console and database
 */
export const logger = {
  error: (message: string, error?: Error, metadata?: Record<string, any>) => {
    console.error(message, error);

    if (typeof window === 'undefined') {
      // Server-side: log to database
      logError({
        level: 'error',
        source: 'server',
        message,
        stackTrace: error?.stack,
        metadata,
      }).catch(console.error);
    }
  },

  warning: (message: string, metadata?: Record<string, any>) => {
    console.warn(message);

    if (typeof window === 'undefined') {
      // Server-side: log to database
      logError({
        level: 'warning',
        source: 'server',
        message,
        metadata,
      }).catch(console.error);
    }
  },

  critical: (message: string, error?: Error, metadata?: Record<string, any>) => {
    console.error('[CRITICAL]', message, error);

    if (typeof window === 'undefined') {
      // Server-side: log to database
      logError({
        level: 'critical',
        source: 'server',
        message,
        stackTrace: error?.stack,
        metadata,
      }).catch(console.error);
    }
  },
};
