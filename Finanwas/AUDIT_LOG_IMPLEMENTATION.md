# Audit Log System Implementation

## Overview
Comprehensive audit logging system implemented to track all user actions for security, compliance, and debugging purposes. This system provides accountability, helps with debugging, and meets compliance requirements for financial data handling.

## What Was Implemented

### 1. Database Schema
**File:** `src/lib/db/migrations/017_audit_log.sql`

- Created `audit_logs` table with the following structure:
  - `id`: UUID primary key
  - `user_id`: Foreign key to users (nullable for system events)
  - `action`: Text field for specific action (e.g., 'user.login', 'portfolio.create_asset')
  - `category`: Categorization (authentication, portfolio, settings, export, admin, goal, data)
  - `resource_type`: Type of resource affected (asset, goal, user, etc.)
  - `resource_id`: ID of the affected resource
  - `metadata`: JSONB field for additional context
  - `ip_address`: INET field for client IP
  - `user_agent`: Text field for browser/client info
  - `status`: Status of action (success, failure, pending)
  - `created_at`: Timestamp

- Created indexes for efficient querying:
  - User ID + created_at (for user activity timelines)
  - Action (for action-specific queries)
  - Category (for category filtering)
  - Created_at (for time-based queries)
  - Resource type + resource ID (for resource tracking)

### 2. Audit Logger Service
**File:** `src/lib/services/audit-logger.ts`

Core logging functionality with:
- `logAuditEvent()`: Main logging function
- Convenience functions for specific event types:
  - Authentication: `logLogin()`, `logLogout()`, `logRegister()`, `logPasswordChange()`, `log2FAEnable()`, `log2FADisable()`, `log2FAVerify()`
  - Portfolio: `logPortfolioChange()`, `logPriceRefresh()`, `logDividendChange()`
  - Goals: `logGoalChange()`
  - Settings: `logSettingsChange()`
  - Data: `logDataExport()`, `logNoteChange()`
  - Admin: `logAdminAction()`
- Helper functions: `getClientIP()`, `getUserAgent()`

### 3. Query Functions
**File:** `src/lib/db/queries/audit.ts`

Functions for retrieving audit data:
- `getAuditLogs()`: Get logs with filtering (user, category, action, date range, status)
- `getAuditLog()`: Get single log by ID
- `getUserActivityTimeline()`: Get user's recent activity
- `getRecentSecurityEvents()`: Get security-related events for a user
- `getAuditLogStats()`: Get statistics (total events, by category, recent failures)
- `searchAuditLogs()`: Search logs by text

### 4. Database Types
**File:** `src/lib/db/types.ts`

Added TypeScript types for the `audit_logs` table with Row, Insert, and Update types.

### 5. API Integration

#### Authentication Routes
- **Login** (`src/app/api/auth/login/route.ts`):
  - Logs successful and failed login attempts
  - Captures IP address and user agent
  - Records 2FA requirement status

- **Register** (`src/app/api/auth/register/route.ts`):
  - Logs new user registrations
  - Records invitation code used

- **Logout** (`src/app/api/auth/logout/route.ts`):
  - Logs user logout events

- **2FA Verify** (`src/app/api/auth/2fa/verify/route.ts`):
  - Logs 2FA verification attempts (success and failure)
  - Records backup code usage

- **2FA Enable/Disable** (`src/app/api/auth/2fa/enable/route.ts`, `src/app/api/auth/2fa/disable/route.ts`):
  - Logs when users enable or disable 2FA

#### Portfolio Routes
- **Create Asset** (`src/app/api/portfolio/route.ts`):
  - Logs asset creation with metadata (type, ticker, name, quantity, price, currency)

- **Update Asset** (`src/app/api/portfolio/[id]/route.ts`):
  - Logs asset updates with changed fields

- **Delete Asset** (`src/app/api/portfolio/[id]/route.ts`):
  - Logs asset deletion with asset details

### 6. API Endpoints

#### Admin Endpoints
- **GET /api/admin/audit-logs**
  - Returns paginated audit logs with filtering
  - Query parameters: userId, category, action, status, startDate, endDate, search, limit, offset
  - Admin only

- **GET /api/admin/audit-logs/[id]**
  - Returns full details of a single audit log
  - Admin only

#### User Endpoints
- **GET /api/user/activity**
  - Returns user's own activity timeline
  - Query parameters: limit, type (all/security)
  - Privacy-friendly (sanitizes sensitive metadata)

### 7. User Interfaces

#### Admin Dashboard
**File:** `src/app/admin/audit-logs/page.tsx`

Features:
- Table view of recent audit events
- Filtering by category, status, date range, search term
- Pagination controls
- CSV export functionality
- Detailed view modal for each log entry
- Visual status and category badges
- User information display

Columns:
- Timestamp
- User (email and name)
- Action
- Category
- Status
- IP Address
- Actions (View Details button)

#### User Activity Timeline
**File:** `src/app/(main)/perfil/activity/page.tsx`

Features:
- Timeline view of user's own actions
- Filter tabs (All Activity / Security)
- Visual activity cards with icons
- Status badges
- Metadata display (sanitized)
- Timestamp formatting in Spanish
- Security information box

## Audit Event Categories

### Authentication Events
- `user.login` - User logged in
- `user.logout` - User logged out
- `user.register` - New user registration
- `user.password_change` - Password changed
- `user.2fa_enable` - 2FA enabled
- `user.2fa_disable` - 2FA disabled
- `user.2fa_verify` - 2FA verification attempt
- `user.session_expired` - Session expired

### Portfolio Events
- `portfolio.create_asset` - Asset created
- `portfolio.update_asset` - Asset updated
- `portfolio.delete_asset` - Asset deleted
- `portfolio.refresh_prices` - Prices refreshed
- `portfolio.export` - Portfolio exported to CSV
- `dividend.create` - Dividend recorded
- `dividend.update` - Dividend updated
- `dividend.delete` - Dividend deleted

### Goal Events
- `goal.create` - Savings goal created
- `goal.update` - Goal updated
- `goal.delete` - Goal deleted
- `goal.contribute` - Contribution added
- `goal.complete` - Goal marked complete

### Settings Events
- `settings.profile_update` - Profile settings changed
- `settings.currency_change` - Preferred currency changed
- `settings.privacy_update` - Privacy settings changed

### Data Events
- `data.export` - User data exported (GDPR)
- `note.create` - Note created
- `note.update` - Note updated
- `note.delete` - Note deleted

### Admin Events
- `admin.user_view` - Admin viewed user details
- `admin.code_generate` - Invitation code generated
- `admin.error_resolve` - Error marked as resolved

## Security Features

1. **Privacy Protection**:
   - User activity endpoint sanitizes sensitive metadata
   - Passwords and secrets never logged
   - IP addresses and user agents tracked for security

2. **Access Control**:
   - Admin endpoints require admin role
   - Users can only see their own activity
   - Full audit trail accessible only to admins

3. **Comprehensive Tracking**:
   - All authentication events tracked
   - Success and failure states recorded
   - IP addresses and user agents captured
   - Metadata provides context for debugging

4. **Error Handling**:
   - Audit logging failures don't break application flow
   - Errors logged to console for monitoring
   - Graceful degradation if audit logging fails

## Usage

### For Administrators
1. Navigate to `/admin/audit-logs`
2. Use filters to find specific events
3. Click "View Details" to see full metadata
4. Export to CSV for external analysis

### For Users
1. Navigate to `/perfil/activity`
2. View recent actions on your account
3. Toggle between "All Activity" and "Security" views
4. Review for suspicious activity

## Next Steps

To fully utilize the audit logging system:

1. **Run Migration**: Execute `017_audit_log.sql` in your database
2. **Test Logging**: Perform various actions and verify they're logged
3. **Additional Integration**: Add audit logging to:
   - Settings update routes
   - Goal management routes
   - Data export functionality
   - Admin actions
4. **Monitoring**: Set up alerts for suspicious patterns (multiple failed logins, etc.)
5. **Compliance**: Use audit logs for compliance reporting and security audits

## Benefits

1. **Security**: Track all user actions for security monitoring
2. **Compliance**: Meet regulatory requirements for financial data
3. **Debugging**: Trace user actions to diagnose issues
4. **Transparency**: Users can see what data is tracked
5. **Accountability**: Clear record of who did what and when
6. **Forensics**: Investigate security incidents
