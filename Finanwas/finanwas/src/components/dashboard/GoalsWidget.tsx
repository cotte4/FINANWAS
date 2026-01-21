'use client'

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { TargetIcon, ArrowRightIcon, PlusCircleIcon } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Goals Widget for Dashboard
 *
 * US-086: Goals Progress Widget
 * - Shows up to 3 active goals
 * - Shows progress bars for each goal
 * - Shows current/target amounts
 * - Empty state with call to action
 * - Links to goals page
 */

interface SavingsGoal {
  id: string
  name: string
  target_amount: number
  current_amount: number
  currency: string
  target_date: string | null
  completed_at: string | null
}

interface GoalsWidgetProps {
  className?: string
}

export function GoalsWidget({ className }: GoalsWidgetProps) {
  const [isLoading, setIsLoading] = React.useState(true)
  const [goals, setGoals] = React.useState<SavingsGoal[]>([])
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchGoals() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch('/api/goals')
        if (!response.ok) throw new Error('Error al cargar metas')

        const data = await response.json()
        setGoals(data.goals || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setIsLoading(false)
      }
    }

    fetchGoals()
  }, [])

  // Get active goals (not completed) and limit to top 3
  const activeGoals = React.useMemo(() => {
    return goals
      .filter(g => !g.completed_at)
      .slice(0, 3)
  }, [goals])

  // Calculate progress for a goal
  const getGoalProgress = (goal: SavingsGoal) => {
    if (goal.target_amount === 0) return 0
    return Math.min((goal.current_amount / goal.target_amount) * 100, 100)
  }

  // Determine progress color based on progress and target date
  const getProgressColor = React.useCallback((goal: SavingsGoal) => {
    const progress = getGoalProgress(goal)

    if (progress >= 100) return "success"

    if (!goal.target_date) {
      // No target date, use simple thresholds
      if (progress >= 75) return "success"
      if (progress >= 50) return "warning"
      return "primary"
    }

    // No created_at field in database yet - use simple progress-based colors
    // TODO: When goal created_at field is added, implement proper time-based tracking
    if (progress >= 75) return "success"
    if (progress >= 50) return "warning"
    return "primary"
  }, [])

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TargetIcon className="size-5 text-success" />
            <CardTitle>Mis Metas de Ahorro</CardTitle>
          </div>
          <CardDescription>Progreso actual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
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
            <TargetIcon className="size-5 text-success" />
            <CardTitle>Mis Metas de Ahorro</CardTitle>
          </div>
          <CardDescription>Progreso actual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-destructive">{error}</div>
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (activeGoals.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TargetIcon className="size-5 text-success" />
            <CardTitle>Mis Metas de Ahorro</CardTitle>
          </div>
          <CardDescription>Progreso actual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <TargetIcon className="size-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-2">
                No tenés metas de ahorro activas.
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Creá tu primera meta para comenzar a ahorrar
              </p>
              <Button variant="default" size="sm" asChild>
                <Link href="/metas">
                  <PlusCircleIcon className="mr-2 size-4" />
                  Crear primera meta
                </Link>
              </Button>
            </div>

            <Button variant="outline" className="w-full" asChild>
              <Link href="/metas">
                Ir a Metas
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
          <TargetIcon className="size-5 text-success" />
          <CardTitle>Mis Metas de Ahorro</CardTitle>
        </div>
        <CardDescription>Progreso actual</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Active goals list */}
          {activeGoals.map((goal) => {
            const progress = getGoalProgress(goal)
            const progressColor = getProgressColor(goal)

            return (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium truncate">{goal.name}</span>
                  <span className="text-muted-foreground ml-2 shrink-0">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress
                  value={progress}
                  className={cn(
                    progressColor === "success" && "[&>div]:bg-success",
                    progressColor === "warning" && "[&>div]:bg-warning"
                  )}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {goal.currency} ${goal.current_amount.toLocaleString('es-AR', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    })} / ${goal.target_amount.toLocaleString('es-AR', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    })}
                  </span>
                  {goal.target_date && (
                    <span>
                      {new Date(goal.target_date).toLocaleDateString('es-AR', {
                        year: 'numeric',
                        month: 'short'
                      })}
                    </span>
                  )}
                </div>
              </div>
            )
          })}

          {/* Link to all goals */}
          <Button variant="outline" className="w-full mt-4" asChild>
            <Link href="/metas">
              Ver todas las metas
              <ArrowRightIcon className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
