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
 * Interfaz para las estadísticas de aprendizaje del usuario
 */
export interface LearningStats {
  totalTimeSpentSeconds: number
  totalLessonsCompleted: number
  totalLessonsStarted: number
  averageProgressPercentage: number
  currentStreak: number
  longestStreak: number
  lastActivityDate: string | null
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
      const now = new Date().toISOString()
      const { data, error } = await supabase
        .from('lesson_progress')
        .insert({
          user_id: userId,
          course_slug: courseSlug,
          lesson_slug: lessonSlug,
          completed: true,
          completed_at: now,
          started_at: now,
          last_accessed_at: now,
          view_count: 1,
          progress_percentage: 100,
          time_spent_seconds: 0,
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
 * Registra el inicio de una lección (o incrementa el contador de vistas si ya existe)
 *
 * @example
 * await startLesson(
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
export async function startLesson(
  userId: string,
  courseSlug: string,
  lessonSlug: string
): Promise<LessonProgress> {
  try {
    const supabase = createClient()
    const now = new Date().toISOString()

    // Intentar obtener el progreso existente
    const existing = await getLessonProgress(userId, courseSlug, lessonSlug)

    if (existing) {
      // Si ya existe, incrementamos view_count y actualizamos last_accessed_at
      const { data, error } = await supabase
        .from('lesson_progress')
        .update({
          view_count: existing.view_count + 1,
          last_accessed_at: now,
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        throw new Error(`Error al actualizar acceso a lección: ${error.message}`)
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
          completed: false,
          started_at: now,
          last_accessed_at: now,
          view_count: 1,
          progress_percentage: 0,
          time_spent_seconds: 0,
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
 * Actualiza el tiempo total invertido en una lección
 *
 * @example
 * await updateTimeSpent(
 *   '550e8400-e29b-41d4-a716-446655440000',
 *   'fundamentos',
 *   'que-es-la-inversion',
 *   30
 * )
 *
 * @param userId - ID del usuario
 * @param courseSlug - Slug del curso
 * @param lessonSlug - Slug de la lección
 * @param additionalSeconds - Segundos adicionales a sumar
 * @returns Progreso de la lección actualizado
 * @throws Error si hay un problema con la base de datos o si la lección no existe
 */
export async function updateTimeSpent(
  userId: string,
  courseSlug: string,
  lessonSlug: string,
  additionalSeconds: number
): Promise<LessonProgress> {
  try {
    const supabase = createClient()

    // Obtener el progreso actual
    const existing = await getLessonProgress(userId, courseSlug, lessonSlug)

    if (!existing) {
      throw new Error('No se encontró el progreso de la lección. Debe iniciarse primero.')
    }

    // Actualizar el tiempo total
    const newTimeSpent = existing.time_spent_seconds + additionalSeconds

    const { data, error } = await supabase
      .from('lesson_progress')
      .update({
        time_spent_seconds: newTimeSpent,
        last_accessed_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) {
      throw new Error(`Error al actualizar tiempo invertido: ${error.message}`)
    }

    return data
  } catch (error) {
    throw error
  }
}

/**
 * Actualiza el porcentaje de progreso de lectura de una lección
 *
 * @example
 * await updateReadingProgress(
 *   '550e8400-e29b-41d4-a716-446655440000',
 *   'fundamentos',
 *   'que-es-la-inversion',
 *   75
 * )
 *
 * @param userId - ID del usuario
 * @param courseSlug - Slug del curso
 * @param lessonSlug - Slug de la lección
 * @param percentage - Porcentaje de lectura (0-100)
 * @returns Progreso de la lección actualizado
 * @throws Error si hay un problema con la base de datos o si la lección no existe
 */
export async function updateReadingProgress(
  userId: string,
  courseSlug: string,
  lessonSlug: string,
  percentage: number
): Promise<LessonProgress> {
  try {
    const supabase = createClient()

    // Validar que el porcentaje esté en el rango correcto
    const validPercentage = Math.max(0, Math.min(100, Math.round(percentage)))

    // Obtener el progreso actual
    const existing = await getLessonProgress(userId, courseSlug, lessonSlug)

    if (!existing) {
      throw new Error('No se encontró el progreso de la lección. Debe iniciarse primero.')
    }

    // Solo actualizar si el nuevo porcentaje es mayor que el actual
    if (validPercentage > existing.progress_percentage) {
      const { data, error } = await supabase
        .from('lesson_progress')
        .update({
          progress_percentage: validPercentage,
          last_accessed_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        throw new Error(`Error al actualizar progreso de lectura: ${error.message}`)
      }

      return data
    }

    return existing
  } catch (error) {
    throw error
  }
}

/**
 * Obtiene las estadísticas de aprendizaje agregadas del usuario
 *
 * @example
 * const stats = await getLearningStats('550e8400-e29b-41d4-a716-446655440000')
 * console.log(`Tiempo total: ${stats.totalTimeSpentSeconds}s`)
 * console.log(`Racha actual: ${stats.currentStreak} días`)
 *
 * @param userId - ID del usuario
 * @returns Estadísticas de aprendizaje del usuario
 * @throws Error si hay un problema con la base de datos
 */
export async function getLearningStats(userId: string): Promise<LearningStats> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .order('last_accessed_at', { ascending: false, nullsFirst: false })

    if (error) {
      throw new Error(`Error al obtener estadísticas de aprendizaje: ${error.message}`)
    }

    const lessons = data || []

    // Calcular estadísticas básicas
    const totalTimeSpentSeconds = lessons.reduce((sum, lesson) => sum + lesson.time_spent_seconds, 0)
    const totalLessonsCompleted = lessons.filter(l => l.completed).length
    const totalLessonsStarted = lessons.filter(l => l.started_at !== null).length
    const averageProgressPercentage = lessons.length > 0
      ? Math.round(lessons.reduce((sum, lesson) => sum + lesson.progress_percentage, 0) / lessons.length)
      : 0
    const lastActivityDate = lessons.length > 0 ? lessons[0].last_accessed_at : null

    // Calcular rachas de días consecutivos
    const { currentStreak, longestStreak } = calculateStreaks(lessons)

    return {
      totalTimeSpentSeconds,
      totalLessonsCompleted,
      totalLessonsStarted,
      averageProgressPercentage,
      currentStreak,
      longestStreak,
      lastActivityDate,
    }
  } catch (error) {
    throw error
  }
}

/**
 * Calcula las rachas de días consecutivos de aprendizaje
 *
 * @param lessons - Array de progreso de lecciones ordenado por last_accessed_at descendente
 * @returns Objeto con racha actual y racha más larga
 */
function calculateStreaks(lessons: LessonProgress[]): { currentStreak: number; longestStreak: number } {
  if (lessons.length === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  // Extraer fechas únicas de acceso (solo la fecha, sin hora)
  const accessDates = lessons
    .filter(l => l.last_accessed_at !== null)
    .map(l => new Date(l.last_accessed_at!).toDateString())
    .filter((date, index, self) => self.indexOf(date) === index)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  if (accessDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 1

  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()

  // Calcular racha actual
  if (accessDates[0] === today || accessDates[0] === yesterday) {
    currentStreak = 1
    for (let i = 1; i < accessDates.length; i++) {
      const prevDate = new Date(accessDates[i - 1])
      const currDate = new Date(accessDates[i])
      const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        currentStreak++
      } else {
        break
      }
    }
  }

  // Calcular racha más larga
  longestStreak = tempStreak
  for (let i = 1; i < accessDates.length; i++) {
    const prevDate = new Date(accessDates[i - 1])
    const currDate = new Date(accessDates[i])
    const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 1
    }
  }

  return { currentStreak, longestStreak }
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
