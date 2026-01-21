import { NextRequest, NextResponse } from 'next/server'
import { updateTimeSpent } from '@/lib/db/queries/progress'
import { verifyToken } from '@/lib/auth/jwt'

/**
 * POST /api/progress/time
 * Actualiza el tiempo invertido en una lección
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Obtener datos del body
    const body = await request.json()
    const { course_slug, lesson_slug, additional_seconds } = body

    if (!course_slug || !lesson_slug || additional_seconds === undefined) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos: course_slug, lesson_slug, additional_seconds' },
        { status: 400 }
      )
    }

    // Validar que additional_seconds sea un número positivo
    if (typeof additional_seconds !== 'number' || additional_seconds < 0) {
      return NextResponse.json(
        { error: 'additional_seconds debe ser un número positivo' },
        { status: 400 }
      )
    }

    // Actualizar el tiempo
    const progress = await updateTimeSpent(
      payload.userId,
      course_slug,
      lesson_slug,
      additional_seconds
    )

    return NextResponse.json({ progress }, { status: 200 })
  } catch (error) {
    console.error('Error al actualizar tiempo invertido:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
