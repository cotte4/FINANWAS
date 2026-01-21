import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/jwt';
import { getUserActivityTimeline, getRecentSecurityEvents } from '@/lib/db/queries/audit';

/**
 * GET /api/user/activity
 * Returns the authenticated user's activity timeline
 *
 * Query parameters:
 * - limit: Number of results (default: 50)
 * - type: 'all' | 'security' (default: 'all')
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type') || 'all';

    let activities;

    if (type === 'security') {
      // Get only security-related events
      activities = await getRecentSecurityEvents(payload.userId, limit);
    } else {
      // Get all activity
      activities = await getUserActivityTimeline(payload.userId, limit);
    }

    // Remove sensitive data from metadata before sending to user
    const sanitizedActivities = activities.map(activity => ({
      ...activity,
      metadata: activity.metadata ? sanitizeMetadata(activity.metadata) : null
    }));

    return NextResponse.json({ activities: sanitizedActivities }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/user/activity:', error);
    return NextResponse.json(
      { error: 'Error al obtener actividad del usuario' },
      { status: 500 }
    );
  }
}

/**
 * Remove sensitive data from metadata
 */
function sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
  const sanitized = { ...metadata };

  // Remove password-related fields
  delete sanitized.password;
  delete sanitized.oldPassword;
  delete sanitized.newPassword;
  delete sanitized.password_hash;

  // Remove sensitive authentication data
  delete sanitized.secret;
  delete sanitized.backupCodes;
  delete sanitized.two_factor_secret;

  return sanitized;
}
