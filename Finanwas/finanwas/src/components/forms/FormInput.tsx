"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/**
 * FormInput Component
 *
 * A styled input field with integrated label and error message display.
 * Provides consistent form field styling across the application.
 *
 * @example
 * ```tsx
 * <FormInput
 *   id="email"
 *   label="Email Address"
 *   type="email"
 *   placeholder="Enter your email"
 *   error="Invalid email address"
 *   required
 * />
 * ```
 */

export interface FormInputProps extends React.ComponentProps<typeof Input> {
  /** Unique identifier for the input field */
  id: string
  /** Label text displayed above the input */
  label: string
  /** Error message to display below the input */
  error?: string
  /** Additional CSS classes for the container */
  containerClassName?: string
  /** Additional CSS classes for the label */
  labelClassName?: string
  /** Additional CSS classes for the error message */
  errorClassName?: string
}

export function FormInput({
  id,
  label,
  error,
  containerClassName,
  labelClassName,
  errorClassName,
  className,
  required,
  ...props
}: FormInputProps) {
  return (
    <div className={cn("flex flex-col gap-2", containerClassName)}>
      <Label
        htmlFor={id}
        className={cn(labelClassName)}
      >
        {label}
        {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
      </Label>
      <Input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(error && "border-destructive", className)}
        required={required}
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
