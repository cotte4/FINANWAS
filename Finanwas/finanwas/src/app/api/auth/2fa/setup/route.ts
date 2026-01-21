import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/db/supabase';
import { verifyToken } from '@/lib/auth/jwt';
import { generateTwoFactorSecret, generateQRCode } from '@/lib/auth/two-factor';
import { getAuthCookie } from '@/lib/auth/cookies';
import type { User } from '@/types/database';

/**
 * POST /api/auth/2fa/setup
 * Generate a new 2FA secret and QR code for the authenticated user
 * This does NOT enable 2FA yet - user must verify the code first
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
        { error: '2FA ya está habilitado. Desactívalo primero para regenerar.' },
        { status: 400 }
      );
    }

    // Generate new secret
    const secret = generateTwoFactorSecret();

    // Generate QR code
    const qrCode = await generateQRCode(user.email, secret);

    // Return secret and QR code (do not save to DB yet - wait for verification)
    return NextResponse.json(
      {
        success: true,
        secret,
        qrCode,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json(
      { error: 'Error al configurar 2FA' },
      { status: 500 }
    );
  }
}
