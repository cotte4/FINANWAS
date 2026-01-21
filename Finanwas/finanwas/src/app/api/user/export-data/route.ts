import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/jwt';
import { exportUserDataAsJSON } from '@/lib/db/queries/export';

/**
 * GET /api/user/export-data
 * Exports all user data in JSON format for GDPR compliance
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

    // Export user data
    const jsonData = await exportUserDataAsJSON(payload.userId);

    // Return as downloadable JSON file
    return new NextResponse(jsonData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="finanwas-data-export-${new Date().toISOString().split('T')[0]}.json"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error in GET /api/user/export-data:', error);
    return NextResponse.json(
      { error: 'Error al exportar datos del usuario' },
      { status: 500 }
    );
  }
}
