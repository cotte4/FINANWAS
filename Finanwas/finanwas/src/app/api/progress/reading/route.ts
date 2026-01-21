import { NextRequest, NextResponse } from 'next/server'
import { updateReadingProgress } from '@/lib/db/queries/progress'
import { verifyToken } from '@/lib/auth/jwt'

/**
 * POST /api/progress/reading
 * Actualiza el progreso de lectura de una lección
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
    const { course_slug, lesson_slug, percentage } = body

    if (!course_slug || !lesson_slug || percentage === undefined) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos: course_slug, lesson_slug, percentage' },
        { status: 400 }
      )
    }

    // Validar que percentage sea un número entre 0 y 100
    if (typeof percentage !== 'number' || percentage < 0 || percentage > 100) {
      return NextResponse.json(
        { error: 'percentage debe ser un número entre 0 y 100' },
        { status: 400 }
      )
    }

    // Actualizar el progreso de lectura
    const progress = await updateReadingProgress(
      payload.userId,
      course_slug,
      lesson_slug,
      percentage
    )

    return NextResponse.json({ progress }, { status: 200 })
  } catch (error) {
    console.error('Error al actualizar progreso de lectura:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
