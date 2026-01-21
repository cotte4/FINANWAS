import { NextRequest, NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth/cookies'
import { verifyToken } from '@/lib/auth/jwt'
import { getDividendById, updateDividend, deleteDividend } from '@/lib/db/queries/dividends'
import { logApiError } from '@/lib/monitoring/logger'

/**
 * GET /api/dividends/:id
 * Get a specific dividend payment
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const dividend = await getDividendById(params.id, payload.userId)
    if (!dividend) {
      return NextResponse.json(
        { error: 'Dividendo no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ dividend })
  } catch (error) {
    console.error('Error in GET /api/dividends/:id:', error)
    await logApiError(error, 'GET /api/dividends/:id')
    return NextResponse.json(
      { error: 'Error al obtener dividendo' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/dividends/:id
 * Update a dividend payment
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check dividend exists and belongs to user
    const existing = await getDividendById(params.id, payload.userId)
    if (!existing) {
      return NextResponse.json(
        { error: 'Dividendo no encontrado' },
        { status: 404 }
      )
    }

    const dividend = await updateDividend(params.id, payload.userId, body)

    return NextResponse.json({ dividend })
  } catch (error) {
    console.error('Error in PATCH /api/dividends/:id:', error)
    await logApiError(error, 'PATCH /api/dividends/:id')
    return NextResponse.json(
      { error: 'Error al actualizar dividendo' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/dividends/:id
 * Delete a dividend payment
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check dividend exists and belongs to user
    const existing = await getDividendById(params.id, payload.userId)
    if (!existing) {
      return NextResponse.json(
        { error: 'Dividendo no encontrado' },
        { status: 404 }
      )
    }

    await deleteDividend(params.id, payload.userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/dividends/:id:', error)
    await logApiError(error, 'DELETE /api/dividends/:id')
    return NextResponse.json(
      { error: 'Error al eliminar dividendo' },
      { status: 500 }
    )
  }
}
