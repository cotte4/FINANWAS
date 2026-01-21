import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import { Button } from "./button"

/**
 * EmptyState Component - US-093
 * Displays when there's no data to show, with optional CTA
 */

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      <Icon className="size-16 text-muted-foreground mb-4 opacity-50" aria-hidden="true" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      {action && (
        <Button onClick={action.onClick} asChild={!!action.href}>
          {action.href ? (
            <a href={action.href}>{action.label}</a>
          ) : (
            action.label
          )}
        </Button>
      )}
    </div>
  )
}
