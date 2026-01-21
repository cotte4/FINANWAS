import { NextResponse } from 'next/server';
import { getCourses } from '@/lib/content/courses';

// In-memory cache for courses (1 hour)
// Courses are static content that rarely changes
let coursesCache: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * GET /api/courses
 * Returns all available courses with 1-hour caching
 */
export async function GET() {
  try {
    // Check cache first
    if (coursesCache && Date.now() - coursesCache.timestamp < CACHE_DURATION) {
      return NextResponse.json(coursesCache.data, {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=3600', // 1 hour browser cache
        },
      });
    }

    const courses = getCourses();
    const response = { courses };

    // Update cache
    coursesCache = {
      data: response,
      timestamp: Date.now(),
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=3600', // 1 hour browser cache
      },
    });
  } catch (error) {
    console.error('Error in GET /api/courses:', error);
    return NextResponse.json(
      { error: 'Error al obtener los cursos' },
      { status: 500 }
    );
  }
}
