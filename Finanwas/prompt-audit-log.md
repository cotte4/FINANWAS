# Ralph Agent - Audit Log System

## Objective
Implement comprehensive audit logging to track all user actions for security, compliance, and debugging purposes.

## Context
For security and compliance (especially with financial data), we need to track user actions such as logins, portfolio changes, data exports, settings modifications, and sensitive operations. This provides accountability, helps with debugging, and meets compliance requirements.

## Requirements

### Database Schema

File: `src/lib/db/migrations/017_audit_log.sql`

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL for system events
  action TEXT NOT NULL, -- 'user.login', 'portfolio.create_asset', 'settings.update', etc.
  category TEXT NOT NULL, -- 'authentication', 'portfolio', 'settings', 'export', 'admin'
  resource_type TEXT, -- 'asset', 'goal', 'user', 'note', etc.
  resource_id TEXT, -- ID of the affected resource
  metadata JSONB, -- Additional context (old values, new values, IP, user agent)
  ip_address INET,
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'success', -- 'success', 'failure', 'pending'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_category ON audit_logs(category);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail of all user and system actions';
```

### Audit Event Categories

#### Authentication Events
- `user.login` - User logged in
- `user.logout` - User logged out
- `user.register` - New user registration
- `user.password_change` - Password changed
- `user.2fa_enable` - 2FA enabled
- `user.2fa_disable` - 2FA disabled
- `user.2fa_verify` - 2FA verification attempt
- `user.session_expired` - Session expired

#### Portfolio Events
- `portfolio.create_asset` - Asset created
- `portfolio.update_asset` - Asset updated
- `portfolio.delete_asset` - Asset deleted
- `portfolio.refresh_prices` - Prices refreshed
- `portfolio.export` - Portfolio exported to CSV
- `dividend.create` - Dividend recorded
- `dividend.update` - Dividend updated
- `dividend.delete` - Dividend deleted

#### Goal Events
- `goal.create` - Savings goal created
- `goal.update` - Goal updated
- `goal.delete` - Goal deleted
- `goal.contribute` - Contribution added
- `goal.complete` - Goal marked complete

#### Settings Events
- `settings.profile_update` - Profile settings changed
- `settings.currency_change` - Preferred currency changed
- `settings.privacy_update` - Privacy settings changed

#### Data Events
- `data.export` - User data exported (GDPR)
- `note.create` - Note created
- `note.update` - Note updated
- `note.delete` - Note deleted

#### Admin Events
- `admin.user_view` - Admin viewed user details
- `admin.code_generate` - Invitation code generated
- `admin.error_resolve` - Error marked as resolved

### Logging Service

File: `src/lib/services/audit-logger.ts`

```typescript
export interface AuditLogEntry {
  userId?: string // Optional for system events
  action: string
  category: 'authentication' | 'portfolio' | 'settings' | 'export' | 'admin'
  resourceType?: string
  resourceId?: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  status?: 'success' | 'failure' | 'pending'
}

export async function logAuditEvent(entry: AuditLogEntry): Promise<void>

// Convenience functions
export async function logLogin(userId: string, ipAddress: string, userAgent: string, success: boolean)
export async function logPortfolioChange(userId: string, action: string, assetId: string, changes: any)
export async function logDataExport(userId: string, exportType: string)
export async function logSettingsChange(userId: string, setting: string, oldValue: any, newValue: any)
```

### Integration Points

#### Middleware for Automatic Logging
File: `src/middleware/audit.ts`

Automatically capture:
- IP address from request
- User agent from headers
- Authenticated user ID from session
- Request path and method

#### API Route Integration
Add audit logging to existing routes:

**Example** (`src/app/api/portfolio/route.ts`):
```typescript
// Before
const newAsset = await createAsset(data)
return NextResponse.json(newAsset)

// After
const newAsset = await createAsset(data)
await logAuditEvent({
  userId: payload.userId,
  action: 'portfolio.create_asset',
  category: 'portfolio',
  resourceType: 'asset',
  resourceId: newAsset.id,
  metadata: { assetType: data.type, ticker: data.ticker },
  ipAddress: req.ip,
  userAgent: req.headers.get('user-agent')
})
return NextResponse.json(newAsset)
```

### Admin Dashboard

File: `src/app/admin/audit-logs/page.tsx`

**Features**:
- **Table View**: Show recent audit events
- **Filtering**: By user, action, category, date range, status
- **Search**: Search by action, resource ID, or metadata
- **Export**: Download audit logs as CSV
- **Details**: Click to see full metadata for each event

**Columns**:
- Timestamp
- User (email or "System")
- Action
- Category
- Resource
- Status
- IP Address
- User Agent (truncated)
- Actions (View Details)

**Filters**:
- Date range picker
- Category dropdown
- Status dropdown
- User search
- Action search

### Query Functions

File: `src/lib/db/queries/audit.ts`

```typescript
export async function getAuditLogs(filters: {
  userId?: string
  category?: string
  action?: string
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}): Promise<AuditLog[]>

export async function getAuditLog(id: string): Promise<AuditLog | null>

export async function getUserActivityTimeline(userId: string, limit?: number): Promise<AuditLog[]>

export async function getRecentSecurityEvents(userId: string): Promise<AuditLog[]>
```

### API Endpoints

**GET /api/admin/audit-logs**
- Query parameters: userId, category, action, startDate, endDate, limit, offset
- Returns paginated audit logs
- Admin only

**GET /api/admin/audit-logs/:id**
- Returns full audit log details with complete metadata
- Admin only

**GET /api/user/activity**
- Returns user's own activity timeline
- User can see their own actions
- Privacy-friendly (no sensitive data like passwords)

### User-Facing Activity Timeline

File: `src/app/(main)/perfil/activity/page.tsx`

Show users their own activity (transparency):
- Recent logins
- Portfolio changes
- Goal contributions
- Settings updates
- Data exports

**Purpose**: Build trust, show users what data we track

## Implementation Steps

### Iteration 1: Database + Logger Service
1. Create migration 017_audit_log.sql
2. Update database types
3. Create audit-logger.ts service
4. Test logging sample events

### Iteration 2: Integrate into Existing Routes
1. Add audit logging to auth routes (login, register, 2FA)
2. Add to portfolio routes (create, update, delete assets)
3. Add to settings routes
4. Add to data export
5. Test that events are logged correctly

### Iteration 3: Admin Dashboard
1. Create /admin/audit-logs page
2. Display table of recent logs
3. Add filtering (category, date range)
4. Add search functionality
5. Add "View Details" modal

### Iteration 4: User Activity Page
1. Create /perfil/activity page
2. Show user's own activity timeline
3. Privacy-friendly display
4. Responsive design

### Iteration 5: Documentation + Testing
1. Test various scenarios
2. Verify no performance impact
3. Create AUDIT_LOG.md documentation
4. Update features_future.md

## Success Criteria
✅ Database migration created
✅ Audit logger service implemented
✅ Auth events logged (login, register, 2FA)
✅ Portfolio events logged (create, update, delete)
✅ Settings events logged
✅ Data export events logged
✅ Admin dashboard displays audit logs
✅ Filtering and search work correctly
✅ User activity page shows personal timeline
✅ No performance degradation
✅ Documentation created

## Security & Privacy Considerations

### What to Log
✅ User ID (who)
✅ Action (what)
✅ Timestamp (when)
✅ Resource ID (which)
✅ IP address (from where)
✅ User agent (how)
✅ Status (success/failure)

### What NOT to Log
❌ Passwords (ever)
❌ 2FA codes or secrets
❌ Full credit card numbers
❌ Sensitive personal information
❌ API keys or tokens

### Data Retention
- Keep audit logs for 1 year (compliance requirement)
- Archive logs older than 1 year
- Never delete security-related events (logins, 2FA, admin actions)

### Access Control
- **Admin**: Full access to all audit logs
- **User**: Can only see their own activity
- **System**: Logs can be written by system events (e.g., session expiry)

## Performance Considerations

### Async Logging
- Log events asynchronously (don't block API response)
- Use fire-and-forget pattern
- Handle logging errors gracefully (don't crash if logging fails)

### Database Performance
- Indexes on frequently queried fields (user_id, created_at, action)
- Partition table by date if volume is high (future)
- Regular cleanup of old logs

### Caching
- Cache audit log count for admin dashboard (update every 5 minutes)
- No caching of actual logs (must be real-time for security)

## Code Quality Standards
- Follow existing patterns
- Use TypeScript properly
- Add proper error handling
- Async logging (non-blocking)
- Comprehensive unit tests
- Accessible admin dashboard
- Mobile-responsive design

## Constraints
- Do NOT impact API performance
- Do NOT log sensitive data
- Do NOT break existing functionality
- Follow Next.js patterns
- Maintain Spanish language for UI
- Admin-only for full logs, users see only their own activity

## Commit Message Format
```
feat: Add comprehensive audit log system

- Create audit_logs table (migration 017)
- Implement audit logger service with event tracking
- Add authentication event logging (login, register, 2FA)
- Add portfolio event logging (create, update, delete assets)
- Add settings and data export event logging
- Create admin dashboard at /admin/audit-logs
- Add filtering by category, action, date range, user
- Implement search functionality
- Create user activity timeline at /perfil/activity
- Add query functions (getAuditLogs, getUserActivityTimeline)
- Create GET /api/admin/audit-logs endpoint
- Create GET /api/user/activity endpoint
- Include AUDIT_LOG.md documentation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

**Important**: Audit logging is critical for security and compliance. Ensure no sensitive data is logged, and that logs are tamper-proof (append-only, no DELETE operations allowed for normal users).
