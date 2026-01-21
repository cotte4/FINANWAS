import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/db/supabase';
import { verifyToken } from '@/lib/auth/jwt';
import { verifyPassword } from '@/lib/auth/password';
import { getAuthCookie } from '@/lib/auth/cookies';
import type { User } from '@/types/database';

/**
 * POST /api/auth/2fa/disable
 * Disable 2FA for the authenticated user
 * Requires password verification for security
 * Body: { password: string }
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { password } = body;

    // Validate input
    if (!password) {
      return NextResponse.json(
        { error: 'Contraseña es requerida para desactivar 2FA' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Get user data
    const { data, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', payload.userId)
      .single();

    const user = data as User | null;

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Check if 2FA is enabled
    if (!user.two_factor_enabled) {
      return NextResponse.json(
        { error: '2FA no está habilitado' },
        { status: 400 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }

    // Disable 2FA in database
    const { error: updateError } = await supabase
      .from('users')
      .update({
        two_factor_enabled: false,
        two_factor_secret: null,
        two_factor_backup_codes: null,
      })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json(
      {
        success: true,
        message: '2FA desactivado correctamente',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('2FA disable error:', error);
    return NextResponse.json(
      { error: 'Error al desactivar 2FA' },
      { status: 500 }
    );
  }
}
