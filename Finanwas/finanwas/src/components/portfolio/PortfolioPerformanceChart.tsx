'use client'

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { LineChart } from "@/components/charts/LineChart"
import { getCurrencySymbol } from "@/lib/constants/currency-options"
import { toast } from "sonner"
import { TrendingUpIcon, CameraIcon } from "lucide-react"

/**
 * Portfolio Performance Chart Component
 *
 * Displays historical portfolio performance with interactive charts
 * Allows users to capture snapshots and view performance over time
 */

interface PerformanceDataPoint {
  date: string
  value: number
  cost: number
  gainLoss: number
  gainLossPercentage: number
}

interface PortfolioPerformanceChartProps {
  baseCurrency: string
  onSnapshotCreated?: () => void
}

type TimePeriod = '1M' | '3M' | '6M' | '1Y' | 'ALL'

export function PortfolioPerformanceChart({
  baseCurrency,
  onSnapshotCreated
}: PortfolioPerformanceChartProps) {
  const [isLoading, setIsLoading] = React.useState(true)
  const [isCreatingSnapshot, setIsCreatingSnapshot] = React.useState(false)
  const [selectedPeriod, setSelectedPeriod] = React.useState<TimePeriod>('ALL')
  const [chartData, setChartData] = React.useState<PerformanceDataPoint[]>([])
  const [hasData, setHasData] = React.useState(false)

  const fetchPerformanceData = React.useCallback(async (period: TimePeriod) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/portfolio/performance?period=${period}`)
      if (!response.ok) {
        throw new Error('Error fetching performance data')
      }
      const data = await response.json()
      setChartData(data.data || [])
      setHasData(data.hasData)
    } catch (error) {
      console.error('Error fetching performance data:', error)
      toast.error('Error al cargar datos de rendimiento')
      setChartData([])
      setHasData(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchPerformanceData(selectedPeriod)
  }, [selectedPeriod, fetchPerformanceData])

  const handleCreateSnapshot = async () => {
    setIsCreatingSnapshot(true)
    try {
      const response = await fetch('/api/portfolio/snapshot', {
        method: 'POST',
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al crear snapshot')
      }
      const data = await response.json()
      toast.success(data.message || 'Snapshot creado exitosamente')

      // Refresh chart data
      await fetchPerformanceData(selectedPeriod)

      // Call callback if provided
      if (onSnapshotCreated) {
        onSnapshotCreated()
      }
    } catch (error) {
      console.error('Error creating snapshot:', error)
      toast.error(error instanceof Error ? error.message : 'Error al crear snapshot')
    } finally {
      setIsCreatingSnapshot(false)
    }
  }

  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period)
  }

  // Format chart data for LineChart component
  const formattedChartData = chartData.map(point => ({
    date: new Date(point.date).toLocaleDateString('es-AR', {
      month: 'short',
      day: 'numeric'
    }),
    Valor: point.value,
    Invertido: point.cost,
  }))

  // Calculate performance stats
  const performanceStats = React.useMemo(() => {
    if (chartData.length === 0) {
      return { totalReturn: 0, totalReturnPercent: 0, highestValue: 0, lowestValue: 0 }
    }

    const latest = chartData[chartData.length - 1]
    const earliest = chartData[0]

    const totalReturn = latest.gainLoss
    const totalReturnPercent = latest.gainLossPercentage

    const highestValue = Math.max(...chartData.map(d => d.value))
    const lowestValue = Math.min(...chartData.map(d => d.value))

    return { totalReturn, totalReturnPercent, highestValue, lowestValue }
  }, [chartData])

  const currencySymbol = getCurrencySymbol(baseCurrency)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <TrendingUpIcon className="size-5" />
              Rendimiento Histórico
            </CardTitle>
            <CardDescription>
              Seguimiento del valor de tu portfolio a lo largo del tiempo
            </CardDescription>
          </div>
          <Button
            onClick={handleCreateSnapshot}
            disabled={isCreatingSnapshot}
            className="min-h-[44px] w-full sm:w-auto"
          >
            <CameraIcon className="mr-2 size-4" />
            {isCreatingSnapshot ? 'Capturando...' : 'Capturar Snapshot'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Period Selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['1M', '3M', '6M', '1Y', 'ALL'] as TimePeriod[]).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePeriodChange(period)}
              className="min-h-[40px]"
            >
              {period}
            </Button>
          ))}
        </div>

        {/* Chart */}
        {isLoading ? (
          <Skeleton className="h-80 w-full" />
        ) : !hasData ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="rounded-full bg-muted p-4 mb-4">
              <TrendingUpIcon className="size-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No hay datos de rendimiento</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Comienza a capturar snapshots de tu portfolio para ver su evolución a lo largo del tiempo
            </p>
            <Button onClick={handleCreateSnapshot} disabled={isCreatingSnapshot}>
              <CameraIcon className="mr-2 size-4" />
              Capturar Primer Snapshot
            </Button>
          </div>
        ) : (
          <>
            <LineChart
              data={formattedChartData}
              lines={[
                {
                  dataKey: 'Valor',
                  name: 'Valor Actual',
                  color: 'oklch(0.62 0.18 165)',
                  type: 'monotone',
                  showDots: chartData.length <= 31,
                },
                {
                  dataKey: 'Invertido',
                  name: 'Capital Invertido',
                  color: 'oklch(0.53 0.01 265)',
                  type: 'monotone',
                  showDots: false,
                },
              ]}
              xAxisKey="date"
              height={320}
              showGrid={true}
              showLegend={true}
              showTooltip={true}
              valueFormatter={(value) => `${currencySymbol}${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            />

            {/* Performance Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Retorno Total</p>
                <p className={`text-lg font-bold ${performanceStats.totalReturn >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {performanceStats.totalReturn >= 0 ? '+' : ''}
                  {currencySymbol}{performanceStats.totalReturn.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                <Badge
                  variant={performanceStats.totalReturnPercent >= 0 ? 'default' : 'destructive'}
                  className="mt-1"
                >
                  {performanceStats.totalReturnPercent >= 0 ? '+' : ''}
                  {performanceStats.totalReturnPercent.toFixed(2)}%
                </Badge>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Valor Máximo</p>
                <p className="text-lg font-bold">
                  {currencySymbol}{performanceStats.highestValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Valor Mínimo</p>
                <p className="text-lg font-bold">
                  {currencySymbol}{performanceStats.lowestValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Snapshots</p>
                <p className="text-lg font-bold">{chartData.length}</p>
                <p className="text-xs text-muted-foreground mt-1">registrados</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
