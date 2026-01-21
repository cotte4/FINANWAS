'use client'

import * as React from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import {
  BookOpenIcon,
  ClockIcon,
  CheckCircleIcon,
  SearchIcon,
  TrendingUpIcon,
  ArrowRightIcon,
} from "lucide-react"
import { toast } from "sonner"

/**
 * Courses Overview Page
 * Displays all available courses with progress tracking
 * US-043: Courses list page
 */

interface CourseWithProgress {
  slug: string
  title: string
  description: string
  level: "beginner" | "intermediate" | "advanced"
  totalLessons: number
  completedLessons: number
  estimatedTime: string
  tags: string[]
}

export default function AprenderPage() {
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [courses, setCourses] = React.useState<CourseWithProgress[]>([])

  // Fetch courses and progress
  React.useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)

        // Parallelize API calls for better performance
        const [coursesRes, progressRes] = await Promise.allSettled([
          fetch('/api/courses'),
          fetch('/api/progress')
        ])

        // Handle courses fetch
        if (coursesRes.status === 'rejected' || !coursesRes.value.ok) {
          throw new Error('Failed to fetch courses')
        }
        const { courses: coursesData } = await coursesRes.value.json()

        // Handle progress fetch
        let progressData: { [key: string]: Set<string> } = {}
        if (progressRes.status === 'fulfilled' && progressRes.value.ok) {
          try {
            const { progress } = await progressRes.value.json()
            progress.forEach((p: { course_slug: string; lesson_slug: string; completed: boolean }) => {
              if (!progressData[p.course_slug]) {
                progressData[p.course_slug] = new Set()
              }
              if (p.completed) {
                progressData[p.course_slug].add(p.lesson_slug)
              }
            })
          } catch (error) {
            console.error('Error parsing progress:', error)
          }
        }

        // Map courses with progress
        const coursesWithProgress: CourseWithProgress[] = coursesData.map((course: {
          slug: string;
          title: string;
          description: string;
          level: "beginner" | "intermediate" | "advanced";
          lessons_count: number;
          estimated_duration_minutes: number;
          tags: string[];
        }) => {
          const completedLessons = progressData[course.slug]?.size || 0
          const estimatedMinutes = course.estimated_duration_minutes
          const estimatedTime = estimatedMinutes < 60
            ? `${estimatedMinutes} min`
            : `${Math.floor(estimatedMinutes / 60)}-${Math.ceil(estimatedMinutes / 60)} horas`

          return {
            slug: course.slug,
            title: course.title,
            description: course.description,
            level: course.level,
            totalLessons: course.lessons_count,
            completedLessons,
            estimatedTime,
            tags: course.tags
          }
        })

        setCourses(coursesWithProgress)
      } catch (error) {
        console.error('Error loading courses:', error)
        toast.error('Error al cargar los cursos')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredCourses = React.useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [courses, searchQuery])

  const getDifficultyColor = React.useCallback((difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-success text-success-foreground"
      case "intermediate":
        return "bg-warning text-warning-foreground"
      case "advanced":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }, [])

  const getDifficultyLabel = React.useCallback((difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "Principiante"
      case "intermediate":
        return "Intermedio"
      case "advanced":
        return "Avanzado"
      default:
        return difficulty
    }
  }, [])

  // Calculate stats with memoization
  const stats = React.useMemo(() => {
    const completedCourses = courses.filter(c => c.completedLessons === c.totalLessons).length
    const inProgressCourses = courses.filter(c => c.completedLessons > 0 && c.completedLessons < c.totalLessons).length
    const totalTime = courses.reduce((acc, c) => {
      const match = c.estimatedTime.match(/(\d+)/)
      return acc + (match ? parseInt(match[1]) : 0)
    }, 0)
    return { completedCourses, inProgressCourses, totalTime }
  }, [courses])

  return (
    <div className="p-6 space-y-8">
      <PageHeader
        title="Aprender"
        description="Cursos interactivos para mejorar tus conocimientos financieros"
        action={
          <Button asChild>
            <Link href="/glosario">
              Ver Glosario
              <ArrowRightIcon className="ml-2 size-4" />
            </Link>
          </Button>
        }
      />

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar cursos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Courses Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron cursos</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => {
            const progress = course.totalLessons > 0 ? (course.completedLessons / course.totalLessons) * 100 : 0
            const isStarted = course.completedLessons > 0
            const isCompleted = course.completedLessons === course.totalLessons

            return (
              <Card key={course.slug} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge className={getDifficultyColor(course.level)}>
                      {getDifficultyLabel(course.level)}
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpenIcon className="size-4" />
                      <span>{course.totalLessons} lecciones</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ClockIcon className="size-4" />
                      <span>{course.estimatedTime}</span>
                    </div>
                  </div>

                  {isStarted && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progreso</span>
                        <span className="font-medium">
                          {course.completedLessons}/{course.totalLessons}
                        </span>
                      </div>
                      <Progress value={progress} />
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full" variant={isCompleted ? "secondary" : "default"}>
                    <Link href={`/aprender/${course.slug}`}>
                      {isCompleted ? (
                        <>
                          <CheckCircleIcon className="mr-2 size-4" />
                          Revisar curso
                        </>
                      ) : isStarted ? (
                        <>
                          Continuar
                          <ArrowRightIcon className="ml-2 size-4" />
                        </>
                      ) : (
                        <>
                          Comenzar
                          <ArrowRightIcon className="ml-2 size-4" />
                        </>
                      )}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3 mt-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos Completados</CardTitle>
            <CheckCircleIcon className="size-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedCourses}</div>
            <p className="text-xs text-muted-foreground">de {courses.length} cursos disponibles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            <TrendingUpIcon className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgressCourses}</div>
            <p className="text-xs text-muted-foreground">Sigue aprendiendo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Estimado</CardTitle>
            <ClockIcon className="size-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.totalTime / 60)}h</div>
            <p className="text-xs text-muted-foreground">Total de contenido</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
