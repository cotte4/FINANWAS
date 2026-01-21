"use client"

import * as React from "react"
import {
  BarChart as RechartsBarChart,
  Bar,
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
 * BarChart Component
 *
 * A responsive bar chart built with Recharts.
 * Perfect for comparing values across categories.
 *
 * @example
 * ```tsx
 * <BarChart
 *   title="Monthly Comparison"
 *   description="Income vs Expenses"
 *   data={[
 *     { month: "Jan", income: 5000, expenses: 3000 },
 *     { month: "Feb", income: 6000, expenses: 3500 },
 *     { month: "Mar", income: 5500, expenses: 4000 }
 *   ]}
 *   bars={[
 *     { dataKey: "income", color: "#10B981", name: "Income" },
 *     { dataKey: "expenses", color: "#EF4444", name: "Expenses" }
 *   ]}
 *   xAxisKey="month"
 * />
 * ```
 */

export interface BarConfig {
  /** Data key to plot */
  dataKey: string
  /** Bar color */
  color?: string
  /** Display name */
  name?: string
  /** Stack ID for stacked bars */
  stackId?: string
}

export interface BarChartProps {
  /** Chart data */
  data: Record<string, any>[]
  /** Bar configurations */
  bars: BarConfig[]
  /** X-axis data key */
  xAxisKey: string
  /** Chart title */
  title?: string
  /** Chart description */
  description?: string
  /** Chart height in pixels */
  height?: number
  /** Chart orientation */
  layout?: "horizontal" | "vertical"
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

export function BarChart({
  data,
  bars,
  xAxisKey,
  title,
  description,
  height = 300,
  layout = "horizontal",
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  isLoading = false,
  valueFormatter = (value) => value.toLocaleString(),
  className,
}: BarChartProps) {
  // Add default colors to bars that don't have one
  const barsWithColors = bars.map((bar, index) => ({
    ...bar,
    color: bar.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
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
      <RechartsBarChart
        data={data}
        layout={layout}
        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
      >
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-muted"
            vertical={layout === "vertical"}
            horizontal={layout === "horizontal"}
          />
        )}
        {layout === "horizontal" ? (
          <>
            <XAxis
              dataKey={xAxisKey}
              className="text-xs"
              stroke="currentColor"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              className="text-xs"
              stroke="currentColor"
              tickLine={false}
              axisLine={false}
              tickFormatter={valueFormatter}
            />
          </>
        ) : (
          <>
            <XAxis
              type="number"
              className="text-xs"
              stroke="currentColor"
              tickLine={false}
              axisLine={false}
              tickFormatter={valueFormatter}
            />
            <YAxis
              dataKey={xAxisKey}
              type="category"
              className="text-xs"
              stroke="currentColor"
              tickLine={false}
              axisLine={false}
            />
          </>
        )}
        {showTooltip && (
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-sm">
                    <div className="font-medium mb-2">{label}</div>
                    <div className="space-y-1">
                      {payload.map((entry, index) => (
                        <div key={`tooltip-${index}`} className="flex items-center gap-2 text-sm">
                          <div
                            className="size-3 rounded-sm"
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
              <div className="flex flex-wrap justify-center gap-4 pb-4">
                {payload?.map((entry, index) => (
                  <div key={`legend-${index}`} className="flex items-center gap-2">
                    <div
                      className="size-3 rounded-sm"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          />
        )}
        {barsWithColors.map((bar, index) => (
          <Bar
            key={`bar-${index}`}
            dataKey={bar.dataKey}
            fill={bar.color}
            name={bar.name || bar.dataKey}
            stackId={bar.stackId}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
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
