import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/jwt';
import { getAuditLogs, searchAuditLogs } from '@/lib/db/queries/audit';
import type { AuditCategory, AuditStatus } from '@/lib/services/audit-logger';

/**
 * GET /api/admin/audit-logs
 * Returns audit logs with optional filtering
 * Admin only
 *
 * Query parameters:
 * - userId: Filter by user ID
 * - category: Filter by category
 * - action: Filter by action
 * - status: Filter by status
 * - startDate: Filter by start date (ISO string)
 * - endDate: Filter by end date (ISO string)
 * - search: Search in action, resource ID, or metadata
 * - limit: Number of results (default: 100)
 * - offset: Offset for pagination (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Check admin role
    if (payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'No tienes permiso para acceder a esta información' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;
    const category = searchParams.get('category') as AuditCategory | undefined;
    const action = searchParams.get('action') || undefined;
    const status = searchParams.get('status') as AuditStatus | undefined;
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : undefined;
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined;
    const search = searchParams.get('search') || undefined;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let logs;

    if (search) {
      // Use search function if search term is provided
      logs = await searchAuditLogs(search, {
        userId,
        category,
        status,
        startDate,
        endDate,
        limit,
        offset
      });
    } else {
      // Use regular filter function
      logs = await getAuditLogs({
        userId,
        category,
        action,
        status,
        startDate,
        endDate,
        limit,
        offset
      });
    }

    return NextResponse.json({ logs }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/admin/audit-logs:', error);
    return NextResponse.json(
      { error: 'Error al obtener registros de auditoría' },
      { status: 500 }
    );
  }
}
