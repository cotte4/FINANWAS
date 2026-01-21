import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/db/supabase'
import type { InvitationCode } from '@/types/database'

/**
 * POST /api/auth/validate-code
 * Validates an invitation code for registration
 *
 * @param request - Request body should contain { code: string }
 * @returns 200 { valid: true } if code is valid and unused
 * @returns 400 { error: 'Código de invitación inválido o ya utilizado' } otherwise
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { code } = body

    // Validate input
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Código de invitación inválido o ya utilizado' },
        { status: 400 }
      )
    }

    // Create Supabase client
    const supabase = createClient()

    // Query the invitation_codes table
    const { data, error } = await supabase
      .from('invitation_codes')
      .select('*')
      .eq('code', code.trim())
      .maybeSingle()

    const invitationCode = data as InvitationCode | null

    // Check if code exists and is unused
    if (error || !invitationCode || invitationCode.used_at !== null) {
      return NextResponse.json(
        { error: 'Código de invitación inválido o ya utilizado' },
        { status: 400 }
      )
    }

    // Code is valid and unused
    return NextResponse.json({ valid: true }, { status: 200 })
  } catch (error) {
    console.error('Error validating invitation code:', error)
    return NextResponse.json(
      { error: 'Código de invitación inválido o ya utilizado' },
      { status: 400 }
    )
  }
}
