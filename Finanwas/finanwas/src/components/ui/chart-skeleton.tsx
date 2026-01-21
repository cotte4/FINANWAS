import * as React from "react"
import { cn } from "@/lib/utils"
import { Skeleton } from "./skeleton"

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

/**
 * DonutChartSkeleton
 * Loading skeleton for donut/pie charts with legend
 */
function DonutChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-between gap-8 p-4", className)}>
      {/* Donut chart */}
      <div className="relative">
        <Skeleton className="size-32 rounded-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-background size-16 rounded-full" />
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="size-3 rounded-sm" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-12 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

export { ChartSkeleton, DonutChartSkeleton }
