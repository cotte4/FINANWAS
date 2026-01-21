'use client'

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import ReactMarkdown from "react-markdown"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  CheckCircleIcon,
  ClockIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  BookOpenIcon,
} from "lucide-react"
import { toast } from "sonner"

/**
 * Lesson Page
 * Displays lesson content with markdown rendering and completion tracking
 * US-045: Create lesson page
 */

interface LessonData {
  title: string
  description: string
  duration_minutes: number
  order: number
  content: string
  isCompleted: boolean
  previousLesson?: {
    slug: string
    title: string
  }
  nextLesson?: {
    slug: string
    title: string
  }
  courseTitle: string
  courseProgress: {
    completed: number
    total: number
  }
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const courseSlug = params.courseSlug as string
  const lessonSlug = params.lessonSlug as string

  const [isLoading, setIsLoading] = React.useState(true)
  const [lessonData, setLessonData] = React.useState<LessonData | null>(null)
  const [isMarkingComplete, setIsMarkingComplete] = React.useState(false)

  React.useEffect(() => {
    async function loadLessonData() {
      try {
        setIsLoading(true)

        // Fetch lesson content
        const lessonRes = await fetch(`/api/courses/${courseSlug}/lessons/${lessonSlug}`)
        if (!lessonRes.ok) {
          throw new Error('Lesson not found')
        }
        const data = await lessonRes.json()

        setLessonData(data)
      } catch (error) {
        console.error('Error loading lesson:', error)
        toast.error('Error al cargar la lección')
      } finally {
        setIsLoading(false)
      }
    }

    loadLessonData()
  }, [courseSlug, lessonSlug])

  async function handleMarkComplete() {
    if (!lessonData || lessonData.isCompleted) return

    try {
      setIsMarkingComplete(true)

      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_slug: courseSlug,
          lesson_slug: lessonSlug,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to mark lesson as complete')
      }

      // Update local state
      setLessonData({
        ...lessonData,
        isCompleted: true,
        courseProgress: {
          ...lessonData.courseProgress,
          completed: lessonData.courseProgress.completed + 1,
        },
      })

      toast.success('¡Lección completada!')
    } catch (error) {
      console.error('Error marking lesson as complete:', error)
      toast.error('Error al marcar lección como completada')
    } finally {
      setIsMarkingComplete(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-8">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!lessonData) {
    return (
      <div className="p-6">
        <p className="text-center text-muted-foreground">Lección no encontrada</p>
        <div className="mt-4 text-center">
          <Button variant="outline" asChild>
            <Link href={`/aprender/${courseSlug}`}>
              <ArrowLeftIcon className="mr-2 size-4" />
              Volver al curso
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      <PageHeader
        breadcrumbs={[
          { label: "Aprender", href: "/aprender" },
          { label: lessonData.courseTitle, href: `/aprender/${courseSlug}` },
          { label: lessonData.title },
        ]}
        title={lessonData.title}
        description={lessonData.description}
        action={
          <Button variant="outline" asChild>
            <Link href={`/aprender/${courseSlug}`}>
              <ArrowLeftIcon className="mr-2 size-4" />
              Volver al curso
            </Link>
          </Button>
        }
      />

      {/* Lesson Info */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ClockIcon className="size-4" />
          <span>Tiempo estimado: {lessonData.duration_minutes} min</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpenIcon className="size-4" />
          <span>Lección {lessonData.order}</span>
        </div>
        {lessonData.isCompleted && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <CheckCircleIcon className="size-3" />
            Completada
          </Badge>
        )}
        <div className="ml-auto text-sm text-muted-foreground">
          Progreso del curso: {lessonData.courseProgress.completed}/{lessonData.courseProgress.total} lecciones
        </div>
      </div>

      {/* Lesson Content */}
      <Card>
        <CardContent className="pt-6">
          <div className="prose prose-slate max-w-none dark:prose-invert">
            <ReactMarkdown>{lessonData.content}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Mark Complete Button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleMarkComplete}
          disabled={lessonData.isCompleted || isMarkingComplete}
          className="min-w-[200px]"
        >
          {lessonData.isCompleted ? (
            <>
              <CheckCircleIcon className="mr-2 size-5" />
              Completada ✓
            </>
          ) : isMarkingComplete ? (
            'Guardando...'
          ) : (
            'Marcar como completada'
          )}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t">
        <div className="flex-1">
          {lessonData.previousLesson ? (
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href={`/aprender/${courseSlug}/${lessonData.previousLesson.slug}`}>
                <ArrowLeftIcon className="mr-2 size-4" />
                <span className="hidden sm:inline">Anterior: </span>
                {lessonData.previousLesson.title}
              </Link>
            </Button>
          ) : (
            <div />
          )}
        </div>
        <div className="flex-1 text-right">
          {lessonData.nextLesson ? (
            <Button asChild className="w-full sm:w-auto">
              <Link href={`/aprender/${courseSlug}/${lessonData.nextLesson.slug}`}>
                <span className="hidden sm:inline">Siguiente: </span>
                {lessonData.nextLesson.title}
                <ArrowRightIcon className="ml-2 size-4" />
              </Link>
            </Button>
          ) : (
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href={`/aprender/${courseSlug}`}>
                Ver todas las lecciones
                <ArrowRightIcon className="ml-2 size-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
