/**
 * Audit Logging Service
 *
 * Comprehensive audit trail for security, compliance, and debugging.
 * Tracks all user and system actions across the application.
 */

import { db } from '@/lib/db'

export type AuditCategory = 'authentication' | 'portfolio' | 'settings' | 'export' | 'admin' | 'goal' | 'data'
export type AuditStatus = 'success' | 'failure' | 'pending'

export interface AuditLogEntry {
  userId?: string // Optional for system events
  action: string
  category: AuditCategory
  resourceType?: string
  resourceId?: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  status?: AuditStatus
}

export interface AuditLog extends AuditLogEntry {
  id: string
  createdAt: Date
}

/**
 * Core audit logging function
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    await db.query(
      `INSERT INTO audit_logs (
        user_id, action, category, resource_type, resource_id,
        metadata, ip_address, user_agent, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        entry.userId || null,
        entry.action,
        entry.category,
        entry.resourceType || null,
        entry.resourceId || null,
        entry.metadata ? JSON.stringify(entry.metadata) : null,
        entry.ipAddress || null,
        entry.userAgent || null,
        entry.status || 'success'
      ]
    )
  } catch (error) {
    // Log to console but don't throw - audit logging shouldn't break the app
    console.error('Failed to log audit event:', error)
  }
}

/**
 * Authentication Events
 */
export async function logLogin(
  userId: string,
  ipAddress: string,
  userAgent: string,
  success: boolean,
  metadata?: Record<string, any>
): Promise<void> {
  await logAuditEvent({
    userId,
    action: 'user.login',
    category: 'authentication',
    resourceType: 'user',
    resourceId: userId,
    metadata,
    ipAddress,
    userAgent,
    status: success ? 'success' : 'failure'
  })
}

export async function logLogout(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAuditEvent({
    userId,
    action: 'user.logout',
    category: 'authentication',
    resourceType: 'user',
    resourceId: userId,
    ipAddress,
    userAgent
  })
}

export async function logRegister(
  userId: string,
  ipAddress: string,
  userAgent: string,
  metadata?: Record<string, any>
): Promise<void> {
  await logAuditEvent({
    userId,
    action: 'user.register',
    category: 'authentication',
    resourceType: 'user',
    resourceId: userId,
    metadata,
    ipAddress,
    userAgent
  })
}

export async function logPasswordChange(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAuditEvent({
    userId,
    action: 'user.password_change',
    category: 'authentication',
    resourceType: 'user',
    resourceId: userId,
    ipAddress,
    userAgent
  })
}

export async function log2FAEnable(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAuditEvent({
    userId,
    action: 'user.2fa_enable',
    category: 'authentication',
    resourceType: 'user',
    resourceId: userId,
    ipAddress,
    userAgent
  })
}

export async function log2FADisable(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAuditEvent({
    userId,
    action: 'user.2fa_disable',
    category: 'authentication',
    resourceType: 'user',
    resourceId: userId,
    ipAddress,
    userAgent
  })
}

export async function log2FAVerify(
  userId: string,
  success: boolean,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAuditEvent({
    userId,
    action: 'user.2fa_verify',
    category: 'authentication',
    resourceType: 'user',
    resourceId: userId,
    ipAddress,
    userAgent,
    status: success ? 'success' : 'failure'
  })
}

/**
 * Portfolio Events
 */
export async function logPortfolioChange(
  userId: string,
  action: 'create' | 'update' | 'delete',
  assetId: string,
  changes: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAuditEvent({
    userId,
    action: `portfolio.${action}_asset`,
    category: 'portfolio',
    resourceType: 'asset',
    resourceId: assetId,
    metadata: changes,
    ipAddress,
    userAgent
  })
}

export async function logPriceRefresh(
  userId: string,
  metadata?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAuditEvent({
    userId,
    action: 'portfolio.refresh_prices',
    category: 'portfolio',
    metadata,
    ipAddress,
    userAgent
  })
}

export async function logDividendChange(
  userId: string,
  action: 'create' | 'update' | 'delete',
  dividendId: string,
  changes: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAuditEvent({
    userId,
    action: `dividend.${action}`,
    category: 'portfolio',
    resourceType: 'dividend',
    resourceId: dividendId,
    metadata: changes,
    ipAddress,
    userAgent
  })
}

/**
 * Goal Events
 */
export async function logGoalChange(
  userId: string,
  action: 'create' | 'update' | 'delete' | 'contribute' | 'complete',
  goalId: string,
  changes: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAuditEvent({
    userId,
    action: `goal.${action}`,
    category: 'goal',
    resourceType: 'goal',
    resourceId: goalId,
    metadata: changes,
    ipAddress,
    userAgent
  })
}

/**
 * Settings Events
 */
export async function logSettingsChange(
  userId: string,
  setting: string,
  oldValue: any,
  newValue: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAuditEvent({
    userId,
    action: `settings.${setting}_change`,
    category: 'settings',
    resourceType: 'settings',
    resourceId: userId,
    metadata: { setting, oldValue, newValue },
    ipAddress,
    userAgent
  })
}

/**
 * Data Events
 */
export async function logDataExport(
  userId: string,
  exportType: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAuditEvent({
    userId,
    action: 'data.export',
    category: 'export',
    resourceType: 'export',
    metadata: { exportType },
    ipAddress,
    userAgent
  })
}

export async function logNoteChange(
  userId: string,
  action: 'create' | 'update' | 'delete',
  noteId: string,
  changes: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAuditEvent({
    userId,
    action: `note.${action}`,
    category: 'data',
    resourceType: 'note',
    resourceId: noteId,
    metadata: changes,
    ipAddress,
    userAgent
  })
}

/**
 * Admin Events
 */
export async function logAdminAction(
  adminUserId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  metadata?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAuditEvent({
    userId: adminUserId,
    action: `admin.${action}`,
    category: 'admin',
    resourceType,
    resourceId,
    metadata,
    ipAddress,
    userAgent
  })
}

/**
 * Helper to extract IP from request
 */
export function getClientIP(request: Request): string | undefined {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  return undefined
}

/**
 * Helper to extract User-Agent from request
 */
export function getUserAgent(request: Request): string | undefined {
  return request.headers.get('user-agent') || undefined
}
