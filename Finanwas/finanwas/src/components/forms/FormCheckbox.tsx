"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

/**
 * FormCheckbox Component
 *
 * A styled checkbox with integrated label and error message display.
 * Supports indeterminate state and custom styling.
 *
 * @example
 * ```tsx
 * <FormCheckbox
 *   id="terms"
 *   label="I accept the terms and conditions"
 *   checked={accepted}
 *   onCheckedChange={setAccepted}
 *   error="You must accept the terms"
 *   required
 * />
 * ```
 */

export interface FormCheckboxProps extends Omit<React.ComponentProps<"input">, "type" | "onChange"> {
  /** Unique identifier for the checkbox */
  id: string
  /** Label text displayed next to the checkbox */
  label: string | React.ReactNode
  /** Error message to display below the checkbox */
  error?: string
  /** Controlled checked state */
  checked?: boolean
  /** Callback when checked state changes */
  onCheckedChange?: (checked: boolean) => void
  /** Additional CSS classes for the container */
  containerClassName?: string
  /** Additional CSS classes for the label */
  labelClassName?: string
  /** Additional CSS classes for the error message */
  errorClassName?: string
}

export function FormCheckbox({
  id,
  label,
  error,
  checked,
  onCheckedChange,
  containerClassName,
  labelClassName,
  errorClassName,
  className,
  required,
  disabled,
  ...props
}: FormCheckboxProps) {
  return (
    <div className={cn("flex flex-col gap-2", containerClassName)}>
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          disabled={disabled}
          className={cn(
            "mt-0.5 size-4 shrink-0 rounded border border-input bg-transparent shadow-xs transition-colors cursor-pointer",
            "checked:bg-primary checked:border-primary",
            "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive",
            className
          )}
          required={required}
          {...props}
        />
        <Label
          htmlFor={id}
          className={cn(
            "cursor-pointer select-none leading-relaxed",
            disabled && "cursor-not-allowed opacity-50",
            labelClassName
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
        </Label>
      </div>
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
