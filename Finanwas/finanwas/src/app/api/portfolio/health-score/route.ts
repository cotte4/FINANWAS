import { NextRequest, NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth/cookies'
import { verifyToken } from '@/lib/auth/jwt'
import { getUserAssets } from '@/lib/db/queries/portfolio'
import { getUserProfile } from '@/lib/db/queries/user'
import { calculatePortfolioHealthScore } from '@/lib/services/portfolio-health'

/**
 * GET /api/portfolio/health-score
 * Calculate and return the portfolio health score
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
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

    const userId = payload.userId

    // 2. Get user assets
    const assets = await getUserAssets(userId)

    // 3. Get user profile (for risk tolerance and preferences)
    const userProfile = await getUserProfile(userId)

    // 4. Calculate health score
    const healthScore = calculatePortfolioHealthScore(assets, userProfile)

    // 5. Return health score result
    return NextResponse.json({
      success: true,
      data: healthScore
    })

  } catch (error) {
    console.error('Error calculating health score:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Error al calcular el puntaje de salud del portafolio'
      },
      { status: 500 }
    )
  }
}
