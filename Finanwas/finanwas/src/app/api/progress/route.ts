import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/jwt';
import { getUserProgress, markLessonComplete } from '@/lib/db/queries/progress';

/**
 * GET /api/progress
 * Returns all lesson progress for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Get and verify auth token
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Get user progress
    const progress = await getUserProgress(payload.userId);

    return NextResponse.json(progress, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/progress:', error);
    return NextResponse.json(
      { error: 'Error al obtener progreso de lecciones' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/progress
 * Marks a lesson as complete for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    // Get and verify auth token
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { course_slug, lesson_slug } = body;

    // Validate inputs
    if (!course_slug || !lesson_slug) {
      return NextResponse.json(
        { error: 'course_slug y lesson_slug son requeridos' },
        { status: 400 }
      );
    }

    // Mark lesson as complete
    const progress = await markLessonComplete(
      payload.userId,
      course_slug,
      lesson_slug
    );

    return NextResponse.json(progress, { status: 200 });
  } catch (error) {
    console.error('Error in POST /api/progress:', error);
    return NextResponse.json(
      { error: 'Error al marcar lección como completada' },
      { status: 500 }
    );
  }
}
