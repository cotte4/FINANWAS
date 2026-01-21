'use client'

import * as React from "react"
import { PageHeader } from "@/components/ui/PageHeader"
import { StatsCard } from "@/components/ui/StatsCard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { PieChart } from "@/components/charts/PieChart"
import { EmptyState } from "@/components/ui/empty-state"
import { AddAssetModal } from "@/components/portfolio/AddAssetModal"
import { EditAssetModal } from "@/components/portfolio/EditAssetModal"
import { toast } from "sonner"
import {
  BriefcaseIcon,
  TrendingUpIcon,
  PlusIcon,
  RefreshCwIcon,
  DownloadIcon,
  Edit2Icon,
  Trash2Icon,
} from "lucide-react"

/**
 * Portfolio Page
 * Asset list, summary cards, and distribution charts
 */

interface PortfolioAsset {
  id: string
  type: string
  ticker: string | null
  name: string
  quantity: number
  purchase_price: number
  current_price: number | null
  currency: string
  purchase_date: string
  notes: string | null
}

interface PortfolioSummary {
  totalValue: number
  totalInvested: number
  totalGainLoss: number
  totalGainLossPercent: number
  currency: string
}

export default function PortfolioPage() {
  const [isLoading, setIsLoading] = React.useState(true)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [editingAsset, setEditingAsset] = React.useState<PortfolioAsset | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [assets, setAssets] = React.useState<PortfolioAsset[]>([])
  const [summary, setSummary] = React.useState<PortfolioSummary>({
    totalValue: 0,
    totalInvested: 0,
    totalGainLoss: 0,
    totalGainLossPercent: 0,
    currency: 'USD',
  })

  const fetchPortfolio = React.useCallback(async () => {
    try {
      const response = await fetch('/api/portfolio')
      if (!response.ok) {
        throw new Error('Error fetching portfolio')
      }
      const data = await response.json()
      setAssets(data.assets || [])
      if (data.summary) {
        setSummary(data.summary)
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error)
      toast.error('Error al cargar el portfolio')
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchPortfolio()
  }, [fetchPortfolio])

  const handleRefreshPrices = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch('/api/portfolio/refresh-prices', {
        method: 'POST',
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al actualizar precios')
      }
      const data = await response.json()
      toast.success(data.message || "Precios actualizados correctamente")
      // Refresh portfolio data to show updated prices
      fetchPortfolio()
    } catch (error) {
      console.error('Error refreshing prices:', error)
      toast.error(error instanceof Error ? error.message : "Error al actualizar precios")
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleExportCSV = async () => {
    try {
      const { exportPortfolioCSV } = await import('@/lib/utils/csv-export')
      exportPortfolioCSV(assets as any)
      toast.success("Portfolio exportado exitosamente")
    } catch (error) {
      console.error('Error exporting portfolio:', error)
      toast.error("Error al exportar portfolio")
    }
  }

  const handleEditAsset = (asset: PortfolioAsset) => {
    setEditingAsset(asset)
    setIsEditModalOpen(true)
  }

  const handleDeleteAsset = async (assetId: string, assetName: string) => {
    try {
      const response = await fetch(`/api/portfolio/${assetId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al eliminar activo')
      }
      toast.success(`${assetName} eliminado del portfolio`)
      fetchPortfolio() // Refresh the list
    } catch (error) {
      console.error('Error deleting asset:', error)
      toast.error(error instanceof Error ? error.message : "Error al eliminar activo")
    }
  }

  // Helper functions for asset calculations
  const getAssetValue = (asset: PortfolioAsset) => {
    const price = asset.current_price || asset.purchase_price
    return asset.quantity * price
  }

  const getAssetGainLoss = (asset: PortfolioAsset) => {
    const currentValue = getAssetValue(asset)
    const investedValue = asset.quantity * asset.purchase_price
    return currentValue - investedValue
  }

  const getAssetGainLossPercent = (asset: PortfolioAsset) => {
    const invested = asset.quantity * asset.purchase_price
    if (invested === 0) return 0
    return (getAssetGainLoss(asset) / invested) * 100
  }

  // Pie chart data for asset type distribution
  const typeDistribution = assets.reduce((acc, asset) => {
    const existing = acc.find(item => item.name === asset.type)
    const assetValue = getAssetValue(asset)
    if (existing) {
      existing.value += assetValue
    } else {
      acc.push({ name: asset.type, value: assetValue })
    }
    return acc
  }, [] as { name: string; value: number }[])

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
      <PageHeader
        title="Mi Portfolio"
        description="Seguimiento de tus inversiones y activos"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={handleRefreshPrices} disabled={isRefreshing} className="min-h-[44px]">
              <RefreshCwIcon className={`mr-2 size-4 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{isRefreshing ? "Actualizando..." : "Actualizar precios"}</span>
              <span className="sm:hidden">{isRefreshing ? "..." : "Actualizar"}</span>
            </Button>
            <Button onClick={handleExportCSV} variant="outline" className="min-h-[44px]">
              <DownloadIcon className="mr-2 size-4" />
              <span className="hidden sm:inline">Exportar CSV</span>
              <span className="sm:hidden">Exportar</span>
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)} className="min-h-[44px]">
              <PlusIcon className="mr-2 size-4" />
              <span className="hidden sm:inline">Agregar Activo</span>
              <span className="sm:hidden">Agregar</span>
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Valor Total"
          value={`$${summary.totalValue.toLocaleString()}`}
          description="Portfolio completo"
          icon={BriefcaseIcon}
          variant="primary"
          isLoading={isLoading}
        />
        <StatsCard
          title="Ganancia/Pérdida"
          value={`$${summary.totalGainLoss.toLocaleString()}`}
          description={`${summary.totalGainLossPercent.toFixed(2)}% total`}
          trend={{ value: summary.totalGainLossPercent }}
          icon={TrendingUpIcon}
          variant={summary.totalGainLoss >= 0 ? "success" : "destructive"}
          isLoading={isLoading}
        />
        <StatsCard
          title="Capital Invertido"
          value={`$${summary.totalInvested.toLocaleString()}`}
          description="Total aportado"
          isLoading={isLoading}
        />
        <StatsCard
          title="Total de Activos"
          value={assets.length}
          description="En tu portfolio"
          isLoading={isLoading}
        />
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
        {/* Asset List */}
        <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
          <Card>
            <CardHeader>
              <CardTitle>Mis Activos</CardTitle>
              <CardDescription>Lista de todas tus inversiones</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : assets.length === 0 ? (
                <EmptyState
                  icon={BriefcaseIcon}
                  title="No tenés activos en tu portfolio"
                  description="¡Agregá tu primera inversión para comenzar a trackear tu portfolio!"
                  action={{
                    label: "Agregar Activo",
                    onClick: () => setIsAddModalOpen(true)
                  }}
                />
              ) : (
                <>
                  {/* Desktop View - Card List */}
                  <div className="hidden md:block space-y-3">
                    {assets.map((asset) => {
                      const value = getAssetValue(asset)
                      const gainLoss = getAssetGainLoss(asset)
                      const gainLossPercent = getAssetGainLossPercent(asset)
                      const currentPrice = asset.current_price || asset.purchase_price
                      return (
                        <div
                          key={asset.id}
                          className="p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="secondary">{asset.type}</Badge>
                                {asset.ticker && (
                                  <span className="font-bold text-sm">{asset.ticker}</span>
                                )}
                              </div>
                              <h3 className="font-semibold text-lg truncate">{asset.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {asset.quantity} unidades × ${currentPrice.toLocaleString()} {asset.currency}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-bold text-lg">
                                ${value.toLocaleString()}
                              </p>
                              <div
                                className={`text-sm font-medium ${
                                  gainLoss >= 0 ? "text-success" : "text-destructive"
                                }`}
                              >
                                {gainLoss >= 0 ? "+" : ""}
                                ${gainLoss.toLocaleString()} ({gainLossPercent.toFixed(2)}%)
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="min-h-[44px] min-w-[44px]"
                                onClick={() => handleEditAsset(asset)}
                              >
                                <Edit2Icon className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive min-h-[44px] min-w-[44px]"
                                onClick={() => handleDeleteAsset(asset.id, asset.name)}
                              >
                                <Trash2Icon className="size-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Mobile View - Compact Cards */}
                  <div className="md:hidden space-y-3">
                    {assets.map((asset) => {
                      const value = getAssetValue(asset)
                      const gainLoss = getAssetGainLoss(asset)
                      const gainLossPercent = getAssetGainLossPercent(asset)
                      const currentPrice = asset.current_price || asset.purchase_price
                      return (
                        <div
                          key={asset.id}
                          className="p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                        >
                          <div className="space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="secondary" className="text-xs">{asset.type}</Badge>
                                  {asset.ticker && (
                                    <span className="font-bold text-sm">{asset.ticker}</span>
                                  )}
                                </div>
                                <h3 className="font-semibold text-base truncate">{asset.name}</h3>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  className="min-h-[44px] min-w-[44px]"
                                  onClick={() => handleEditAsset(asset)}
                                >
                                  <Edit2Icon className="size-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  className="text-destructive min-h-[44px] min-w-[44px]"
                                  onClick={() => handleDeleteAsset(asset.id, asset.name)}
                                >
                                  <Trash2Icon className="size-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-muted-foreground text-xs mb-1">Cantidad</p>
                                <p className="font-medium">{asset.quantity} unidades</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs mb-1">Precio Actual</p>
                                <p className="font-medium">${currentPrice.toLocaleString()} {asset.currency}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs mb-1">Valor Total</p>
                                <p className="font-bold text-base">${value.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs mb-1">Ganancia/Pérdida</p>
                                <p className={`font-semibold text-base ${
                                  gainLoss >= 0 ? "text-success" : "text-destructive"
                                }`}>
                                  {gainLoss >= 0 ? "+" : ""}
                                  ${gainLoss.toLocaleString()}
                                  <span className="text-xs ml-1">({gainLossPercent.toFixed(2)}%)</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts and Stats */}
        <div className="space-y-4 order-1 lg:order-2">
          {/* Asset Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Tipo</CardTitle>
              <CardDescription>Composición del portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="h-64">
                  <PieChart
                    data={typeDistribution}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento</CardTitle>
            </CardHeader>
            <CardContent>
              {assets.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Mejor Activo</p>
                    {(() => {
                      const sorted = [...assets].sort((a, b) => getAssetGainLossPercent(b) - getAssetGainLossPercent(a))
                      const best = sorted[0]
                      if (!best) return <p className="text-muted-foreground">N/A</p>
                      const percent = getAssetGainLossPercent(best)
                      return (
                        <>
                          <p className="font-semibold">{best.ticker || best.name}</p>
                          <p className={`text-xs ${percent >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {percent >= 0 ? '+' : ''}{percent.toFixed(2)}%
                          </p>
                        </>
                      )
                    })()}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Mayor Inversión</p>
                    {(() => {
                      const sorted = [...assets].sort((a, b) => getAssetValue(b) - getAssetValue(a))
                      const biggest = sorted[0]
                      if (!biggest) return <p className="text-muted-foreground">N/A</p>
                      return (
                        <>
                          <p className="font-semibold">{biggest.ticker || biggest.name}</p>
                          <p className="text-xs">${getAssetValue(biggest).toLocaleString()}</p>
                        </>
                      )
                    })()}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Agregá activos para ver estadísticas</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Asset Modal */}
      <AddAssetModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSuccess={fetchPortfolio}
      />

      {/* Edit Asset Modal */}
      <EditAssetModal
        asset={editingAsset}
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open)
          if (!open) setEditingAsset(null)
        }}
        onSuccess={fetchPortfolio}
      />
    </div>
  )
}
