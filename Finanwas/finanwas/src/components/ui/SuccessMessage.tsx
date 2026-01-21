"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle2Icon, XIcon } from "lucide-react"

/**
 * SuccessMessage Component
 *
 * Displays success messages with consistent styling.
 * Supports different variants and optional dismissal.
 *
 * @example
 * ```tsx
 * <SuccessMessage
 *   title="Success!"
 *   message="Transaction created successfully"
 *   onDismiss={() => setSuccess(null)}
 * />
 * ```
 *
 * @example
 * ```tsx
 * <SuccessMessage
 *   message="Changes saved"
 *   variant="inline"
 * />
 * ```
 */

export interface SuccessMessageProps {
  /** Success title (optional) */
  title?: string
  /** Success message */
  message: string | React.ReactNode
  /** Visual variant */
  variant?: "default" | "inline" | "banner"
  /** Optional dismiss action */
  onDismiss?: () => void
  /** Additional CSS classes */
  className?: string
  /** Show success icon */
  showIcon?: boolean
  /** Auto-dismiss after milliseconds (0 = no auto-dismiss) */
  autoDismiss?: number
}

export function SuccessMessage({
  title,
  message,
  variant = "default",
  onDismiss,
  className,
  showIcon = true,
  autoDismiss = 0,
}: SuccessMessageProps) {
  React.useEffect(() => {
    if (autoDismiss > 0 && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss()
      }, autoDismiss)

      return () => clearTimeout(timer)
    }
  }, [autoDismiss, onDismiss])

  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex items-start gap-2 rounded-md bg-success/10 p-3 text-sm text-success",
          className
        )}
        role="status"
      >
        {showIcon && <CheckCircle2Icon className="size-4 mt-0.5 shrink-0" />}
        <div className="flex-1">{message}</div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="shrink-0 text-success/70 hover:text-success transition-colors"
            aria-label="Dismiss message"
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
          "w-full border-l-4 border-success bg-success/10 p-4",
          className
        )}
        role="status"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            {showIcon && <CheckCircle2Icon className="size-5 mt-0.5 shrink-0 text-success" />}
            <div className="flex-1 space-y-1">
              {title && <p className="font-semibold text-success">{title}</p>}
              <div className="text-sm text-success/90">{message}</div>
            </div>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="shrink-0 text-success/70 hover:text-success transition-colors"
              aria-label="Dismiss message"
            >
              <XIcon className="size-4" />
            </button>
          )}
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div
      className={cn(
        "rounded-lg border border-success bg-success/5 p-4",
        className
      )}
      role="status"
    >
      <div className="flex items-start gap-3">
        {showIcon && <CheckCircle2Icon className="size-5 mt-0.5 shrink-0 text-success" />}
        <div className="flex-1 space-y-1">
          {title && <h4 className="font-semibold text-success">{title}</h4>}
          <div className="text-sm text-success/90">{message}</div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="shrink-0 text-success/70 hover:text-success transition-colors"
            aria-label="Dismiss message"
          >
            <XIcon className="size-4" />
          </button>
        )}
      </div>
    </div>
  )
}
