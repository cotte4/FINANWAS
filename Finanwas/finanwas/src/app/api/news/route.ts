import { NextRequest, NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth/cookies'
import { verifyToken } from '@/lib/auth/jwt'
import { getUserAssets } from '@/lib/db/queries/portfolio'
import { getPersonalizedNewsFeed } from '@/lib/services/news-feed'
import { logApiError } from '@/lib/monitoring/logger'

/**
 * GET /api/news
 * Returns personalized news feed based on user portfolio
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

    // Get user assets to personalize news
    const assets = await getUserAssets(userId)
    const tickers = assets
      .map(asset => asset.ticker)
      .filter((ticker): ticker is string => ticker !== null && ticker !== undefined)

    // Fetch personalized news feed
    const newsFeed = await getPersonalizedNewsFeed(tickers)

    return NextResponse.json(
      {
        success: true,
        data: {
          portfolio: newsFeed.portfolio,
          market: newsFeed.market,
          crypto: newsFeed.crypto,
          economy: newsFeed.economy,
          timestamp: new Date().toISOString()
        }
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, max-age=1800' // 30 minutes cache
        }
      }
    )
  } catch (error) {
    console.error('Error in GET /api/news:', error)

    // Log error to monitoring system
    await logApiError(error, {
      endpoint: '/api/news',
      method: 'GET',
      userId,
      statusCode: 500
    })

    return NextResponse.json(
      { success: false, error: 'Error al cargar noticias' },
      { status: 500 }
    )
  }
}
