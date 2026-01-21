'use client'

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUpIcon, TrendingDownIcon, ArrowRightIcon, BriefcaseIcon } from "lucide-react"
import { PieChart } from "@/components/charts/PieChart"
import { cn } from "@/lib/utils"

/**
 * Portfolio Widget for Dashboard
 *
 * US-084: Portfolio Summary Widget
 * - Shows total portfolio value
 * - Shows total return (% and color)
 * - Shows top 3 assets by value
 * - Links to full portfolio page
 */

interface PortfolioAsset {
  id: string
  name: string
  type: string
  quantity: number
  purchase_price: number
  current_price: number | null
  currency: string
}

interface PortfolioWidgetProps {
  className?: string
}

export function PortfolioWidget({ className }: PortfolioWidgetProps) {
  const [isLoading, setIsLoading] = React.useState(true)
  const [assets, setAssets] = React.useState<PortfolioAsset[]>([])
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchPortfolio() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch('/api/portfolio')
        if (!response.ok) throw new Error('Error al cargar portfolio')

        const data = await response.json()
        setAssets(data.assets || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPortfolio()
  }, [])

  // Calculate portfolio summary
  const totalInvested = React.useMemo(() => {
    return assets.reduce((sum, asset) => {
      return sum + (asset.purchase_price * asset.quantity)
    }, 0)
  }, [assets])

  const currentValue = React.useMemo(() => {
    return assets.reduce((sum, asset) => {
      const price = asset.current_price || asset.purchase_price
      return sum + (price * asset.quantity)
    }, 0)
  }, [assets])

  const totalReturn = React.useMemo(() => {
    if (totalInvested === 0) return 0
    return ((currentValue - totalInvested) / totalInvested) * 100
  }, [totalInvested, currentValue])

  const isPositiveReturn = totalReturn > 0
  const isNegativeReturn = totalReturn < 0

  // Get top 3 assets by current value
  const topAssets = React.useMemo(() => {
    return [...assets]
      .map(asset => ({
        ...asset,
        value: (asset.current_price || asset.purchase_price) * asset.quantity
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
  }, [assets])

  // Calculate distribution by asset type for mini pie chart
  const typeDistribution = React.useMemo(() => {
    const distribution: Record<string, number> = {}
    assets.forEach(asset => {
      const assetValue = (asset.current_price || asset.purchase_price) * asset.quantity
      distribution[asset.type] = (distribution[asset.type] || 0) + assetValue
    })
    return Object.entries(distribution).map(([name, value]) => ({ name, value }))
  }, [assets])

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BriefcaseIcon className="size-5 text-primary" />
            <CardTitle>Resumen del Portfolio</CardTitle>
          </div>
          <CardDescription>Últimas actualizaciones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (!error && assets.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BriefcaseIcon className="size-5 text-primary" />
            <CardTitle>Resumen del Portfolio</CardTitle>
          </div>
          <CardDescription>Últimas actualizaciones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BriefcaseIcon className="size-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                No tenés activos en tu portfolio.
              </p>
              <Button variant="outline" asChild>
                <Link href="/portfolio">
                  Agregar primera inversión
                  <ArrowRightIcon className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BriefcaseIcon className="size-5 text-primary" />
            <CardTitle>Resumen del Portfolio</CardTitle>
          </div>
          <CardDescription>Últimas actualizaciones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-destructive">{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BriefcaseIcon className="size-5 text-primary" />
          <CardTitle>Resumen del Portfolio</CardTitle>
        </div>
        <CardDescription>Últimas actualizaciones</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Total Value and Return */}
          <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
              <p className="text-2xl font-bold">
                ${currentValue.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-1.5">
                {totalReturn !== 0 && (
                  isPositiveReturn ? (
                    <TrendingUpIcon className="size-4 text-success" />
                  ) : (
                    <TrendingDownIcon className="size-4 text-destructive" />
                  )
                )}
                <span
                  className={cn(
                    "text-sm font-medium",
                    isPositiveReturn && "text-success",
                    isNegativeReturn && "text-destructive",
                    totalReturn === 0 && "text-muted-foreground"
                  )}
                >
                  {isPositiveReturn ? '+' : ''}{totalReturn.toFixed(2)}%
                </span>
              </div>
            </div>
            {isPositiveReturn ? (
              <TrendingUpIcon className="size-8 text-success" />
            ) : isNegativeReturn ? (
              <TrendingDownIcon className="size-8 text-destructive" />
            ) : (
              <BriefcaseIcon className="size-8 text-muted-foreground" />
            )}
          </div>

          {/* Mini Pie Chart - Distribution by Type */}
          {typeDistribution.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Distribucion por tipo</p>
              <div className="h-32">
                <PieChart
                  data={typeDistribution}
                  height={128}
                  showLegend={true}
                  showTooltip={true}
                  showLabels={false}
                  innerRadius={30}
                  valueFormatter={(value) => `$${value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                />
              </div>
            </div>
          )}

          {/* Top 3 Assets */}
          {topAssets.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Principales activos</p>
              <div className="space-y-2">
                {topAssets.map((asset) => {
                  const assetReturn = asset.current_price
                    ? ((asset.current_price - asset.purchase_price) / asset.purchase_price) * 100
                    : 0
                  const isPositive = assetReturn > 0

                  return (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{asset.name}</p>
                        <p className="text-xs text-muted-foreground">{asset.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          ${asset.value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p
                          className={cn(
                            "text-xs font-medium",
                            isPositive && "text-success",
                            !isPositive && assetReturn !== 0 && "text-destructive",
                            assetReturn === 0 && "text-muted-foreground"
                          )}
                        >
                          {isPositive ? '+' : ''}{assetReturn.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Link to full portfolio */}
          <Button variant="outline" className="w-full" asChild>
            <Link href="/portfolio">
              Ver portfolio completo
              <ArrowRightIcon className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
