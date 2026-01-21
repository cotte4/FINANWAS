import { NextRequest, NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth/cookies'
import { verifyToken } from '@/lib/auth/jwt'
import { createPortfolioSnapshot } from '@/lib/services/portfolio-performance'
import { getUserPreferredCurrency } from '@/lib/db/queries/user-preferences'
import { logApiError } from '@/lib/monitoring/logger'

/**
 * POST /api/portfolio/snapshot
 * Creates a new portfolio performance snapshot for the authenticated user
 * Request body (optional):
 * - date: ISO date string (defaults to today)
 */
export async function POST(request: NextRequest) {
  let userId: string | undefined
  let requestBody: any

  try {
    // Get and verify auth token
    const token = await getAuthCookie()
    if (!token) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    userId = payload.userId

    // Parse request body (optional)
    let snapshotDate: Date | undefined
    try {
      const body = await request.json()
      requestBody = body
      if (body.date) {
        snapshotDate = new Date(body.date)
        if (isNaN(snapshotDate.getTime())) {
          return NextResponse.json(
            { error: 'Fecha inválida' },
            { status: 400 }
          )
        }
      }
    } catch {
      // Body is optional, continue without it
    }

    // Get user's preferred currency
    const preferredCurrency = await getUserPreferredCurrency(payload.userId)

    // Create snapshot
    const snapshot = await createPortfolioSnapshot(
      payload.userId,
      preferredCurrency,
      snapshotDate
    )

    return NextResponse.json({
      snapshot,
      message: 'Snapshot creado exitosamente'
    }, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/portfolio/snapshot:', error)

    // Log error to monitoring system
    await logApiError(error, {
      endpoint: '/api/portfolio/snapshot',
      method: 'POST',
      userId,
      requestData: requestBody,
      statusCode: 500,
    })

    return NextResponse.json(
      { error: 'Error al crear snapshot del portafolio' },
      { status: 500 }
    )
  }
}
