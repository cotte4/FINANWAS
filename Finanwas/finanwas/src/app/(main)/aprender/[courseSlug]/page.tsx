'use client'

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  CheckCircleIcon,
  CircleIcon,
  ClockIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from "lucide-react"
import { toast } from "sonner"

/**
 * Course Detail Page
 * Displays all lessons for a specific course with completion status
 * US-044: Course detail page with lessons
 */

interface Lesson {
  slug: string
  title: string
  description: string
  duration_minutes: number
  order: number
  isCompleted: boolean
}

interface CourseData {
  title: string
  description: string
  level: string
  totalLessons: number
  completedLessons: number
  estimatedTime: string
  lessons: Lesson[]
}

export default function CoursePage() {
  const params = useParams()
  const courseSlug = params.courseSlug as string
  const [isLoading, setIsLoading] = React.useState(true)
  const [courseData, setCourseData] = React.useState<CourseData | null>(null)

  React.useEffect(() => {
    async function loadCourseData() {
      try {
        setIsLoading(true)

        // Fetch course details
        const courseRes = await fetch(`/api/courses/${courseSlug}`)
        if (!courseRes.ok) {
          throw new Error('Course not found')
        }
        const { course, lessons } = await courseRes.json()

        // Fetch user progress
        let completedLessons = new Set<string>()
        try {
          const progressRes = await fetch('/api/progress')
          if (progressRes.ok) {
            const progress = await progressRes.json()
            progress
              .filter((p: any) => p.course_slug === courseSlug && p.completed)
              .forEach((p: any) => completedLessons.add(p.lesson_slug))
          }
        } catch (error) {
          console.error('Error fetching progress:', error)
        }

        // Map lessons with completion status
        const lessonsWithCompletion: Lesson[] = lessons.map((lesson: any) => ({
          slug: lesson.slug,
          title: lesson.title,
          description: lesson.description,
          duration_minutes: lesson.duration_minutes,
          order: lesson.order,
          isCompleted: completedLessons.has(lesson.slug)
        }))

        const estimatedMinutes = course.estimated_duration_minutes
        const estimatedTime = estimatedMinutes < 60
          ? `${estimatedMinutes} min`
          : `${Math.floor(estimatedMinutes / 60)}-${Math.ceil(estimatedMinutes / 60)} horas`

        setCourseData({
          title: course.title,
          description: course.description,
          level: course.level,
          totalLessons: lessons.length,
          completedLessons: completedLessons.size,
          estimatedTime,
          lessons: lessonsWithCompletion
        })
      } catch (error) {
        console.error('Error loading course:', error)
        toast.error('Error al cargar el curso')
      } finally {
        setIsLoading(false)
      }
    }

    loadCourseData()
  }, [courseSlug])

  if (isLoading) {
    return (
      <div className="p-6 space-y-8">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-20 w-full" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!courseData) {
    return (
      <div className="p-6">
        <p className="text-center text-muted-foreground">Curso no encontrado</p>
      </div>
    )
  }

  const progress = courseData.totalLessons > 0
    ? (courseData.completedLessons / courseData.totalLessons) * 100
    : 0

  const getLevelLabel = (level: string) => {
    switch (level) {
      case "beginner":
        return "Principiante"
      case "intermediate":
        return "Intermedio"
      case "advanced":
        return "Avanzado"
      default:
        return level
    }
  }

  return (
    <div className="p-6 space-y-8">
      <PageHeader
        breadcrumbs={[
          { label: "Aprender", href: "/aprender" },
          { label: courseData.title },
        ]}
        title={courseData.title}
        description={courseData.description}
        action={
          <Button variant="outline" asChild>
            <Link href="/aprender">
              <ArrowLeftIcon className="mr-2 size-4" />
              Volver a cursos
            </Link>
          </Button>
        }
      />

      {/* Course Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Progreso del Curso</CardTitle>
              <CardDescription>
                {courseData.completedLessons} de {courseData.totalLessons} lecciones completadas
              </CardDescription>
            </div>
            <Badge variant="secondary">{getLevelLabel(courseData.level)}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progress} className="h-2" />
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <ClockIcon className="size-4" />
              <span>Tiempo estimado: {courseData.estimatedTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="size-4" />
              <span>{Math.round(progress)}% completado</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lessons List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Lecciones</h2>
        <div className="space-y-3">
          {courseData.lessons.map((lesson, index) => {
            const isNextLesson = !lesson.isCompleted &&
              (index === 0 || courseData.lessons[index - 1].isCompleted)

            return (
              <Card
                key={lesson.slug}
                className={
                  isNextLesson
                    ? "border-primary"
                    : ""
                }
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 mt-1">
                      {lesson.isCompleted ? (
                        <CheckCircleIcon className="size-6 text-success" />
                      ) : (
                        <CircleIcon className="size-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-muted-foreground">
                          Lección {lesson.order}
                        </span>
                        {isNextLesson && (
                          <Badge variant="default" className="text-xs">
                            Siguiente
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{lesson.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {lesson.description}
                      </CardDescription>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <ClockIcon className="size-4" />
                          <span>{lesson.duration_minutes} min</span>
                        </div>
                        {lesson.isCompleted && (
                          <Badge variant="secondary" className="text-xs">
                            Completada
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0">
                      <Button variant={isNextLesson ? "default" : "outline"} asChild>
                        <Link href={`/aprender/${courseSlug}/${lesson.slug}`}>
                          {lesson.isCompleted ? "Revisar" : "Comenzar"}
                          <ArrowRightIcon className="ml-2 size-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Course Completion */}
      {progress === 100 && (
        <Card className="border-success">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="size-8 text-success" />
              <div>
                <CardTitle>¡Felicitaciones!</CardTitle>
                <CardDescription>
                  Has completado este curso. Continúa aprendiendo con otros cursos.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/aprender">
                Ver más cursos
                <ArrowRightIcon className="ml-2 size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
