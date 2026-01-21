import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/jwt';
import { getAllInvitationCodes, generateInvitationCode } from '@/lib/db/queries/admin';

/**
 * GET /api/admin/codes
 * Returns all invitation codes (admin only)
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

    // Get all invitation codes
    const codes = await getAllInvitationCodes();

    return NextResponse.json({ codes }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/admin/codes:', error);
    return NextResponse.json(
      { error: 'Error al obtener códigos de invitación' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/codes
 * Generates a new invitation code (admin only)
 */
export async function POST(request: NextRequest) {
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

    // Generate new invitation code
    const code = await generateInvitationCode();

    return NextResponse.json({ code }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/codes:', error);
    return NextResponse.json(
      { error: 'Error al generar código de invitación' },
      { status: 500 }
    );
  }
}
