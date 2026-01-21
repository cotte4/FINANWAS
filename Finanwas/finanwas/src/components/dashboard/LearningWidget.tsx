'use client'

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { BookOpenIcon, ArrowRightIcon, CheckCircle2Icon } from "lucide-react"

/**
 * Learning Widget for Dashboard
 *
 * US-085: Learning Progress Widget
 * - Shows completed lessons count
 * - Shows progress bar for current course
 * - Shows next suggested lesson
 * - Links to learning page
 */

interface LessonProgress {
  id: string
  course_slug: string
  lesson_slug: string
  completed: boolean
  completed_at: string | null
}

interface LearningWidgetProps {
  className?: string
}

export function LearningWidget({ className }: LearningWidgetProps) {
  const [isLoading, setIsLoading] = React.useState(true)
  const [progress, setProgress] = React.useState<LessonProgress[]>([])
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchProgress() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch('/api/progress')
        if (!response.ok) throw new Error('Error al cargar progreso')

        const data = await response.json()
        // API returns array directly, not wrapped in { progress }
        setProgress(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProgress()
  }, [])

  // Calculate learning statistics
  const completedLessons = React.useMemo(() => {
    return progress.filter(p => p.completed).length
  }, [progress])

  // TODO: When course content system is implemented, calculate these from actual course data
  const totalLessons = 24 // Placeholder total
  const completionPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

  // Mock data for current course and next lesson
  // TODO: Replace with actual data from course content system
  const currentCourse = completedLessons > 0 ? "Fundamentos de Inversión" : null
  const nextLesson = completedLessons === 0
    ? { title: "Interés Compuesto", course: "basics", slug: "01-interes-compuesto" }
    : null

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpenIcon className="size-5 text-secondary" />
            <CardTitle>Mi Progreso de Aprendizaje</CardTitle>
          </div>
          <CardDescription>Cursos en progreso</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpenIcon className="size-5 text-secondary" />
            <CardTitle>Mi Progreso de Aprendizaje</CardTitle>
          </div>
          <CardDescription>Cursos en progreso</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-destructive">{error}</div>
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (completedLessons === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpenIcon className="size-5 text-secondary" />
            <CardTitle>Mi Progreso de Aprendizaje</CardTitle>
          </div>
          <CardDescription>Cursos en progreso</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BookOpenIcon className="size-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-2">
                No has completado ninguna lección aún.
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Comenzá tu viaje de aprendizaje financiero
              </p>
            </div>

            {/* Next lesson suggestion */}
            {nextLesson && (
              <div className="p-3 bg-accent rounded-lg space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Próxima lección sugerida</p>
                <p className="text-sm font-semibold">{nextLesson.title}</p>
                <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                  <Link href={`/aprender/${nextLesson.course}/${nextLesson.slug}`}>
                    Comenzar ahora
                    <ArrowRightIcon className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            )}

            <Button variant="outline" className="w-full" asChild>
              <Link href="/aprender">
                Ver todos los cursos
                <ArrowRightIcon className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BookOpenIcon className="size-5 text-secondary" />
          <CardTitle>Mi Progreso de Aprendizaje</CardTitle>
        </div>
        <CardDescription>Cursos en progreso</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Completed lessons count */}
          <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Lecciones completadas</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{completedLessons}</p>
                <CheckCircle2Icon className="size-5 text-success" />
              </div>
              <p className="text-xs text-muted-foreground">
                {completedLessons} de {totalLessons} lecciones
              </p>
            </div>
            <BookOpenIcon className="size-8 text-secondary" />
          </div>

          {/* Current course progress */}
          {currentCourse && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{currentCourse}</span>
                <span className="text-muted-foreground">{Math.round(completionPercent)}%</span>
              </div>
              <Progress value={completionPercent} />
              <p className="text-xs text-muted-foreground">
                Continúa aprendiendo para completar este curso
              </p>
            </div>
          )}

          {/* Next lesson suggestion */}
          {nextLesson && (
            <div className="p-3 bg-accent rounded-lg space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Próxima lección</p>
              <p className="text-sm font-semibold">{nextLesson.title}</p>
            </div>
          )}

          {/* Link to learning page */}
          <Button variant="outline" className="w-full" asChild>
            <Link href="/aprender">
              Seguir aprendiendo
              <ArrowRightIcon className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
