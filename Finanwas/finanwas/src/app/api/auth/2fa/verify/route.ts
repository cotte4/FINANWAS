import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/db/supabase';
import { signToken } from '@/lib/auth/jwt';
import { setAuthCookie } from '@/lib/auth/cookies';
import { verifyTwoFactorToken, verifyBackupCode, removeBackupCode } from '@/lib/auth/two-factor';
import type { User } from '@/types/database';

/**
 * POST /api/auth/2fa/verify
 * Verify 2FA code during login and complete authentication
 * Body: { userId: string, token: string, isBackupCode?: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, token, isBackupCode = false } = body;

    // Validate inputs
    if (!userId || !token) {
      return NextResponse.json(
        { error: 'Usuario y código son requeridos' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Get user data
    const { data, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    const user = data as User | null;

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Check if 2FA is enabled
    if (!user.two_factor_enabled || !user.two_factor_secret) {
      return NextResponse.json(
        { error: '2FA no está habilitado para este usuario' },
        { status: 400 }
      );
    }

    let isValid = false;
    let needsBackupCodeUpdate = false;
    let updatedBackupCodes: string[] | null = null;

    if (isBackupCode) {
      // Verify backup code
      if (!user.two_factor_backup_codes || user.two_factor_backup_codes.length === 0) {
        return NextResponse.json(
          { error: 'No hay códigos de respaldo disponibles' },
          { status: 400 }
        );
      }

      const matchedIndex = await verifyBackupCode(token, user.two_factor_backup_codes);
      if (matchedIndex !== -1) {
        isValid = true;
        needsBackupCodeUpdate = true;
        // Remove used backup code
        updatedBackupCodes = removeBackupCode(user.two_factor_backup_codes, matchedIndex);
      }
    } else {
      // Verify TOTP token
      isValid = verifyTwoFactorToken(token, user.two_factor_secret);
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Código de verificación inválido' },
        { status: 401 }
      );
    }

    // Update backup codes if a backup code was used
    if (needsBackupCodeUpdate) {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          two_factor_backup_codes: updatedBackupCodes,
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Failed to update backup codes:', updateError);
        // Don't fail the login, but log the error
      }
    }

    // Update last_login timestamp
    const { error: updateError } = await supabase
      .from('users')
      .update({
        last_login: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to update last_login:', updateError);
    }

    // Generate JWT token
    const jwtToken = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Set auth cookie
    await setAuthCookie(jwtToken);

    // Return success
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        remainingBackupCodes: updatedBackupCodes?.length || user.two_factor_backup_codes?.length || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { error: 'Error al verificar 2FA' },
      { status: 500 }
    );
  }
}
