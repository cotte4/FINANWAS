import { NextRequest, NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth/cookies'
import { verifyToken } from '@/lib/auth/jwt'
import { getUserDividends, createDividend, getDividendSummary } from '@/lib/db/queries/dividends'
import { logApiError } from '@/lib/monitoring/logger'

/**
 * GET /api/dividends
 * Get all dividend payments for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url)
    const includeSummary = searchParams.get('summary') === 'true'
    const baseCurrency = searchParams.get('currency') || 'USD'

    const dividends = await getUserDividends(payload.userId)

    if (includeSummary) {
      const summary = await getDividendSummary(payload.userId, baseCurrency)
      return NextResponse.json({ dividends, summary })
    }

    return NextResponse.json({ dividends })
  } catch (error) {
    console.error('Error in GET /api/dividends:', error)
    await logApiError(error, 'GET /api/dividends')
    return NextResponse.json(
      { error: 'Error al obtener dividendos' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/dividends
 * Create a new dividend payment
 */
export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json()
    const {
      asset_id,
      payment_date,
      amount_per_share,
      total_amount,
      currency,
      payment_type = 'cash',
      shares_received,
      reinvested = false,
      withholding_tax = 0,
      notes,
    } = body

    // Validation
    if (!asset_id || !payment_date || !amount_per_share || !total_amount || !currency) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Verify asset belongs to user
    const { getAssetById } = await import('@/lib/db/queries/portfolio')
    const asset = await getAssetById(asset_id, payload.userId)
    if (!asset) {
      return NextResponse.json(
        { error: 'Activo no encontrado' },
        { status: 404 }
      )
    }

    const dividend = await createDividend(payload.userId, {
      asset_id,
      payment_date,
      amount_per_share,
      total_amount,
      currency,
      payment_type,
      shares_received: shares_received || null,
      reinvested,
      withholding_tax,
      notes: notes || null,
    })

    // Update asset's last dividend info
    const { updateAsset } = await import('@/lib/db/queries/portfolio')
    await updateAsset(asset_id, payload.userId, {
      last_dividend_amount: amount_per_share,
    })

    return NextResponse.json({ dividend }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/dividends:', error)
    await logApiError(error, 'POST /api/dividends')
    return NextResponse.json(
      { error: 'Error al crear dividendo' },
      { status: 500 }
    )
  }
}
