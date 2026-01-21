import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/jwt';
import { getAuditLog } from '@/lib/db/queries/audit';

/**
 * GET /api/admin/audit-logs/[id]
 * Returns a single audit log with full details
 * Admin only
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Get audit log ID from params
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: 'ID de registro es requerido' },
        { status: 400 }
      );
    }

    const log = await getAuditLog(id);

    if (!log) {
      return NextResponse.json(
        { error: 'Registro de auditoría no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ log }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/admin/audit-logs/[id]:', error);
    return NextResponse.json(
      { error: 'Error al obtener registro de auditoría' },
      { status: 500 }
    );
  }
}
