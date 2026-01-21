import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/db/supabase';
import { hashPassword } from '@/lib/auth/password';
import { signToken } from '@/lib/auth/jwt';
import { setAuthCookie } from '@/lib/auth/cookies';
import type { InvitationCode, User, UserProfile, Database } from '@/types/database';
import { sanitizeString, sanitizeEmail } from '@/lib/utils/sanitize';
import { checkRateLimit, getClientIp, RATE_LIMITS, createRateLimitMessage } from '@/lib/utils/rate-limit';
import { isValidEmail, isValidPassword } from '@/lib/utils/validators';

/**
 * POST /api/auth/register
 * Registers a new user with an invitation code
 */
export async function POST(request: NextRequest) {
  try {
    // Check rate limit (3 requests per minute)
    const clientIp = getClientIp(request.headers);
    const rateLimitResult = checkRateLimit(clientIp, 'register', RATE_LIMITS.register);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: createRateLimitMessage(rateLimitResult.resetMs) },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { code, name, email, password } = body;

    // Validate inputs
    if (!code || !name || !email || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedCode = sanitizeString(code, 50);
    const sanitizedName = sanitizeString(name, 255);
    const sanitizedEmail = sanitizeEmail(email);
    // Note: password is not sanitized to preserve user's exact input
    // but we validate length after sanitization

    // Validate sanitized values
    if (sanitizedCode.length === 0) {
      return NextResponse.json(
        { error: 'Código de invitación inválido' },
        { status: 400 }
      );
    }

    if (sanitizedName.length === 0) {
      return NextResponse.json(
        { error: 'El nombre no puede estar vacío' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'El formato del email no es válido' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Validate invitation code exists and is unused
    const { data: invitationCode, error: codeError } = await supabase
      .from('invitation_codes')
      .select('*')
      .eq('code', sanitizedCode)
      .maybeSingle();

    if (codeError || !invitationCode) {
      return NextResponse.json(
        { error: 'Código de invitación inválido' },
        { status: 400 }
      );
    }

    const typedCode = invitationCode as InvitationCode;

    if (typedCode.used_at) {
      return NextResponse.json(
        { error: 'Código de invitación inválido' },
        { status: 400 }
      );
    }

    // Check if email is already registered
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('email', sanitizedEmail)
      .maybeSingle();

    if (userCheckError && userCheckError.code !== 'PGRST116') {
      throw userCheckError;
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email ya tiene una cuenta' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const { data, error: createUserError } = await supabase
      .from('users')
      .insert({
        email: sanitizedEmail,
        password_hash: passwordHash,
        name: sanitizedName,
        role: 'user',
      } as any)
      .select()
      .single();

    const newUser = data as User | null;

    if (createUserError || !newUser) {
      throw createUserError || new Error('Failed to create user');
    }

    // Mark invitation code as used (with optimistic locking to prevent race condition)
    // This will only update if the code is still unused (used_at IS NULL)
    const { data: updatedCode, error: updateCodeError } = await supabase
      .from('invitation_codes')
      .update({
        used_at: new Date().toISOString(),
        used_by: newUser.id,
      } as any)
      .eq('id', typedCode.id)
      .is('used_at', null) // Only update if still unused (prevents race condition)
      .select()
      .maybeSingle();

    // If the update didn't affect any rows, the code was used by another request
    if (!updatedCode) {
      // Rollback: Delete the user we just created
      await supabase.from('users').delete().eq('id', newUser.id);

      return NextResponse.json(
        { error: 'Código de invitación ya utilizado. Intentá de nuevo.' },
        { status: 400 }
      );
    }

    if (updateCodeError) {
      // Rollback: Delete the user we just created
      await supabase.from('users').delete().eq('id', newUser.id);
      throw updateCodeError;
    }

    // Create empty user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: newUser.id,
      } as any);

    if (profileError) {
      // Rollback: Delete the user and reset the invitation code
      await supabase.from('users').delete().eq('id', newUser.id);
      await supabase
        .from('invitation_codes')
        .update({ used_at: null, used_by: null } as any)
        .eq('id', typedCode.id);

      throw profileError;
    }

    // Generate JWT token
    const token = await signToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    // Set auth cookie
    await setAuthCookie(token);

    // Return success
    return NextResponse.json(
      {
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Error al registrar usuario' },
      { status: 500 }
    );
  }
}
