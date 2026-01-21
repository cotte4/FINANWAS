import { NextRequest, NextResponse } from 'next/server';
import { getCourse, getLessonList } from '@/lib/content/courses';

/**
 * GET /api/courses/[courseSlug]
 * Returns a specific course with its lessons
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseSlug: string }> }
) {
  try {
    const { courseSlug } = await params;

    const course = getCourse(courseSlug);
    if (!course) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    const lessons = getLessonList(courseSlug);

    return NextResponse.json({ course, lessons }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/courses/[courseSlug]:', error);
    return NextResponse.json(
      { error: 'Error al obtener el curso' },
      { status: 500 }
    );
  }
}
