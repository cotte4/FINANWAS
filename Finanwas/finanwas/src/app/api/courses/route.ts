import { NextResponse } from 'next/server';
import { getCourses } from '@/lib/content/courses';

/**
 * GET /api/courses
 * Returns all available courses
 */
export async function GET() {
  try {
    const courses = getCourses();
    return NextResponse.json({ courses }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/courses:', error);
    return NextResponse.json(
      { error: 'Error al obtener los cursos' },
      { status: 500 }
    );
  }
}
