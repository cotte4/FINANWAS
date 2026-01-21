import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/db/supabase';
import { verifyPassword } from '@/lib/auth/password';
import { signToken } from '@/lib/auth/jwt';
import { setAuthCookie } from '@/lib/auth/cookies';
import { checkRateLimit, getClientIp, RATE_LIMITS, createRateLimitMessage } from '@/lib/utils/rate-limit';
import { isValidEmail } from '@/lib/utils/validators';
import type { User } from '@/types/database';

/**
 * POST /api/auth/login
 * Authenticates an existing user with email and password
 */
export async function POST(request: NextRequest) {
  try {
    // Check rate limit (5 requests per minute)
    const clientIp = getClientIp(request.headers);
    const rateLimitResult = checkRateLimit(clientIp, 'login', RATE_LIMITS.login);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: createRateLimitMessage(rateLimitResult.resetMs) },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Email o contraseña incorrectos' },
        { status: 401 }
      );
    }

    const supabase = createClient();

    // Find user by email
    const { data, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    const user = data as User | null;

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Email o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Email o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // Check if 2FA is enabled
    if (user.two_factor_enabled && user.two_factor_secret) {
      // Return requires2FA flag instead of logging in
      // Frontend will redirect to 2FA verification page
      return NextResponse.json(
        {
          success: true,
          requires2FA: true,
          userId: user.id,
          email: user.email,
          name: user.name,
        },
        { status: 200 }
      );
    }

    // Update last_login timestamp
    const { error: updateError } = await supabase
      .from('users')
      .update({
        last_login: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      // If this fails, log it but don't fail the login
      console.error('Failed to update last_login:', updateError);
    }

    // Generate JWT token
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Set auth cookie
    await setAuthCookie(token);

    // Return success
    return NextResponse.json(
      {
        success: true,
        requires2FA: false,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    );
  }
}
