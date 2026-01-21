'use client'

import * as React from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircleIcon, XIcon, CheckCircle2Icon } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Profile Completion Banner for Dashboard
 *
 * US-087: Profile Completion Banner
 * - Shows if questionnaire is not completed
 * - Prompts user to complete profile
 * - Links to questionnaire page
 * - Dismissible for current session
 */

interface ProfileBannerProps {
  questionnaireCompleted: boolean
  className?: string
}

export function ProfileBanner({ questionnaireCompleted, className }: ProfileBannerProps) {
  const [isDismissed, setIsDismissed] = React.useState(false)

  // Don't show if questionnaire is completed
  if (questionnaireCompleted) {
    return null
  }

  // Don't show if dismissed
  if (isDismissed) {
    return null
  }

  return (
    <Card className={cn("border-warning bg-warning/10", className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="shrink-0">
            <AlertCircleIcon className="size-5 text-warning" aria-hidden="true" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">Completá tu perfil financiero</h3>
              <p className="text-sm text-muted-foreground">
                Respondé el cuestionario para recibir tips personalizados y recomendaciones adaptadas a tu perfil.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button size="sm" variant="default" asChild>
                <Link href="/perfil/cuestionario">
                  Completar ahora
                </Link>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsDismissed(true)}
                aria-label="Cerrar banner"
              >
                Más tarde
              </Button>
            </div>
          </div>

          {/* Dismiss button */}
          <button
            onClick={() => setIsDismissed(true)}
            className="shrink-0 p-1 rounded-md hover:bg-accent transition-colors"
            aria-label="Cerrar banner"
          >
            <XIcon className="size-4 text-muted-foreground" />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Profile Completed Banner (optional success state)
 *
 * Shows a brief success message when profile is completed
 * Can be used after questionnaire completion
 */

interface ProfileCompletedBannerProps {
  investorType?: string
  className?: string
  onDismiss?: () => void
}

export function ProfileCompletedBanner({
  investorType,
  className,
  onDismiss
}: ProfileCompletedBannerProps) {
  const getInvestorTypeLabel = (type?: string) => {
    switch (type) {
      case 'conservador':
        return 'Conservador'
      case 'moderado':
        return 'Moderado'
      case 'agresivo':
        return 'Agresivo'
      default:
        return 'No definido'
    }
  }

  return (
    <Card className={cn("border-success bg-success/10", className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="shrink-0">
            <CheckCircle2Icon className="size-5 text-success" aria-hidden="true" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">Perfil completado</h3>
              <p className="text-sm text-muted-foreground">
                Tu perfil de inversor es: <span className="font-medium text-foreground">{getInvestorTypeLabel(investorType)}</span>
              </p>
            </div>
          </div>

          {/* Dismiss button */}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="shrink-0 p-1 rounded-md hover:bg-accent transition-colors"
              aria-label="Cerrar banner"
            >
              <XIcon className="size-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
