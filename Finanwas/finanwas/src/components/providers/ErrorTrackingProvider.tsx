'use client';

import { useEffect } from 'react';
import { initializeErrorTracking } from '@/lib/monitoring/client-logger';

/**
 * Error Tracking Provider
 *
 * Initializes global error tracking for the application.
 * Should be mounted once in the root layout.
 */
export function ErrorTrackingProvider() {
  useEffect(() => {
    initializeErrorTracking();
  }, []);

  return null;
}
