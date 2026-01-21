'use client'

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { SwipeableCard } from "@/components/ui/SwipeableCard"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AddDividendModal } from "./AddDividendModal"
import { toast } from "sonner"
import {
  PlusIcon,
  TrendingUpIcon,
  CalendarIcon,
  DollarSignIcon,
  TrashIcon,
} from "lucide-react"
import type { PortfolioAsset, DividendPayment } from "@/types/database"

interface DividendSummary {
  totalDividends: number
  totalDividendsYTD: number
  totalDividendsLastYear: number
  totalWithholdingTax: number
  averageDividendPerPayment: number
  currency: string
  dividendsByAsset: Record<string, {
    assetName: string
    ticker: string | null
    totalAmount: number
    paymentCount: number
    lastPaymentDate: string | null
  }>
  dividendsByMonth: Record<string, number>
  totalReinvested: number
}

interface DividendTrackerProps {
  assets: PortfolioAsset[]
  baseCurrency: string
}

export function DividendTracker({ assets, baseCurrency }: DividendTrackerProps) {
  const [isLoading, setIsLoading] = React.useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [dividends, setDividends] = React.useState<DividendPayment[]>([])
  const [summary, setSummary] = React.useState<DividendSummary | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState<string | null>(null)

  const fetchDividends = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/dividends?summary=true&currency=${baseCurrency}`)
      if (!response.ok) {
        throw new Error('Error fetching dividends')
      }
      const data = await response.json()
      setDividends(data.dividends || [])
      setSummary(data.summary || null)
    } catch (error) {
      console.error('Error fetching dividends:', error)
      toast.error('Error al cargar dividendos')
    } finally {
      setIsLoading(false)
    }
  }, [baseCurrency])

  React.useEffect(() => {
    fetchDividends()
  }, [fetchDividends])

  const handleDeleteDividend = async (dividendId: string) => {
    try {
      const response = await fetch(`/api/dividends/${dividendId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al eliminar dividendo')
      }
      toast.success('Dividendo eliminado')
      setShowDeleteDialog(null)
      fetchDividends()
    } catch (error) {
      console.error('Error deleting dividend:', error)
      toast.error(error instanceof Error ? error.message : 'Error al eliminar dividendo')
    }
  }

  const confirmDeleteDividend = (dividendId: string) => {
    setShowDeleteDialog(dividendId)
  }

  const formatCurrency = (amount: number, currency: string = baseCurrency) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getPaymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      cash: 'Efectivo',
      stock: 'Acciones',
      drip: 'DRIP',
    }
    return labels[type] || type
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSignIcon className="h-5 w-5" />
                Seguimiento de Dividendos
              </CardTitle>
              <CardDescription>
                Historial de dividendos recibidos de tus inversiones
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Registrar Dividendo
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Summary Stats */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-sm text-muted-foreground">Total Histórico</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalDividends)}</p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-sm text-muted-foreground">Este Año</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalDividendsYTD)}</p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-sm text-muted-foreground">Año Anterior</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalDividendsLastYear)}</p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-sm text-muted-foreground">Reinvertido</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalReinvested)}</p>
              </div>
            </div>
          )}

          {/* Recent Dividends List */}
          {dividends.length === 0 ? (
            <div className="text-center py-12">
              <DollarSignIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No has registrado dividendos aún
              </p>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Registrar Primer Dividendo
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Dividendos Recientes</h3>
              <div className="space-y-2">
                {dividends.slice(0, 10).map((dividend) => {
                  const asset = assets.find(a => a.id === dividend.asset_id)
                  return (
                    <SwipeableCard
                      key={dividend.id}
                      onDelete={() => confirmDeleteDividend(dividend.id)}
                      deleteLabel="Eliminar"
                    >
                      <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">
                              {asset?.ticker || asset?.name || 'Activo eliminado'}
                            </p>
                            <Badge variant="outline">
                              {getPaymentTypeLabel(dividend.payment_type)}
                            </Badge>
                            {dividend.reinvested && (
                              <Badge variant="secondary">Reinvertido</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              {formatDate(dividend.payment_date)}
                            </span>
                            <span>{dividend.amount_per_share} {dividend.currency} por acción</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold text-green-600 dark:text-green-400">
                              +{formatCurrency(dividend.total_amount, dividend.currency)}
                            </p>
                            {dividend.withholding_tax > 0 && (
                              <p className="text-xs text-muted-foreground">
                                Impuesto: -{formatCurrency(dividend.withholding_tax, dividend.currency)}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hidden md:inline-flex"
                            onClick={() => confirmDeleteDividend(dividend.id)}
                          >
                            <TrashIcon className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </SwipeableCard>
                  )
                })}
              </div>
              {dividends.length > 10 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  Mostrando los 10 dividendos más recientes de {dividends.length}
                </p>
              )}
            </div>
          )}

          {/* Dividends by Asset */}
          {summary && Object.keys(summary.dividendsByAsset).length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Dividendos por Activo</h3>
              <div className="space-y-2">
                {Object.entries(summary.dividendsByAsset).map(([assetId, assetData]) => (
                  <div
                    key={assetId}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div>
                      <p className="font-medium">
                        {assetData.ticker || assetData.assetName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {assetData.paymentCount} {assetData.paymentCount === 1 ? 'pago' : 'pagos'}
                        {assetData.lastPaymentDate && (
                          <> • Último: {formatDate(assetData.lastPaymentDate)}</>
                        )}
                      </p>
                    </div>
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(assetData.totalAmount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AddDividendModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchDividends}
        assets={assets}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!showDeleteDialog} onOpenChange={(open) => !open && setShowDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar dividendo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El dividendo será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showDeleteDialog && handleDeleteDividend(showDeleteDialog)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
