'use client'

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { LightbulbIcon, ArrowRightIcon, ExternalLinkIcon } from "lucide-react"

/**
 * Tip Widget for Dashboard
 *
 * US-050: Dashboard Tip Widget
 * - Fetches tip of the day from /api/tips/today
 * - Displays tip in styled card with lightbulb icon
 * - Shows attribution if present
 * - Links to related lesson if present
 * - Loading skeleton while fetching
 */

interface Tip {
  id: string
  content: string
  attribution?: string
  category: string
  related_lesson?: string
}

interface TipWidgetProps {
  className?: string
}

export function TipWidget({ className }: TipWidgetProps) {
  const [isLoading, setIsLoading] = React.useState(true)
  const [tip, setTip] = React.useState<Tip | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchTip() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch('/api/tips/today')
        if (!response.ok) throw new Error('Error al cargar el tip del día')

        const data = await response.json()
        setTip(data.tip || data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
        console.error('Error fetching tip:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTip()
  }, [])

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <LightbulbIcon className="size-5 text-secondary" />
            <CardTitle>Tip del Día</CardTitle>
          </div>
          <CardDescription>Consejo financiero personalizado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-4 w-2/3" />
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
            <LightbulbIcon className="size-5 text-secondary" />
            <CardTitle>Tip del Día</CardTitle>
          </div>
          <CardDescription>Consejo financiero personalizado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-destructive">{error}</div>
        </CardContent>
      </Card>
    )
  }

  // No tip available
  if (!tip) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <LightbulbIcon className="size-5 text-secondary" />
            <CardTitle>Tip del Día</CardTitle>
          </div>
          <CardDescription>Consejo financiero personalizado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            No hay tip disponible en este momento
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <LightbulbIcon className="size-5 text-secondary" />
          <CardTitle>Tip del Día</CardTitle>
        </div>
        <CardDescription>Consejo financiero personalizado</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Tip Content */}
          <div className="p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
            <p className="text-sm leading-relaxed text-text">
              {tip.content}
            </p>
          </div>

          {/* Attribution */}
          {tip.attribution && (
            <p className="text-xs text-muted-foreground italic">
              — {tip.attribution}
            </p>
          )}

          {/* Related Lesson Link */}
          {tip.related_lesson && (
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href={`/aprender${tip.related_lesson}`}>
                Ver lección relacionada
                <ExternalLinkIcon className="ml-2 size-3" />
              </Link>
            </Button>
          )}

          {/* Category Badge */}
          <div className="text-xs text-muted-foreground">
            Categoría: {tip.category}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
