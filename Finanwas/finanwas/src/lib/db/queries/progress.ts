import { createClient } from '../supabase'
import type { LessonProgress } from '@/types/database'

/**
 * Interfaz para el progreso agregado de un curso
 */
export interface CourseProgressSummary {
  courseSlug: string
  totalLessons: number
  completedLessons: number
  percentageComplete: number
  lastCompletedAt: string | null
}

/**
 * Obtiene todo el progreso de lecciones de un usuario
 *
 * @example
 * const progress = await getUserProgress('550e8400-e29b-41d4-a716-446655440000')
 * console.log(`Lecciones completadas: ${progress.length}`)
 *
 * @param userId - ID del usuario
 * @returns Array de progreso de lecciones
 * @throws Error si hay un problema con la base de datos
 */
export async function getUserProgress(userId: string): Promise<LessonProgress[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false, nullsFirst: false })

    if (error) {
      throw new Error(`Error al obtener progreso del usuario: ${error.message}`)
    }

    return data || []
  } catch (error) {
    throw error
  }
}

/**
 * Obtiene el progreso de una lección específica
 *
 * @example
 * const lesson = await getLessonProgress(
 *   '550e8400-e29b-41d4-a716-446655440000',
 *   'fundamentos',
 *   'que-es-la-inversion'
 * )
 *
 * @param userId - ID del usuario
 * @param courseSlug - Slug del curso
 * @param lessonSlug - Slug de la lección
 * @returns Progreso de la lección o null si no existe
 * @throws Error si hay un problema con la base de datos
 */
export async function getLessonProgress(
  userId: string,
  courseSlug: string,
  lessonSlug: string
): Promise<LessonProgress | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_slug', courseSlug)
      .eq('lesson_slug', lessonSlug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Error al obtener progreso de lección: ${error.message}`)
    }

    return data
  } catch (error) {
    if (error instanceof Error && error.message.includes('No rows')) {
      return null
    }
    throw error
  }
}

/**
 * Marca una lección como completada (o crea el registro si no existe)
 *
 * @example
 * await markLessonComplete(
 *   '550e8400-e29b-41d4-a716-446655440000',
 *   'fundamentos',
 *   'que-es-la-inversion'
 * )
 *
 * @param userId - ID del usuario
 * @param courseSlug - Slug del curso
 * @param lessonSlug - Slug de la lección
 * @returns Progreso de la lección actualizado
 * @throws Error si hay un problema con la base de datos
 */
export async function markLessonComplete(
  userId: string,
  courseSlug: string,
  lessonSlug: string
): Promise<LessonProgress> {
  try {
    const supabase = createClient()

    // Intentar actualizar primero
    const existing = await getLessonProgress(userId, courseSlug, lessonSlug)

    if (existing) {
      // Si ya existe, actualizamos
      const { data, error } = await supabase
        .from('lesson_progress')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        throw new Error(`Error al actualizar progreso de lección: ${error.message}`)
      }

      return data
    } else {
      // Si no existe, creamos nuevo registro
      const { data, error } = await supabase
        .from('lesson_progress')
        .insert({
          user_id: userId,
          course_slug: courseSlug,
          lesson_slug: lessonSlug,
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Error al crear progreso de lección: ${error.message}`)
      }

      return data
    }
  } catch (error) {
    throw error
  }
}

/**
 * Obtiene el progreso resumido de un curso específico
 *
 * @example
 * const courseProgress = await getCourseProgress(
 *   '550e8400-e29b-41d4-a716-446655440000',
 *   'fundamentos'
 * )
 * console.log(`Progreso: ${courseProgress.percentageComplete}%`)
 *
 * @param userId - ID del usuario
 * @param courseSlug - Slug del curso
 * @returns Resumen del progreso del curso
 * @throws Error si hay un problema con la base de datos
 */
export async function getCourseProgress(
  userId: string,
  courseSlug: string
): Promise<CourseProgressSummary> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_slug', courseSlug)
      .order('completed_at', { ascending: false, nullsFirst: false })

    if (error) {
      throw new Error(`Error al obtener progreso del curso: ${error.message}`)
    }

    const lessons = data || []
    const completedLessons = lessons.filter(l => l.completed)
    const lastCompleted = completedLessons[0]

    return {
      courseSlug,
      totalLessons: lessons.length,
      completedLessons: completedLessons.length,
      percentageComplete: lessons.length > 0
        ? Math.round((completedLessons.length / lessons.length) * 100)
        : 0,
      lastCompletedAt: lastCompleted?.completed_at || null,
    }
  } catch (error) {
    throw error
  }
}
