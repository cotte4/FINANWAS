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
 * StatsCardSkeleton
 * Loading skeleton specifically for stats cards
 */
function StatsCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("animate-pulse", className)}>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="size-8 rounded-full" />
        </div>
        <Skeleton className="h-8 w-2/3" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-3 w-16" />
        </div>
      </CardContent>
    </Card>
  )
}

export { CardSkeleton, StatsCardSkeleton }
