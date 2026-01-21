"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CalendarIcon } from "lucide-react"

/**
 * FormDatePicker Component
 *
 * A styled date picker input with integrated label and error message display.
 * Uses native HTML5 date input with enhanced styling.
 *
 * @example
 * ```tsx
 * <FormDatePicker
 *   id="transaction-date"
 *   label="Transaction Date"
 *   value={date}
 *   onChange={(e) => setDate(e.target.value)}
 *   min="2024-01-01"
 *   max="2024-12-31"
 *   error="Invalid date"
 *   required
 * />
 * ```
 */

export interface FormDatePickerProps extends Omit<React.ComponentProps<"input">, "type"> {
  /** Unique identifier for the date picker */
  id: string
  /** Label text displayed above the date picker */
  label: string
  /** Error message to display below the date picker */
  error?: string
  /** Additional CSS classes for the container */
  containerClassName?: string
  /** Additional CSS classes for the label */
  labelClassName?: string
  /** Additional CSS classes for the error message */
  errorClassName?: string
}

export function FormDatePicker({
  id,
  label,
  error,
  containerClassName,
  labelClassName,
  errorClassName,
  className,
  required,
  ...props
}: FormDatePickerProps) {
  return (
    <div className={cn("flex flex-col gap-2", containerClassName)}>
      <Label
        htmlFor={id}
        className={cn(labelClassName)}
      >
        {label}
        {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
      </Label>
      <div className="relative">
        <Input
          type="date"
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "pr-10",
            error && "border-destructive",
            // Style the calendar icon on webkit browsers
            "[&::-webkit-calendar-picker-indicator]:opacity-0",
            "[&::-webkit-calendar-picker-indicator]:absolute",
            "[&::-webkit-calendar-picker-indicator]:inset-0",
            "[&::-webkit-calendar-picker-indicator]:w-full",
            "[&::-webkit-calendar-picker-indicator]:h-full",
            "[&::-webkit-calendar-picker-indicator]:cursor-pointer",
            className
          )}
          required={required}
          {...props}
        />
        <CalendarIcon
          className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        />
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
