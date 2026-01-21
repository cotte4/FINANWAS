/**
 * Client-side Error Tracking
 *
 * Provides utilities for tracking errors in the browser.
 * Sends error logs to the server-side logging API.
 */

import { ErrorLevel, ErrorSource } from './logger';

interface ClientErrorLogData {
  level: ErrorLevel;
  source: ErrorSource;
  message: string;
  stackTrace?: string;
  errorCode?: string;
  url?: string;
  metadata?: Record<string, any>;
}

/**
 * Log an error from the client-side
 */
export async function logClientError(data: ClientErrorLogData): Promise<void> {
  try {
    await fetch('/api/monitoring/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        level: data.level,
        source: data.source,
        message: data.message,
        stackTrace: data.stackTrace,
        errorCode: data.errorCode,
        url: data.url || window.location.href,
        metadata: {
          ...data.metadata,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        },
      }),
    });
  } catch (err) {
    // Don't let logging errors disrupt the user experience
    console.error('[Client Logger] Failed to log error:', err);
  }
}

/**
 * Initialize global error handlers
 */
export function initializeErrorTracking(): void {
  // Only run in browser
  if (typeof window === 'undefined') {
    return;
  }

  // Track unhandled errors
  window.addEventListener('error', (event) => {
    logClientError({
      level: 'error',
      source: 'client',
      message: event.message || 'Unhandled error',
      stackTrace: event.error?.stack,
      url: window.location.href,
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logClientError({
      level: 'error',
      source: 'client',
      message: `Unhandled promise rejection: ${event.reason}`,
      stackTrace: event.reason?.stack,
      url: window.location.href,
      metadata: {
        reason: String(event.reason),
      },
    });
  });

  // Track console errors (wrap console.error)
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    // Call original console.error
    originalConsoleError.apply(console, args);

    // Log to monitoring if it's an Error object
    if (args[0] instanceof Error) {
      logClientError({
        level: 'error',
        source: 'client',
        message: args[0].message,
        stackTrace: args[0].stack,
        url: window.location.href,
        metadata: {
          consoleError: true,
        },
      });
    }
  };
}

/**
 * Client-side logger wrapper
 */
export const clientLogger = {
  error: (message: string, error?: Error, metadata?: Record<string, any>) => {
    console.error(message, error);

    logClientError({
      level: 'error',
      source: 'client',
      message,
      stackTrace: error?.stack,
      metadata,
    });
  },

  warning: (message: string, metadata?: Record<string, any>) => {
    console.warn(message);

    logClientError({
      level: 'warning',
      source: 'client',
      message,
      metadata,
    });
  },

  critical: (message: string, error?: Error, metadata?: Record<string, any>) => {
    console.error('[CRITICAL]', message, error);

    logClientError({
      level: 'critical',
      source: 'client',
      message,
      stackTrace: error?.stack,
      metadata,
    });
  },
};
