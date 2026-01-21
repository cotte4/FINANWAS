import * as React from "react"
import { cn } from "@/lib/utils"
import { Skeleton } from "./skeleton"

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
 * ListSkeleton
 * Loading skeleton for simple lists (e.g., notes, goals)
 */
interface ListSkeletonProps {
  className?: string
  /** Number of items to display */
  items?: number
  /** Show avatar/icon on the left */
  showAvatar?: boolean
}

function ListSkeleton({
  className,
  items = 5,
  showAvatar = false,
}: ListSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-4 p-4 border rounded-lg"
        >
          {showAvatar && (
            <Skeleton className="size-10 rounded-full shrink-0" />
          )}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      ))}
    </div>
  )
}

export { TableSkeleton, ListSkeleton }
