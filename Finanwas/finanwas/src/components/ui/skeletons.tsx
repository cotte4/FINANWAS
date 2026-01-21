import * as React from "react"
import { cn } from "@/lib/utils"
import { Skeleton } from "./skeleton"
import { Card, CardContent, CardHeader } from "./card"

/**
 * CardSkeleton
 * Loading skeleton that mimics a card with header and content
 */
interface CardSkeletonProps {
  className?: string
  /** Show skeleton header with title and description */
  showHeader?: boolean
  /** Number of content lines to display */
  lines?: number
  /** Custom height for each line */
  lineHeight?: string
}

function CardSkeleton({
  className,
  showHeader = true,
  lines = 3,
  lineHeight = "h-4",
}: CardSkeletonProps) {
  return (
    <Card className={cn("animate-pulse", className)}>
      {showHeader && (
        <CardHeader className="space-y-2">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn(
              lineHeight,
              i === lines - 1 ? "w-3/4" : "w-full"
            )}
          />
        ))}
      </CardContent>
    </Card>
  )
}

/**
 * TableSkeleton
 * Loading skeleton that mimics a table with rows and columns
 */
interface TableSkeletonProps {
  className?: string
  /** Number of rows to display */
  rows?: number
  /** Number of columns to display */
  columns?: number
  /** Show table header */
  showHeader?: boolean
}

function TableSkeleton({
  className,
  rows = 5,
  columns = 4,
  showHeader = true,
}: TableSkeletonProps) {
  return (
    <div className={cn("w-full overflow-auto", className)}>
      <div className="min-w-full">
        {/* Table Header */}
        {showHeader && (
          <div className="border-b">
            <div className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, i) => (
                <Skeleton key={`header-${i}`} className="h-4 w-3/4" />
              ))}
            </div>
          </div>
        )}

        {/* Table Body */}
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
              key={`row-${rowIndex}`}
              className="grid gap-4 p-4"
              style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton
                  key={`cell-${rowIndex}-${colIndex}`}
                  className={cn(
                    "h-4",
                    colIndex === 0 ? "w-full" : "w-2/3"
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * ChartSkeleton
 * Loading skeleton that mimics a chart area with bars/lines
 */
interface ChartSkeletonProps {
  className?: string
  /** Chart type: bar, line, or pie */
  variant?: "bar" | "line" | "pie"
  /** Height of the chart area */
  height?: string
}

function ChartSkeleton({
  className,
  variant = "bar",
  height = "h-64",
}: ChartSkeletonProps) {
  if (variant === "pie") {
    return (
      <div className={cn("flex items-center justify-center p-8", height, className)}>
        <Skeleton className="size-48 rounded-full" />
      </div>
    )
  }

  if (variant === "line") {
    return (
      <div className={cn("relative p-4", height, className)}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between py-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={`y-${i}`} className="h-3 w-8" />
          ))}
        </div>

        {/* Chart area */}
        <div className="ml-12 h-full flex items-end justify-around gap-2">
          {Array.from({ length: 7 }).map((_, i) => {
            const heights = ["h-3/4", "h-2/3", "h-full", "h-1/2", "h-5/6", "h-4/5", "h-2/3"]
            return (
              <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2">
                <Skeleton className={cn("w-full rounded-sm", heights[i])} />
                <Skeleton className="h-3 w-8" />
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Default: bar chart
  return (
    <div className={cn("relative p-4", height, className)}>
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between py-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={`y-${i}`} className="h-3 w-8" />
        ))}
      </div>

      {/* Chart bars */}
      <div className="ml-12 h-full flex items-end justify-around gap-2">
        {Array.from({ length: 6 }).map((_, i) => {
          const heights = ["h-3/4", "h-1/2", "h-full", "h-2/3", "h-5/6", "h-4/5"]
          return (
            <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2">
              <Skeleton className={cn("w-full rounded-sm", heights[i])} />
              <Skeleton className="h-3 w-10" />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { CardSkeleton, TableSkeleton, ChartSkeleton }
