# Error Tracking & Monitoring System

**Last Updated**: 2026-01-21
**Status**: ✅ Production Ready

## Overview

Finanwas includes a self-hosted, database-backed error tracking and monitoring system. All application errors (client-side, server-side, and API errors) are automatically logged to the database for monitoring, debugging, and analysis.

## Features

- ✅ **Centralized Error Logging**: All errors stored in PostgreSQL (Supabase)
- ✅ **Multi-Source Tracking**: Client, server, and API errors
- ✅ **Severity Levels**: Critical, error, and warning classifications
- ✅ **Admin Dashboard**: Web interface for viewing and managing errors
- ✅ **Automatic Capture**: Global error handlers for unhandled errors
- ✅ **Stack Traces**: Full error stack traces for debugging
- ✅ **Context Metadata**: URL, user agent, IP address, custom metadata
- ✅ **Error Resolution**: Mark errors as resolved with timestamps
- ✅ **Zero External Dependencies**: No third-party services required
- ✅ **Privacy-First**: All data stays in your database

## Architecture

### Database Schema

```sql
CREATE TABLE error_logs (
  id UUID PRIMARY KEY,
  level TEXT NOT NULL,              -- 'error' | 'warning' | 'critical'
  source TEXT NOT NULL,             -- 'client' | 'server' | 'api'
  message TEXT NOT NULL,            -- Error message
  stack_trace TEXT,                 -- Full stack trace
  error_code TEXT,                  -- HTTP status code or custom code
  user_id UUID,                     -- Associated user (if authenticated)
  url TEXT,                         -- Request URL
  user_agent TEXT,                  -- Browser user agent
  ip_address TEXT,                  -- Client IP address
  metadata JSONB,                   -- Additional context data
  resolved BOOLEAN,                 -- Resolution status
  resolved_at TIMESTAMP,            -- When marked as resolved
  resolved_by UUID,                 -- Admin who resolved it
  created_at TIMESTAMP              -- When error occurred
);
```

### Components

1. **Server-Side Logger** (`src/lib/monitoring/logger.ts`)
   - Main logging functions
   - Database error storage
   - Helper functions for API and server errors

2. **Client-Side Logger** (`src/lib/monitoring/client-logger.ts`)
   - Browser error tracking
   - Global error handlers
   - Sends errors to API endpoint

3. **Logging API** (`src/app/api/monitoring/log/route.ts`)
   - Receives client-side errors
   - Validates and stores in database

4. **Admin API** (`src/app/api/admin/errors/route.ts`)
   - Fetch error logs with filters
   - Mark errors as resolved
   - Get error statistics

5. **Admin Dashboard** (`src/app/admin/errores/page.tsx`)
   - View errors with filtering
   - Statistics overview
   - Mark errors as resolved

## Usage

### Client-Side Error Tracking

Errors are automatically tracked using global handlers:

```typescript
// Automatic tracking (already set up in layout.tsx)
import { ErrorTrackingProvider } from '@/components/providers/ErrorTrackingProvider';

// In your root layout:
<ErrorTrackingProvider />
```

Manual error logging:

```typescript
import { clientLogger } from '@/lib/monitoring/client-logger';

try {
  // Your code
} catch (error) {
  clientLogger.error('Failed to process data', error, {
    component: 'MyComponent',
    action: 'processData',
  });
}
```

### Server-Side Error Tracking

```typescript
import { logError, logServerError } from '@/lib/monitoring/logger';

// Simple error logging
await logError({
  level: 'error',
  source: 'server',
  message: 'Database connection failed',
  stackTrace: error.stack,
  metadata: { database: 'postgres' },
});

// Or use the helper:
await logServerError(error, {
  location: 'auth/login',
  userId: 'user-123',
  metadata: { attemptedEmail: 'user@example.com' },
});
```

### API Error Tracking

```typescript
import { logApiError } from '@/lib/monitoring/logger';

export async function POST(request: NextRequest) {
  let userId: string | undefined;
  let requestBody: any;

  try {
    // Your API logic
    userId = payload.userId;
    requestBody = await request.json();

    // ... rest of your code

  } catch (error) {
    console.error('Error in POST /api/example:', error);

    // Log to monitoring system
    await logApiError(error, {
      endpoint: '/api/example',
      method: 'POST',
      userId,
      requestData: requestBody,
      statusCode: 500,
    });

    return NextResponse.json(
      { error: 'Error message' },
      { status: 500 }
    );
  }
}
```

## Admin Dashboard

### Accessing the Dashboard

1. Navigate to `/admin/errores` (requires admin role)
2. View error statistics and recent errors
3. Filter by level, source, or resolution status
4. Click on errors to see details and stack traces
5. Mark errors as resolved

### Dashboard Features

- **Statistics Cards**: Total errors, unresolved, critical, by source
- **Filters**: Level (critical/error/warning), source (client/server/api), resolved status
- **Error Details**: Message, timestamp, stack trace, URL, metadata
- **Resolution Tracking**: Mark errors as resolved with timestamp

## Error Levels

| Level | Description | When to Use |
|-------|-------------|-------------|
| `critical` | System-breaking errors | Database failures, auth system down, critical service unavailable |
| `error` | Functional errors | API request failures, data processing errors, user action failures |
| `warning` | Non-breaking issues | Deprecated API usage, potential problems, recoverable errors |

## Error Sources

| Source | Description | Examples |
|--------|-------------|----------|
| `client` | Browser/frontend errors | React component errors, fetch failures, unhandled promise rejections |
| `server` | Server-side errors | SSR errors, background job failures, server startup errors |
| `api` | API endpoint errors | Route handler errors, middleware errors, validation failures |

## Migration

### Running the Migration

```bash
# Apply the migration to your Supabase database
# Run the SQL from src/lib/db/migrations/011_error_tracking.sql
# in your Supabase SQL editor
```

The migration creates:
- `error_logs` table with all necessary columns
- Indexes for optimal query performance
- Row Level Security (RLS) policies
- Comments for documentation

## Performance Considerations

### Database Indexes

The system includes optimized indexes for common queries:

```sql
-- Recent errors
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at DESC);

-- Filter by level and source
CREATE INDEX idx_error_logs_level_created ON error_logs(level, created_at DESC);
CREATE INDEX idx_error_logs_source_created ON error_logs(source, created_at DESC);

-- Unresolved errors (for dashboard)
CREATE INDEX idx_error_logs_unresolved ON error_logs(created_at DESC)
  WHERE resolved = false;

-- Metadata queries
CREATE INDEX idx_error_logs_metadata ON error_logs USING GIN(metadata);
```

### Automatic Cleanup (Recommended)

Add a background job to clean up old resolved errors:

```sql
-- Delete resolved errors older than 90 days
DELETE FROM error_logs
WHERE resolved = true
  AND resolved_at < NOW() - INTERVAL '90 days';

-- Delete old errors (>6 months) to prevent table bloat
DELETE FROM error_logs
WHERE created_at < NOW() - INTERVAL '6 months';
```

## Security & Privacy

### Row Level Security (RLS)

- Only admins can view error logs
- Service role can insert errors
- Only admins can update (resolve) errors
- User IDs are stored but errors are visible only to admins

### Data Sanitization

- Error messages are truncated to 5,000 characters
- Stack traces are truncated to 10,000 characters
- URLs are truncated to 2,048 characters
- User agents are truncated to 500 characters

### Sensitive Data

**Important**: Avoid logging sensitive data in error messages or metadata:
- Passwords
- API keys
- Credit card numbers
- Personal identification numbers
- Authentication tokens

## Monitoring Best Practices

### What to Monitor

1. **Error Rate Trends**: Track daily/weekly error counts
2. **Critical Errors**: Investigate immediately
3. **Recurring Errors**: Same error appearing multiple times
4. **User-Specific Errors**: Errors affecting specific users
5. **Error Patterns**: Similar errors from same URL/component

### Alert Thresholds (Recommended)

- **Critical errors**: Alert immediately (Slack, email)
- **Error rate spike**: >10 errors/minute
- **Unresolved critical errors**: >5 unresolved critical errors

### Regular Maintenance

- Review unresolved errors weekly
- Clean up old resolved errors monthly
- Analyze error trends for product improvements
- Update error handling based on common patterns

## Migration to External Services (Optional)

This self-hosted solution can be migrated to services like Sentry or LogRocket in the future:

### Sentry Integration (Future)

```typescript
import * as Sentry from '@sentry/nextjs';

// Replace logError calls with:
Sentry.captureException(error, {
  level: 'error',
  tags: { source: 'api' },
  extra: metadata,
});
```

### Advantages of Self-Hosted Solution

- ✅ Zero monthly costs
- ✅ Complete data ownership
- ✅ No external dependencies
- ✅ Customizable to your needs
- ✅ Privacy-compliant (GDPR, CCPA)

### When to Consider Migration

- High error volume (>10,000 errors/day)
- Need advanced features (session replay, performance monitoring)
- Want integrated alerting/notifications
- Need distributed tracing

## API Reference

### POST /api/monitoring/log

Log an error from the client-side.

**Request Body**:
```json
{
  "level": "error",
  "source": "client",
  "message": "Failed to load data",
  "stackTrace": "Error: Failed...\n  at Component...",
  "errorCode": "FETCH_ERROR",
  "url": "/dashboard",
  "metadata": {
    "component": "Dashboard",
    "action": "loadData"
  }
}
```

**Response**: `{ "success": true }`

### GET /api/admin/errors

Fetch error logs (admin only).

**Query Parameters**:
- `level`: Filter by level (error, warning, critical)
- `source`: Filter by source (client, server, api)
- `resolved`: Filter by resolution status (true, false)
- `limit`: Maximum number of errors (default: 100, max: 500)

**Response**:
```json
{
  "errors": [...],
  "stats": {
    "total": 1250,
    "unresolved": 42,
    "critical": 5,
    "byLevel": { "error": 1000, "warning": 200, "critical": 50 },
    "bySource": { "client": 800, "server": 250, "api": 200 }
  }
}
```

### PATCH /api/admin/errors

Mark an error as resolved (admin only).

**Request Body**:
```json
{
  "errorId": "uuid",
  "resolved": true
}
```

**Response**: `{ "success": true }`

## Troubleshooting

### Errors Not Being Logged

1. Check Supabase connection:
   - Verify `NEXT_PUBLIC_SUPABASE_URL` is set
   - Verify `SUPABASE_SERVICE_ROLE_KEY` is set

2. Check migration was applied:
   - Run migration SQL in Supabase SQL editor
   - Verify `error_logs` table exists

3. Check RLS policies:
   - Service role should bypass RLS
   - Verify policies are created

### Dashboard Not Loading

1. Verify user is admin:
   - Check `users.is_admin = true` in database

2. Check API endpoint:
   - Test `/api/admin/errors` directly
   - Check browser console for errors

### High Error Volume

1. Identify error source:
   - Use dashboard filters
   - Check error patterns

2. Fix root cause:
   - Review stack traces
   - Update code to handle edge cases

3. Clean up old errors:
   - Run cleanup SQL query
   - Mark resolved errors

## Future Enhancements

Potential improvements for the error tracking system:

- [ ] Email alerts for critical errors
- [ ] Slack/Discord webhook notifications
- [ ] Error grouping by similarity
- [ ] Search functionality in dashboard
- [ ] Export errors to CSV
- [ ] Error analytics charts
- [ ] Automatic error assignment to developers
- [ ] Integration with GitHub Issues
- [ ] Performance monitoring
- [ ] Session replay (privacy-safe)

## Support

For questions or issues with the error tracking system:

1. Check this documentation
2. Review error logs in admin dashboard
3. Check Supabase logs
4. Contact development team

---

**Built by**: Ralph Agent (Autonomous Feature Builder)
**Date**: 2026-01-21
**Version**: 1.0.0
