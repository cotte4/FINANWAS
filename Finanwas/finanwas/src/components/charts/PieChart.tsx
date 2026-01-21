"use client"

import * as React from "react"
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * PieChart Component
 *
 * A responsive pie chart built with Recharts.
 * Displays data in a circular format with customizable colors.
 *
 * @example
 * ```tsx
 * <PieChart
 *   title="Expenses by Category"
 *   description="Total expenses: $1,234"
 *   data={[
 *     { name: "Food", value: 450, color: "#10B981" },
 *     { name: "Transport", value: 200, color: "#F59E0B" },
 *     { name: "Entertainment", value: 150, color: "#8B5CF6" }
 *   ]}
 * />
 * ```
 */

export interface PieChartDataItem {
  /** Label for the segment */
  name: string
  /** Numeric value */
  value: number
  /** Optional color (defaults to theme colors) */
  color?: string
}

export interface PieChartProps {
  /** Chart data */
  data: PieChartDataItem[]
  /** Chart title */
  title?: string
  /** Chart description */
  description?: string
  /** Chart height in pixels */
  height?: number
  /** Whether to show legend */
  showLegend?: boolean
  /** Whether to show tooltip */
  showTooltip?: boolean
  /** Whether to show labels on segments */
  showLabels?: boolean
  /** Inner radius (for donut chart, 0-100) */
  innerRadius?: number
  /** Whether the chart is loading */
  isLoading?: boolean
  /** Custom value formatter for tooltip */
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
  "oklch(0.62 0.18 200)", // Teal
  "oklch(0.70 0.19 45)",  // Orange
  "oklch(0.65 0.24 330)", // Pink
]

const RADIAN = Math.PI / 180

/**
 * Custom label renderer for pie chart
 */
const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: {
  cx?: number
  cy?: number
  midAngle?: number
  innerRadius?: number
  outerRadius?: number
  percent?: number
}) => {
  // Guard against undefined values
  if (!cx || !cy || midAngle === undefined || !innerRadius || !outerRadius || !percent) {
    return null;
  }

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  if (percent < 0.05) return null // Don't show labels for very small segments

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export function PieChart({
  data,
  title,
  description,
  height = 300,
  showLegend = true,
  showTooltip = true,
  showLabels = false,
  innerRadius = 0,
  isLoading = false,
  valueFormatter = (value) => value.toLocaleString(),
  className,
}: PieChartProps) {
  // Add default colors to data items that don't have one
  const dataWithColors = data.map((item, index) => ({
    ...item,
    color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
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
      <RechartsPieChart>
        <Pie
          data={dataWithColors}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={showLabels ? renderCustomLabel : false}
          outerRadius={height / 3}
          innerRadius={innerRadius}
          fill="#8884d8"
          dataKey="value"
          stroke="none"
        >
          {dataWithColors.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        {showTooltip && (
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div
                        className="size-2 sm:size-3 rounded-full"
                        style={{ backgroundColor: data.color }}
                      />
                      <span className="font-medium text-xs sm:text-sm">{data.name}</span>
                    </div>
                    <div className="mt-1 text-xs sm:text-sm text-muted-foreground">
                      {valueFormatter(data.value)}
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
            verticalAlign="bottom"
            height={36}
            content={({ payload }) => (
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4 pt-3 sm:pt-4">
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
      </RechartsPieChart>
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
