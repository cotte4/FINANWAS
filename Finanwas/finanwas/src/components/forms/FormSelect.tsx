"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/**
 * FormSelect Component
 *
 * A styled select dropdown with integrated label and error message display.
 * Built on top of shadcn/ui Select component with Radix UI primitives.
 *
 * @example
 * ```tsx
 * <FormSelect
 *   id="category"
 *   label="Category"
 *   placeholder="Select a category"
 *   options={[
 *     { value: "income", label: "Income" },
 *     { value: "expense", label: "Expense" }
 *   ]}
 *   value={selectedValue}
 *   onValueChange={setSelectedValue}
 *   error="Please select a category"
 * />
 * ```
 */

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface FormSelectProps {
  /** Unique identifier for the select field */
  id: string
  /** Label text displayed above the select */
  label: string
  /** Placeholder text when no value is selected */
  placeholder?: string
  /** Array of options to display */
  options: SelectOption[]
  /** Currently selected value */
  value?: string
  /** Callback when selection changes */
  onValueChange?: (value: string) => void
  /** Error message to display below the select */
  error?: string
  /** Whether the field is required */
  required?: boolean
  /** Whether the select is disabled */
  disabled?: boolean
  /** Additional CSS classes for the container */
  containerClassName?: string
  /** Additional CSS classes for the label */
  labelClassName?: string
  /** Additional CSS classes for the trigger */
  triggerClassName?: string
  /** Additional CSS classes for the error message */
  errorClassName?: string
}

export function FormSelect({
  id,
  label,
  placeholder = "Select an option",
  options,
  value,
  onValueChange,
  error,
  required,
  disabled,
  containerClassName,
  labelClassName,
  triggerClassName,
  errorClassName,
}: FormSelectProps) {
  return (
    <div className={cn("flex flex-col gap-2", containerClassName)}>
      <Label
        htmlFor={id}
        className={cn(labelClassName)}
      >
        {label}
        {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
      </Label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "w-full",
            error && "border-destructive",
            triggerClassName
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
