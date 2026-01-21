"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

/**
 * FormTextarea Component
 *
 * A styled textarea field with integrated label and error message display.
 * Includes character count functionality for better UX.
 *
 * @example
 * ```tsx
 * <FormTextarea
 *   id="description"
 *   label="Description"
 *   placeholder="Enter description"
 *   maxLength={500}
 *   showCharCount
 *   error="Description is required"
 *   required
 * />
 * ```
 */

export interface FormTextareaProps extends React.ComponentProps<"textarea"> {
  /** Unique identifier for the textarea field */
  id: string
  /** Label text displayed above the textarea */
  label: string
  /** Error message to display below the textarea */
  error?: string
  /** Whether to show character count */
  showCharCount?: boolean
  /** Additional CSS classes for the container */
  containerClassName?: string
  /** Additional CSS classes for the label */
  labelClassName?: string
  /** Additional CSS classes for the error message */
  errorClassName?: string
}

export function FormTextarea({
  id,
  label,
  error,
  showCharCount = false,
  containerClassName,
  labelClassName,
  errorClassName,
  className,
  required,
  maxLength,
  value,
  ...props
}: FormTextareaProps) {
  const currentLength = typeof value === "string" ? value.length : 0

  return (
    <div className={cn("flex flex-col gap-2", containerClassName)}>
      <div className="flex items-center justify-between">
        <Label
          htmlFor={id}
          className={cn(labelClassName)}
        >
          {label}
          {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
        </Label>
        {showCharCount && maxLength && (
          <span className="text-muted-foreground text-xs">
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
      <textarea
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none",
          "placeholder:text-muted-foreground",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:bg-input/30",
          "resize-y",
          error && "border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
          className
        )}
        required={required}
        maxLength={maxLength}
        value={value}
        {...props}
      />
      {error && (
        <p
          id={`${id}-error`}
          className={cn("text-destructive text-sm", errorClassName)}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}
