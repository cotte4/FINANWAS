import { NextRequest, NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth/cookies'
import { verifyToken } from '@/lib/auth/jwt'
import { getPerformanceChartData, getLatestSnapshot } from '@/lib/services/portfolio-performance'
import { logApiError } from '@/lib/monitoring/logger'

/**
 * GET /api/portfolio/performance
 * Returns portfolio performance data for charting
 * Query parameters:
 * - period: '1M' | '3M' | '6M' | '1Y' | 'ALL' (default: 'ALL')
 */
export async function GET(request: NextRequest) {
  let userId: string | undefined

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

    // Get period from query parameters
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') as '1M' | '3M' | '6M' | '1Y' | 'ALL' || 'ALL'

    // Validate period
    const validPeriods = ['1M', '3M', '6M', '1Y', 'ALL']
    if (!validPeriods.includes(period)) {
      return NextResponse.json(
        { error: 'Período inválido. Opciones válidas: 1M, 3M, 6M, 1Y, ALL' },
        { status: 400 }
      )
    }

    // Get performance data
    const chartData = await getPerformanceChartData(payload.userId, period)

    // Get latest snapshot for additional info
    const latestSnapshot = await getLatestSnapshot(payload.userId)

    return NextResponse.json({
      period,
      data: chartData,
      latestSnapshot,
      hasData: chartData.length > 0
    }, { status: 200 })

  } catch (error) {
    console.error('Error in GET /api/portfolio/performance:', error)

    // Log error to monitoring system
    await logApiError(error, {
      endpoint: '/api/portfolio/performance',
      method: 'GET',
      userId,
      statusCode: 500,
    })

    return NextResponse.json(
      { error: 'Error al obtener datos de rendimiento del portafolio' },
      { status: 500 }
    )
  }
}
