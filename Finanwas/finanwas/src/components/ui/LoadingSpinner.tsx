"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Loader2Icon } from "lucide-react"

/**
 * LoadingSpinner Component
 *
 * A customizable loading spinner with optional text.
 * Provides consistent loading states across the application.
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="lg" text="Loading transactions..." />
 * ```
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="sm" className="text-primary" />
 * ```
 */

export interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  /** Optional text to display below the spinner */
  text?: string
  /** Whether to center the spinner in its container */
  centered?: boolean
  /** Additional CSS classes */
  className?: string
  /** Additional CSS classes for the text */
  textClassName?: string
}

const sizeClasses = {
  xs: "size-3",
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
  xl: "size-12",
}

export function LoadingSpinner({
  size = "md",
  text,
  centered = false,
  className,
  textClassName,
}: LoadingSpinnerProps) {
  const content = (
    <>
      <Loader2Icon
        className={cn(
          "animate-spin text-muted-foreground",
          sizeClasses[size],
          className
        )}
        aria-hidden="true"
      />
      {text && (
        <p
          className={cn(
            "text-sm text-muted-foreground",
            textClassName
          )}
        >
          {text}
        </p>
      )}
      <span className="sr-only">{text || "Loading..."}</span>
    </>
  )

  if (centered) {
    return (
      <div className="flex min-h-[200px] w-full flex-col items-center justify-center gap-3">
        {content}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {content}
    </div>
  )
}

/**
 * FullPageLoader Component
 *
 * A full-page loading overlay with spinner.
 *
 * @example
 * ```tsx
 * {isLoading && <FullPageLoader text="Loading application..." />}
 * ```
 */

export interface FullPageLoaderProps {
  /** Optional text to display below the spinner */
  text?: string
  /** Background opacity (0-100) */
  backgroundOpacity?: number
}

export function FullPageLoader({
  text,
  backgroundOpacity = 80,
}: FullPageLoaderProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        `bg-background/${backgroundOpacity}`
      )}
      role="status"
      aria-live="polite"
    >
      <LoadingSpinner size="xl" text={text} />
    </div>
  )
}
