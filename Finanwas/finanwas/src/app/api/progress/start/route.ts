import { NextRequest, NextResponse } from 'next/server'
import { startLesson } from '@/lib/db/queries/progress'
import { verifyToken } from '@/lib/auth/jwt'

/**
 * POST /api/progress/start
 * Registra el inicio de una lección (o incrementa el contador de vistas)
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
    const { course_slug, lesson_slug } = body

    if (!course_slug || !lesson_slug) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos: course_slug, lesson_slug' },
        { status: 400 }
      )
    }

    // Registrar el inicio
    const progress = await startLesson(
      payload.userId,
      course_slug,
      lesson_slug
    )

    return NextResponse.json({ progress }, { status: 200 })
  } catch (error) {
    console.error('Error al registrar inicio de lección:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
