"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { EyeIcon, EyeOffIcon } from "lucide-react"

/**
 * PasswordInput Component
 *
 * A password input field with show/hide toggle functionality.
 * Includes integrated label and error message display.
 *
 * @example
 * ```tsx
 * <PasswordInput
 *   id="password"
 *   label="Password"
 *   placeholder="Enter your password"
 *   error="Password must be at least 8 characters"
 *   showStrength
 *   required
 * />
 * ```
 */

export interface PasswordInputProps extends Omit<React.ComponentProps<typeof Input>, "type"> {
  /** Unique identifier for the password input */
  id: string
  /** Label text displayed above the input */
  label: string
  /** Error message to display below the input */
  error?: string
  /** Whether to show password strength indicator */
  showStrength?: boolean
  /** Additional CSS classes for the container */
  containerClassName?: string
  /** Additional CSS classes for the label */
  labelClassName?: string
  /** Additional CSS classes for the error message */
  errorClassName?: string
}

/**
 * Calculate password strength (0-4)
 */
function calculatePasswordStrength(password: string): number {
  let strength = 0

  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[^a-zA-Z\d]/.test(password)) strength++

  return Math.min(strength, 4)
}

/**
 * Get strength label and color
 */
function getStrengthInfo(strength: number): { label: string; color: string } {
  switch (strength) {
    case 0:
    case 1:
      return { label: "Weak", color: "bg-destructive" }
    case 2:
      return { label: "Fair", color: "bg-warning" }
    case 3:
      return { label: "Good", color: "bg-primary" }
    case 4:
      return { label: "Strong", color: "bg-success" }
    default:
      return { label: "Weak", color: "bg-destructive" }
  }
}

export function PasswordInput({
  id,
  label,
  error,
  showStrength = false,
  containerClassName,
  labelClassName,
  errorClassName,
  className,
  required,
  value,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false)

  const passwordValue = typeof value === "string" ? value : ""
  const strength = showStrength && passwordValue ? calculatePasswordStrength(passwordValue) : 0
  const strengthInfo = getStrengthInfo(strength)

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
          type={showPassword ? "text" : "password"}
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "pr-10",
            error && "border-destructive",
            className
          )}
          required={required}
          value={value}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-xs"
          aria-label={showPassword ? "Hide password" : "Show password"}
          tabIndex={0}
        >
          {showPassword ? (
            <EyeOffIcon className="size-4" />
          ) : (
            <EyeIcon className="size-4" />
          )}
        </button>
      </div>

      {showStrength && passwordValue && (
        <div className="space-y-1">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  level <= strength ? strengthInfo.color : "bg-muted"
                )}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Password strength: <span className="font-medium">{strengthInfo.label}</span>
          </p>
        </div>
      )}

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
