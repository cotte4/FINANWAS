import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/db/supabase';
import { verifyToken } from '@/lib/auth/jwt';
import { getAuthCookie } from '@/lib/auth/cookies';
import type { User } from '@/types/database';

/**
 * GET /api/user/me
 * Get the current authenticated user's details including 2FA status
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

    const supabase = createClient();

    // Get user data (excluding sensitive fields)
    const { data, error: userError } = await supabase
      .from('users')
      .select('id, email, name, role, created_at, last_login, two_factor_enabled')
      .eq('id', payload.userId)
      .single();

    const user = data as Omit<User, 'password_hash' | 'two_factor_secret' | 'two_factor_backup_codes'> | null;

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Get user details error:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos del usuario' },
      { status: 500 }
    );
  }
}
