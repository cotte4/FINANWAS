"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

/**
 * FormRadioGroup Component
 *
 * A styled radio button group with integrated label and error message display.
 * Supports both vertical and horizontal layouts.
 *
 * @example
 * ```tsx
 * <FormRadioGroup
 *   id="payment-method"
 *   label="Payment Method"
 *   options={[
 *     { value: "credit", label: "Credit Card" },
 *     { value: "debit", label: "Debit Card" },
 *     { value: "cash", label: "Cash" }
 *   ]}
 *   value={selectedMethod}
 *   onChange={setSelectedMethod}
 *   orientation="horizontal"
 *   required
 * />
 * ```
 */

export interface RadioOption {
  value: string
  label: string | React.ReactNode
  disabled?: boolean
}

export interface FormRadioGroupProps {
  /** Unique identifier for the radio group */
  id: string
  /** Label text displayed above the radio group */
  label: string
  /** Array of radio options */
  options: RadioOption[]
  /** Currently selected value */
  value?: string
  /** Callback when selection changes */
  onChange?: (value: string) => void
  /** Error message to display below the radio group */
  error?: string
  /** Layout orientation */
  orientation?: "vertical" | "horizontal"
  /** Whether the field is required */
  required?: boolean
  /** Whether the radio group is disabled */
  disabled?: boolean
  /** Additional CSS classes for the container */
  containerClassName?: string
  /** Additional CSS classes for the label */
  labelClassName?: string
  /** Additional CSS classes for the options container */
  optionsClassName?: string
  /** Additional CSS classes for the error message */
  errorClassName?: string
}

export function FormRadioGroup({
  id,
  label,
  options,
  value,
  onChange,
  error,
  orientation = "vertical",
  required,
  disabled,
  containerClassName,
  labelClassName,
  optionsClassName,
  errorClassName,
}: FormRadioGroupProps) {
  return (
    <div className={cn("flex flex-col gap-2", containerClassName)}>
      <Label className={cn(labelClassName)}>
        {label}
        {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
      </Label>
      <div
        role="radiogroup"
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "flex gap-4",
          orientation === "vertical" ? "flex-col" : "flex-row flex-wrap",
          optionsClassName
        )}
      >
        {options.map((option, index) => {
          const optionId = `${id}-${option.value}`
          const isDisabled = disabled || option.disabled

          return (
            <div key={option.value} className="flex items-start gap-2">
              <input
                type="radio"
                id={optionId}
                name={id}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange?.(e.target.value)}
                disabled={isDisabled}
                required={required && index === 0}
                className={cn(
                  "mt-0.5 size-4 shrink-0 rounded-full border border-input bg-transparent shadow-xs transition-colors cursor-pointer",
                  "checked:border-[5px] checked:border-primary",
                  "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  error && "border-destructive"
                )}
              />
              <Label
                htmlFor={optionId}
                className={cn(
                  "cursor-pointer select-none leading-relaxed",
                  isDisabled && "cursor-not-allowed opacity-50"
                )}
              >
                {option.label}
              </Label>
            </div>
          )
        })}
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
