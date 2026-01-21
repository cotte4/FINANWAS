import { NextRequest, NextResponse } from 'next/server'
import { getLearningStats } from '@/lib/db/queries/progress'
import { verifyToken } from '@/lib/auth/jwt'

/**
 * GET /api/progress/stats
 * Obtiene las estadísticas de aprendizaje del usuario
 */
export async function GET(request: NextRequest) {
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

    // Obtener las estadísticas
    const stats = await getLearningStats(payload.userId)

    return NextResponse.json({ stats }, { status: 200 })
  } catch (error) {
    console.error('Error al obtener estadísticas de aprendizaje:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
