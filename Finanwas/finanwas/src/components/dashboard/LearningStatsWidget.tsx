'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BookOpenIcon,
  ClockIcon,
  TrophyIcon,
  FlameIcon,
  TrendingUpIcon,
  ArrowRightIcon,
} from 'lucide-react'
import { formatTime } from '@/hooks/useLessonTracking'

interface LearningStats {
  totalTimeSpentSeconds: number
  totalLessonsCompleted: number
  totalLessonsStarted: number
  averageProgressPercentage: number
  currentStreak: number
  longestStreak: number
  lastActivityDate: string | null
}

/**
 * LearningStatsWidget Component
 * Displays comprehensive learning statistics on the dashboard
 */
export function LearningStatsWidget() {
  const [stats, setStats] = React.useState<LearningStats | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState(false)

  React.useEffect(() => {
    async function loadStats() {
      try {
        setIsLoading(true)
        setError(false)

        const response = await fetch('/api/progress/stats')
        if (!response.ok) {
          throw new Error('Failed to fetch learning stats')
        }

        const data = await response.json()
        setStats(data.stats)
      } catch (error) {
        console.error('Error loading learning stats:', error)
        setError(true)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tu Progreso de Aprendizaje</CardTitle>
          <CardDescription>Estadísticas de tus lecciones</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tu Progreso de Aprendizaje</CardTitle>
          <CardDescription>Estadísticas de tus lecciones</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Error al cargar las estadísticas. Intenta nuevamente más tarde.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Si no hay actividad
  if (stats.totalLessonsStarted === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tu Progreso de Aprendizaje</CardTitle>
          <CardDescription>Comienza tu viaje de aprendizaje</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-4">
            <BookOpenIcon className="size-12 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Aún no has comenzado ninguna lección.
              <br />
              ¡Es hora de empezar a aprender!
            </p>
            <Link
              href="/aprender"
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              Explorar cursos
              <ArrowRightIcon className="ml-1 size-4" />
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tu Progreso de Aprendizaje</CardTitle>
        <CardDescription>Estadísticas de tu actividad educativa</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Lecciones completadas */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpenIcon className="size-4" />
              <span className="text-xs">Completadas</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalLessonsCompleted}</p>
            <p className="text-xs text-muted-foreground">
              de {stats.totalLessonsStarted} iniciadas
            </p>
          </div>

          {/* Tiempo total invertido */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ClockIcon className="size-4" />
              <span className="text-xs">Tiempo total</span>
            </div>
            <p className="text-2xl font-bold">{formatTime(stats.totalTimeSpentSeconds)}</p>
            <p className="text-xs text-muted-foreground">
              {Math.round(stats.totalTimeSpentSeconds / 60)} minutos
            </p>
          </div>

          {/* Racha actual */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FlameIcon className="size-4" />
              <span className="text-xs">Racha actual</span>
            </div>
            <p className="text-2xl font-bold flex items-center gap-2">
              {stats.currentStreak}
              {stats.currentStreak > 0 && (
                <FlameIcon className="size-5 text-orange-500 fill-orange-500" />
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {stats.currentStreak === 1 ? 'día' : 'días'} consecutivos
            </p>
          </div>

          {/* Racha más larga */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrophyIcon className="size-4" />
              <span className="text-xs">Mejor racha</span>
            </div>
            <p className="text-2xl font-bold">{stats.longestStreak}</p>
            <p className="text-xs text-muted-foreground">
              {stats.longestStreak === 1 ? 'día' : 'días'}
            </p>
          </div>
        </div>

        {/* Progreso promedio */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUpIcon className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Progreso promedio</span>
            </div>
            <Badge variant="secondary" className="font-semibold">
              {stats.averageProgressPercentage}%
            </Badge>
          </div>
        </div>

        {/* Última actividad */}
        {stats.lastActivityDate && (
          <div className="text-xs text-muted-foreground text-center">
            Última actividad: {new Date(stats.lastActivityDate).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </div>
        )}

        {/* CTA */}
        <div className="pt-2">
          <Link
            href="/aprender"
            className="inline-flex items-center text-sm text-primary hover:underline"
          >
            Continuar aprendiendo
            <ArrowRightIcon className="ml-1 size-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
