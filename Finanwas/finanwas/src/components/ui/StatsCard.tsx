"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react"

/**
 * StatsCard Component
 *
 * A card for displaying statistics and metrics.
 * Supports trend indicators, icons, and comparison values.
 *
 * @example
 * ```tsx
 * <StatsCard
 *   title="Total Revenue"
 *   value="$12,450"
 *   description="Last 30 days"
 *   trend={{ value: 12.5, label: "vs last month" }}
 *   icon={DollarSignIcon}
 * />
 * ```
 *
 * @example
 * ```tsx
 * <StatsCard
 *   title="Active Users"
 *   value={1234}
 *   trend={{ value: -5.2 }}
 *   variant="secondary"
 * />
 * ```
 */

export interface TrendData {
  /** Trend value (positive or negative) */
  value: number
  /** Optional label for the trend */
  label?: string
}

export interface StatsCardProps {
  /** Card title */
  title: string
  /** Primary value to display */
  value: string | number
  /** Optional description */
  description?: string
  /** Optional trend data */
  trend?: TrendData
  /** Optional icon */
  icon?: LucideIcon
  /** Visual variant */
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "destructive"
  /** Whether the card is loading */
  isLoading?: boolean
  /** Additional CSS classes */
  className?: string
}

const variantStyles = {
  default: "border-border",
  primary: "border-primary bg-primary/5",
  secondary: "border-secondary bg-secondary/5",
  success: "border-success bg-success/5",
  warning: "border-warning bg-warning/5",
  destructive: "border-destructive bg-destructive/5",
}

const variantIconColors = {
  default: "text-muted-foreground",
  primary: "text-primary",
  secondary: "text-secondary",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
}

export function StatsCard({
  title,
  value,
  description,
  trend,
  icon: Icon,
  variant = "default",
  isLoading = false,
  className,
}: StatsCardProps) {
  const isPositiveTrend = trend && trend.value > 0
  const isNegativeTrend = trend && trend.value < 0
  const TrendIcon = isPositiveTrend ? TrendingUpIcon : TrendingDownIcon

  if (isLoading) {
    return (
      <Card className={cn(variantStyles[variant], className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {Icon && (
            <div className="size-4 rounded-full bg-muted animate-pulse" />
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-8 w-32 bg-muted rounded animate-pulse" />
            {(description || trend) && (
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && (
          <Icon className={cn("size-4", variantIconColors[variant])} />
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-2xl font-bold">
            {typeof value === "number" ? value.toLocaleString() : value}
          </div>
          {(description || trend) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {trend && (
                <span
                  className={cn(
                    "flex items-center gap-1 font-medium",
                    isPositiveTrend && "text-success",
                    isNegativeTrend && "text-destructive"
                  )}
                >
                  {trend.value !== 0 && (
                    <TrendIcon className="size-3" aria-hidden="true" />
                  )}
                  {Math.abs(trend.value)}%
                </span>
              )}
              {trend?.label && <span>{trend.label}</span>}
              {!trend?.label && description && <span>{description}</span>}
            </div>
          )}
          {!trend && description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * StatsCardSkeleton Component
 *
 * Loading skeleton for StatsCard.
 *
 * @example
 * ```tsx
 * {isLoading ? <StatsCardSkeleton /> : <StatsCard {...props} />}
 * ```
 */
export function StatsCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("border-border", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        <div className="size-4 rounded-full bg-muted animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-8 w-32 bg-muted rounded animate-pulse" />
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  )
}
