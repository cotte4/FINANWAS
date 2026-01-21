"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { AlertCircleIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * ErrorMessage Component
 *
 * Displays error messages with consistent styling.
 * Supports different variants and optional dismissal.
 *
 * @example
 * ```tsx
 * <ErrorMessage
 *   title="Error"
 *   message="Failed to load transactions"
 *   onDismiss={() => setError(null)}
 * />
 * ```
 *
 * @example
 * ```tsx
 * <ErrorMessage
 *   message="Please fill in all required fields"
 *   variant="inline"
 * />
 * ```
 */

export interface ErrorMessageProps {
  /** Error title (optional) */
  title?: string
  /** Error message */
  message: string | React.ReactNode
  /** Visual variant */
  variant?: "default" | "inline" | "banner"
  /** Optional retry action */
  onRetry?: () => void
  /** Optional dismiss action */
  onDismiss?: () => void
  /** Additional CSS classes */
  className?: string
  /** Show error icon */
  showIcon?: boolean
}

export function ErrorMessage({
  title,
  message,
  variant = "default",
  onRetry,
  onDismiss,
  className,
  showIcon = true,
}: ErrorMessageProps) {
  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive",
          className
        )}
        role="alert"
      >
        {showIcon && <AlertCircleIcon className="size-4 mt-0.5 shrink-0" />}
        <div className="flex-1">{message}</div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="shrink-0 text-destructive/70 hover:text-destructive transition-colors"
            aria-label="Dismiss error"
          >
            <XIcon className="size-4" />
          </button>
        )}
      </div>
    )
  }

  if (variant === "banner") {
    return (
      <div
        className={cn(
          "w-full border-l-4 border-destructive bg-destructive/10 p-4",
          className
        )}
        role="alert"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            {showIcon && <AlertCircleIcon className="size-5 mt-0.5 shrink-0 text-destructive" />}
            <div className="flex-1 space-y-1">
              {title && <p className="font-semibold text-destructive">{title}</p>}
              <div className="text-sm text-destructive/90">{message}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="shrink-0"
              >
                Retry
              </Button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="shrink-0 text-destructive/70 hover:text-destructive transition-colors"
                aria-label="Dismiss error"
              >
                <XIcon className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div
      className={cn(
        "rounded-lg border border-destructive bg-destructive/5 p-4",
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {showIcon && <AlertCircleIcon className="size-5 mt-0.5 shrink-0 text-destructive" />}
        <div className="flex-1 space-y-2">
          {title && <h4 className="font-semibold text-destructive">{title}</h4>}
          <div className="text-sm text-destructive/90">{message}</div>
          {(onRetry || onDismiss) && (
            <div className="flex gap-2 pt-2">
              {onRetry && (
                <Button variant="outline" size="sm" onClick={onRetry}>
                  Retry
                </Button>
              )}
              {onDismiss && (
                <Button variant="ghost" size="sm" onClick={onDismiss}>
                  Dismiss
                </Button>
              )}
            </div>
          )}
        </div>
        {onDismiss && !onRetry && (
          <button
            onClick={onDismiss}
            className="shrink-0 text-destructive/70 hover:text-destructive transition-colors"
            aria-label="Dismiss error"
          >
            <XIcon className="size-4" />
          </button>
        )}
      </div>
    </div>
  )
}
