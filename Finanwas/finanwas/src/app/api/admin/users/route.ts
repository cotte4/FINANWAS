import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/jwt';
import { getAllUsers, getUserStats } from '@/lib/db/queries/admin';

/**
 * GET /api/admin/users
 * Returns all users and statistics (admin only)
 * Query params: stats=true to include statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Get and verify auth token
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
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Verify admin role
    if (payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'No tienes permiso para acceder a este recurso' },
        { status: 403 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('stats') === 'true';

    // Get users
    const users = await getAllUsers();

    // Remove password hashes from response
    const sanitizedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      created_at: user.created_at,
      last_login: user.last_login,
    }));

    // Get stats if requested
    let stats = null;
    if (includeStats) {
      stats = await getUserStats();
    }

    return NextResponse.json({
      users: sanitizedUsers,
      stats,
    }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/admin/users:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
}
