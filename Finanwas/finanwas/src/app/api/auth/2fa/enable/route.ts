import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/db/supabase';
import { verifyToken } from '@/lib/auth/jwt';
import { verifyTwoFactorToken, generateBackupCodes, hashBackupCodes } from '@/lib/auth/two-factor';
import { getAuthCookie } from '@/lib/auth/cookies';
import type { User } from '@/types/database';

/**
 * POST /api/auth/2fa/enable
 * Enable 2FA for the authenticated user after verifying their first TOTP code
 * Body: { secret: string, token: string }
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
    const { secret, token: totpToken } = body;

    // Validate inputs
    if (!secret || !totpToken) {
      return NextResponse.json(
        { error: 'Secret y código son requeridos' },
        { status: 400 }
      );
    }

    // Verify the TOTP token
    const isValid = verifyTwoFactorToken(totpToken, secret);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Código de verificación inválido' },
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

    // Check if 2FA is already enabled
    if (user.two_factor_enabled) {
      return NextResponse.json(
        { error: '2FA ya está habilitado' },
        { status: 400 }
      );
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes(8);
    const hashedBackupCodes = await hashBackupCodes(backupCodes);

    // Enable 2FA in database
    const { error: updateError } = await supabase
      .from('users')
      .update({
        two_factor_enabled: true,
        two_factor_secret: secret,
        two_factor_backup_codes: hashedBackupCodes,
      })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    // Return success with backup codes (show only once!)
    return NextResponse.json(
      {
        success: true,
        backupCodes, // Plain-text codes shown only once
        message: '2FA habilitado correctamente. Guarda los códigos de respaldo en un lugar seguro.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('2FA enable error:', error);
    return NextResponse.json(
      { error: 'Error al habilitar 2FA' },
      { status: 500 }
    );
  }
}
