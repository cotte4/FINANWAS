import { clearAuthCookie } from '@/lib/auth/cookies';
import { NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 * Logs out the current user by clearing the auth cookie
 */
export async function POST() {
  try {
    await clearAuthCookie();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Error al cerrar sesión' },
      { status: 500 }
    );
  }
}
