"use client"

import * as React from "react"
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * LineChart Component
 *
 * A responsive line chart built with Recharts.
 * Perfect for displaying trends over time.
 *
 * @example
 * ```tsx
 * <LineChart
 *   title="Revenue Trend"
 *   description="Monthly revenue for 2024"
 *   data={[
 *     { month: "Jan", revenue: 4000, expenses: 2400 },
 *     { month: "Feb", revenue: 3000, expenses: 1398 },
 *     { month: "Mar", revenue: 2000, expenses: 9800 }
 *   ]}
 *   lines={[
 *     { dataKey: "revenue", color: "#10B981", name: "Revenue" },
 *     { dataKey: "expenses", color: "#EF4444", name: "Expenses" }
 *   ]}
 *   xAxisKey="month"
 * />
 * ```
 */

export interface LineConfig {
  /** Data key to plot */
  dataKey: string
  /** Line color */
  color?: string
  /** Display name */
  name?: string
  /** Line type */
  type?: "monotone" | "linear" | "step"
  /** Show dots on line */
  showDots?: boolean
}

export interface LineChartProps {
  /** Chart data */
  data: Record<string, any>[]
  /** Line configurations */
  lines: LineConfig[]
  /** X-axis data key */
  xAxisKey: string
  /** Chart title */
  title?: string
  /** Chart description */
  description?: string
  /** Chart height in pixels */
  height?: number
  /** Whether to show grid */
  showGrid?: boolean
  /** Whether to show legend */
  showLegend?: boolean
  /** Whether to show tooltip */
  showTooltip?: boolean
  /** Whether the chart is loading */
  isLoading?: boolean
  /** Custom value formatter for Y-axis and tooltip */
  valueFormatter?: (value: number) => string
  /** Additional CSS classes for the card */
  className?: string
}

const DEFAULT_COLORS = [
  "oklch(0.62 0.18 165)", // Primary - Green
  "oklch(0.76 0.17 70)",  // Secondary - Amber
  "oklch(0.58 0.22 293)", // Accent - Purple
  "oklch(0.58 0.23 25)",  // Error - Red
  "oklch(0.53 0.01 265)", // Muted - Gray
]

export function LineChart({
  data,
  lines,
  xAxisKey,
  title,
  description,
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  isLoading = false,
  valueFormatter = (value) => value.toLocaleString(),
  className,
}: LineChartProps) {
  // Add default colors to lines that don't have one
  const linesWithColors = lines.map((line, index) => ({
    type: "monotone" as const,
    showDots: false,
    ...line,
    color: line.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  }))

  const chartContent = isLoading ? (
    <div className="flex items-center justify-center" style={{ height }}>
      <div className="text-sm text-muted-foreground">Loading chart...</div>
    </div>
  ) : data.length === 0 ? (
    <div className="flex items-center justify-center" style={{ height }}>
      <div className="text-sm text-muted-foreground">No data available</div>
    </div>
  ) : (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart
        data={data}
        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
      >
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-muted"
            vertical={false}
          />
        )}
        <XAxis
          dataKey={xAxisKey}
          className="text-[10px] sm:text-xs"
          stroke="currentColor"
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          className="text-[10px] sm:text-xs"
          stroke="currentColor"
          tickLine={false}
          axisLine={false}
          tickFormatter={valueFormatter}
        />
        {showTooltip && (
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 sm:p-3 shadow-sm">
                    <div className="font-medium mb-1 sm:mb-2 text-xs sm:text-sm">{label}</div>
                    <div className="space-y-1">
                      {payload.map((entry, index) => (
                        <div key={`tooltip-${index}`} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                          <div
                            className="size-2 sm:size-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-muted-foreground">{entry.name}:</span>
                          <span className="font-medium">
                            {valueFormatter(entry.value as number)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
        )}
        {showLegend && (
          <Legend
            verticalAlign="top"
            height={36}
            content={({ payload }) => (
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4 pb-3 sm:pb-4">
                {payload?.map((entry, index) => (
                  <div key={`legend-${index}`} className="flex items-center gap-1.5 sm:gap-2">
                    <div
                      className="size-2 sm:size-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          />
        )}
        {linesWithColors.map((line, index) => (
          <Line
            key={`line-${index}`}
            type={line.type}
            dataKey={line.dataKey}
            stroke={line.color}
            strokeWidth={2}
            name={line.name || line.dataKey}
            dot={line.showDots}
            activeDot={{ r: 4 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  )

  if (!title && !description) {
    return <div className={className}>{chartContent}</div>
  }

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>{chartContent}</CardContent>
    </Card>
  )
}
