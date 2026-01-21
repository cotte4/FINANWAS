/**
 * Audit Log Query Functions
 *
 * Functions for retrieving and filtering audit logs
 */

import { db } from '@/lib/db'
import type { AuditLog, AuditCategory, AuditStatus } from '@/lib/services/audit-logger'

export interface AuditLogFilters {
  userId?: string
  category?: AuditCategory
  action?: string
  startDate?: Date
  endDate?: Date
  status?: AuditStatus
  resourceType?: string
  resourceId?: string
  limit?: number
  offset?: number
}

export interface AuditLogWithUser extends AuditLog {
  userEmail?: string
  userName?: string
}

/**
 * Get audit logs with optional filtering
 */
export async function getAuditLogs(
  filters: AuditLogFilters = {}
): Promise<AuditLogWithUser[]> {
  const conditions: string[] = []
  const params: any[] = []
  let paramIndex = 1

  if (filters.userId) {
    conditions.push(`al.user_id = $${paramIndex}`)
    params.push(filters.userId)
    paramIndex++
  }

  if (filters.category) {
    conditions.push(`al.category = $${paramIndex}`)
    params.push(filters.category)
    paramIndex++
  }

  if (filters.action) {
    conditions.push(`al.action = $${paramIndex}`)
    params.push(filters.action)
    paramIndex++
  }

  if (filters.status) {
    conditions.push(`al.status = $${paramIndex}`)
    params.push(filters.status)
    paramIndex++
  }

  if (filters.resourceType) {
    conditions.push(`al.resource_type = $${paramIndex}`)
    params.push(filters.resourceType)
    paramIndex++
  }

  if (filters.resourceId) {
    conditions.push(`al.resource_id = $${paramIndex}`)
    params.push(filters.resourceId)
    paramIndex++
  }

  if (filters.startDate) {
    conditions.push(`al.created_at >= $${paramIndex}`)
    params.push(filters.startDate)
    paramIndex++
  }

  if (filters.endDate) {
    conditions.push(`al.created_at <= $${paramIndex}`)
    params.push(filters.endDate)
    paramIndex++
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const limit = filters.limit || 100
  const offset = filters.offset || 0

  params.push(limit, offset)

  const query = `
    SELECT
      al.id,
      al.user_id AS "userId",
      al.action,
      al.category,
      al.resource_type AS "resourceType",
      al.resource_id AS "resourceId",
      al.metadata,
      al.ip_address AS "ipAddress",
      al.user_agent AS "userAgent",
      al.status,
      al.created_at AS "createdAt",
      u.email AS "userEmail",
      u.name AS "userName"
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.id
    ${whereClause}
    ORDER BY al.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `

  const result = await db.query(query, params)
  return result.rows
}

/**
 * Get a single audit log by ID
 */
export async function getAuditLog(id: string): Promise<AuditLogWithUser | null> {
  const result = await db.query(
    `
    SELECT
      al.id,
      al.user_id AS "userId",
      al.action,
      al.category,
      al.resource_type AS "resourceType",
      al.resource_id AS "resourceId",
      al.metadata,
      al.ip_address AS "ipAddress",
      al.user_agent AS "userAgent",
      al.status,
      al.created_at AS "createdAt",
      u.email AS "userEmail",
      u.name AS "userName"
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE al.id = $1
    `,
    [id]
  )

  return result.rows[0] || null
}

/**
 * Get user's activity timeline
 */
export async function getUserActivityTimeline(
  userId: string,
  limit: number = 50
): Promise<AuditLog[]> {
  const result = await db.query(
    `
    SELECT
      id,
      user_id AS "userId",
      action,
      category,
      resource_type AS "resourceType",
      resource_id AS "resourceId",
      metadata,
      ip_address AS "ipAddress",
      user_agent AS "userAgent",
      status,
      created_at AS "createdAt"
    FROM audit_logs
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2
    `,
    [userId, limit]
  )

  return result.rows
}

/**
 * Get recent security-related events for a user
 */
export async function getRecentSecurityEvents(
  userId: string,
  limit: number = 20
): Promise<AuditLog[]> {
  const result = await db.query(
    `
    SELECT
      id,
      user_id AS "userId",
      action,
      category,
      resource_type AS "resourceType",
      resource_id AS "resourceId",
      metadata,
      ip_address AS "ipAddress",
      user_agent AS "userAgent",
      status,
      created_at AS "createdAt"
    FROM audit_logs
    WHERE user_id = $1
      AND category = 'authentication'
      AND action IN (
        'user.login',
        'user.logout',
        'user.password_change',
        'user.2fa_enable',
        'user.2fa_disable',
        'user.2fa_verify'
      )
    ORDER BY created_at DESC
    LIMIT $2
    `,
    [userId, limit]
  )

  return result.rows
}

/**
 * Get audit log statistics
 */
export async function getAuditLogStats(userId?: string): Promise<{
  totalEvents: number
  eventsByCategory: Record<string, number>
  recentFailures: number
}> {
  const userCondition = userId ? 'WHERE user_id = $1' : ''
  const params = userId ? [userId] : []

  const [totalResult, categoryResult, failuresResult] = await Promise.all([
    // Total events
    db.query(
      `SELECT COUNT(*) as count FROM audit_logs ${userCondition}`,
      params
    ),

    // Events by category
    db.query(
      `
      SELECT category, COUNT(*) as count
      FROM audit_logs
      ${userCondition}
      GROUP BY category
      `,
      params
    ),

    // Recent failures (last 24 hours)
    db.query(
      `
      SELECT COUNT(*) as count
      FROM audit_logs
      WHERE status = 'failure'
        AND created_at > NOW() - INTERVAL '24 hours'
        ${userId ? 'AND user_id = $1' : ''}
      `,
      params
    )
  ])

  const eventsByCategory: Record<string, number> = {}
  categoryResult.rows.forEach((row) => {
    eventsByCategory[row.category] = parseInt(row.count)
  })

  return {
    totalEvents: parseInt(totalResult.rows[0].count),
    eventsByCategory,
    recentFailures: parseInt(failuresResult.rows[0].count)
  }
}

/**
 * Search audit logs by text (action, resource ID, or metadata)
 */
export async function searchAuditLogs(
  searchTerm: string,
  filters: Omit<AuditLogFilters, 'action'> = {}
): Promise<AuditLogWithUser[]> {
  const conditions: string[] = [
    `(
      al.action ILIKE $1
      OR al.resource_id ILIKE $1
      OR al.metadata::text ILIKE $1
    )`
  ]
  const params: any[] = [`%${searchTerm}%`]
  let paramIndex = 2

  if (filters.userId) {
    conditions.push(`al.user_id = $${paramIndex}`)
    params.push(filters.userId)
    paramIndex++
  }

  if (filters.category) {
    conditions.push(`al.category = $${paramIndex}`)
    params.push(filters.category)
    paramIndex++
  }

  if (filters.status) {
    conditions.push(`al.status = $${paramIndex}`)
    params.push(filters.status)
    paramIndex++
  }

  if (filters.startDate) {
    conditions.push(`al.created_at >= $${paramIndex}`)
    params.push(filters.startDate)
    paramIndex++
  }

  if (filters.endDate) {
    conditions.push(`al.created_at <= $${paramIndex}`)
    params.push(filters.endDate)
    paramIndex++
  }

  const limit = filters.limit || 100
  const offset = filters.offset || 0

  params.push(limit, offset)

  const query = `
    SELECT
      al.id,
      al.user_id AS "userId",
      al.action,
      al.category,
      al.resource_type AS "resourceType",
      al.resource_id AS "resourceId",
      al.metadata,
      al.ip_address AS "ipAddress",
      al.user_agent AS "userAgent",
      al.status,
      al.created_at AS "createdAt",
      u.email AS "userEmail",
      u.name AS "userName"
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE ${conditions.join(' AND ')}
    ORDER BY al.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `

  const result = await db.query(query, params)
  return result.rows
}
