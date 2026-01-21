import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/jwt';
import { getCourse, getLesson, getLessonList } from '@/lib/content/courses';
import { getUserProgress } from '@/lib/db/queries/progress';

/**
 * GET /api/courses/[courseSlug]/lessons/[lessonSlug]
 * Returns a specific lesson with its content and navigation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseSlug: string; lessonSlug: string }> }
) {
  try {
    const { courseSlug, lessonSlug } = await params;

    // Get lesson content
    const lesson = getLesson(courseSlug, lessonSlug);
    if (!lesson) {
      return NextResponse.json(
        { error: 'Lección no encontrada' },
        { status: 404 }
      );
    }

    // Get course info for navigation
    const course = getCourse(courseSlug);
    if (!course) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    // Get all lessons to determine next/previous
    const allLessons = getLessonList(courseSlug);
    const currentIndex = allLessons.findIndex(l => l.slug === lessonSlug);

    const previousLesson = currentIndex > 0
      ? { slug: allLessons[currentIndex - 1].slug, title: allLessons[currentIndex - 1].title }
      : undefined;

    const nextLesson = currentIndex < allLessons.length - 1
      ? { slug: allLessons[currentIndex + 1].slug, title: allLessons[currentIndex + 1].title }
      : undefined;

    // Get user progress
    let isCompleted = false;
    let completedCount = 0;

    try {
      const token = await getAuthCookie();
      if (token) {
        const payload = await verifyToken(token);
        if (payload) {
          const progress = await getUserProgress(payload.userId);
          const courseProgress = progress.filter(p => p.course_slug === courseSlug);

          completedCount = courseProgress.filter(p => p.completed).length;
          isCompleted = courseProgress.some(
            p => p.lesson_slug === lessonSlug && p.completed
          );
        }
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }

    return NextResponse.json(
      {
        title: lesson.title,
        description: lesson.description,
        duration_minutes: lesson.duration_minutes,
        order: lesson.order,
        content: lesson.content,
        isCompleted,
        previousLesson,
        nextLesson,
        courseTitle: course.title,
        courseProgress: {
          completed: completedCount,
          total: allLessons.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/courses/[courseSlug]/lessons/[lessonSlug]:', error);
    return NextResponse.json(
      { error: 'Error al obtener la lección' },
      { status: 500 }
    );
  }
}
