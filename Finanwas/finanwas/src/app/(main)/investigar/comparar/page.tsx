'use client'

import * as React from "react"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  SearchIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  XIcon,
  PlusIcon,
  AlertCircleIcon,
  TrophyIcon,
} from "lucide-react"
import { TrafficLight } from "@/components/ui/traffic-light"
import { METRIC_THRESHOLDS, formatMetric } from "@/lib/config/metric-thresholds"
import { toast } from "sonner"

/**
 * Company Comparison Page
 * Side-by-side comparison of financial metrics between companies
 */

interface CompanyData {
  quote: {
    price: number
    change: number
    changePercent: number
    currency: string
  }
  stats: {
    peRatio?: number
    pbRatio?: number
    roe?: number
    roa?: number
    debtToEquity?: number
    dividendYield?: number
    marketCap?: string
    sector?: string
  }
}

interface CompanyMetrics {
  ticker: string
  sector: string
  price: number
  change: number
  changePercent: number
  marketCap?: string
  peRatio?: number
  pbRatio?: number
  roe?: number
  roa?: number
  debtToEquity?: number
  dividendYield?: number
}

export default function CompararPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isSearching, setIsSearching] = React.useState(false)
  const [companies, setCompanies] = React.useState<CompanyMetrics[]>([])

  const handleAddCompany = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim() || companies.length >= 3) return

    setIsSearching(true)
    try {
      const ticker = searchQuery.trim().toUpperCase()
      const response = await fetch(`/api/market/stock/${ticker}`)

      if (!response.ok) {
        let errorMsg = "Error al obtener datos de la empresa"

        if (response.status === 401) {
          errorMsg = "Sesión expirada. Por favor, inicia sesión nuevamente"
        } else if (response.status === 404) {
          errorMsg = `No encontramos la empresa "${ticker}". Verifica el símbolo bursátil`
        } else if (response.status === 400) {
          errorMsg = "Símbolo bursátil inválido"
        } else {
          try {
            const data = await response.json()
            errorMsg = data.error || errorMsg
          } catch {
            // If JSON parsing fails, use default error message
          }
        }

        throw new Error(errorMsg)
      }

      const data: CompanyData = await response.json()

      // Check if company already added
      if (companies.some(c => c.ticker === ticker)) {
        toast.error("Esta empresa ya está en la comparación")
        setSearchQuery("")
        return
      }

      const newCompany: CompanyMetrics = {
        ticker,
        sector: data.stats.sector || "Desconocido",
        price: data.quote.price,
        change: data.quote.change,
        changePercent: data.quote.changePercent,
        marketCap: data.stats.marketCap,
        peRatio: data.stats.peRatio,
        pbRatio: data.stats.pbRatio,
        roe: data.stats.roe,
        roa: data.stats.roa,
        debtToEquity: data.stats.debtToEquity,
        dividendYield: data.stats.dividendYield,
      }

      setCompanies([...companies, newCompany])
      setSearchQuery("")
      toast.success(`${ticker} agregada a la comparación`)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Error al obtener datos"
      toast.error(errorMsg)
    } finally {
      setIsSearching(false)
    }
  }, [searchQuery, companies])

  const handleRemoveCompany = React.useCallback((ticker: string) => {
    setCompanies(prev => prev.filter(c => c.ticker !== ticker))
    toast.success(`${ticker} removida de la comparación`)
  }, [])

  type MetricDefinition = {
    key: string
    label: string
    hasTrafficLight?: boolean
    format?: (value: number | string | undefined) => string
  }

  const metrics = React.useMemo<MetricDefinition[]>(() => [
    { key: "price", label: "Precio Actual", format: (v) => typeof v === 'number' ? `$${v.toFixed(2)}` : "N/A" },
    { key: "marketCap", label: "Market Cap", format: (v) => typeof v === 'string' ? v : "N/A" },
    { key: "peRatio", label: "P/E Ratio", hasTrafficLight: true },
    { key: "pbRatio", label: "P/B Ratio", hasTrafficLight: true },
    { key: "roe", label: "ROE", hasTrafficLight: true },
    { key: "roa", label: "ROA", hasTrafficLight: true },
    { key: "debtToEquity", label: "Deuda/Patrimonio", hasTrafficLight: true },
    { key: "dividendYield", label: "Rendimiento por Dividendo", hasTrafficLight: true },
  ], [])

  const getBestValue = React.useCallback((metricKey: string) => {
    if (companies.length === 0) return null

    const values = companies
      .map(c => c[metricKey as keyof CompanyMetrics])
      .filter(v => v !== undefined && v !== null && typeof v === 'number') as number[]

    if (values.length === 0) return null

    const metric = METRIC_THRESHOLDS[metricKey]
    // For inverse metrics (lower is better), return minimum
    // For regular metrics (higher is better), return maximum
    return metric?.inverse
      ? Math.min(...values)
      : Math.max(...values)
  }, [companies])

  const getMetricStatus = React.useCallback((metricKey: string, value: number | undefined): 'green' | 'yellow' | 'red' | null => {
    if (value === undefined || value === null) return null
    const config = METRIC_THRESHOLDS[metricKey]
    if (!config) return null

    const inverse = config.inverse || false
    if (inverse) {
      if (value <= config.green) return 'green'
      if (value >= config.red) return 'red'
      return 'yellow'
    } else {
      if (value >= config.green) return 'green'
      if (value <= config.red) return 'red'
      return 'yellow'
    }
  }, [])

  // Get the company with the best value for a specific metric
  // Returns ticker name of winning company, or null if no data available
  const getBestCompany = React.useCallback((metricKey: string, inverse: boolean): string | null => {
    if (companies.length === 0) return null

    let bestCompany: CompanyMetrics | null = null
    let bestValue: number | null = null

    for (const company of companies) {
      const value = company[metricKey as keyof CompanyMetrics]
      if (value === undefined || value === null || typeof value !== 'number') continue

      if (bestValue === null) {
        bestValue = value
        bestCompany = company
      } else if (inverse) {
        // Lower is better (P/E, Debt/Equity)
        if (value < bestValue) {
          bestValue = value
          bestCompany = company
        }
      } else {
        // Higher is better (ROE)
        if (value > bestValue) {
          bestValue = value
          bestCompany = company
        }
      }
    }

    return bestCompany?.ticker || null
  }, [companies])

  // Get comparison summary with best companies for key metrics
  const getComparisonSummary = React.useCallback(() => {
    return {
      bestValuation: getBestCompany('peRatio', true), // Lower P/E is better
      bestProfitability: getBestCompany('roe', false), // Higher ROE is better
      lowestDebt: getBestCompany('debtToEquity', true), // Lower debt is better
    }
  }, [getBestCompany])

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
      <PageHeader
        title="Comparar Empresas"
        description="Compara métricas financieras de hasta 3 empresas lado a lado"
      />

      {/* Add Company Form */}
      <Card>
        <CardHeader>
          <CardTitle>Agregar Empresa</CardTitle>
          <CardDescription>
            Ingresa el ticker de la empresa que deseas comparar (máx. 3 empresas)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddCompany} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Ej: AAPL, MSFT, GOOGL"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 min-h-[44px]"
                disabled={companies.length >= 3}
              />
            </div>
            <Button
              type="submit"
              disabled={isSearching || companies.length >= 3}
              className="min-h-[44px] sm:w-auto w-full"
            >
              {isSearching ? (
                "Buscando..."
              ) : (
                <>
                  <PlusIcon className="mr-2 size-4" />
                  Agregar
                </>
              )}
            </Button>
          </form>
          {companies.length >= 3 && (
            <p className="text-sm text-warning mt-2">
              Has alcanzado el límite de 3 empresas. Elimina una para agregar otra.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Comparison Table */}
      {companies.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <PlusIcon className="size-16 mx-auto mb-4 opacity-50" />
              <p>Agrega empresas para comenzar la comparación</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Comparación de Métricas</CardTitle>
            <CardDescription>
              {companies.length} {companies.length === 1 ? "empresa" : "empresas"} en comparación
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto -mx-6 px-6">
              <table className="w-full border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium text-muted-foreground">
                      Métrica
                    </th>
                    {companies.map((company) => (
                      <th key={company.ticker} className="text-left p-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="font-bold text-lg">{company.ticker}</p>
                              <p className="text-sm font-normal text-muted-foreground">
                                {company.sector}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveCompany(company.ticker)}
                              className="shrink-0"
                            >
                              <XIcon className="size-4" />
                            </Button>
                          </div>
                          <Badge variant="secondary">{company.sector}</Badge>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Price Change Row */}
                  <tr className="border-b border-border bg-accent/50">
                    <td className="p-3 font-medium">Cambio (24h)</td>
                    {companies.map((company) => (
                      <td key={company.ticker} className="p-3">
                        <div className="flex items-center gap-2">
                          {company.change >= 0 ? (
                            <TrendingUpIcon className="size-4 text-success" />
                          ) : (
                            <TrendingDownIcon className="size-4 text-destructive" />
                          )}
                          <span
                            className={`font-medium ${
                              company.change >= 0 ? "text-success" : "text-destructive"
                            }`}
                          >
                            {company.change >= 0 ? "+" : ""}
                            {company.change} ({company.changePercent}%)
                          </span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Metrics Rows */}
                  {metrics.map((metric) => {
                    const bestValue = getBestValue(metric.key)

                    return (
                      <tr key={metric.key} className="border-b border-border hover:bg-accent/30">
                        <td className="p-3 font-medium text-muted-foreground">
                          {metric.label}
                        </td>
                        {companies.map((company) => {
                          const value = company[metric.key as keyof CompanyMetrics]
                          const isBest = bestValue !== null && value === bestValue

                          return (
                            <td key={company.ticker} className="p-3">
                              <div className="flex items-center gap-2">
                                {metric.hasTrafficLight ? (
                                  <>
                                    <span className={isBest ? "font-bold text-primary" : ""}>
                                      {formatMetric(typeof value === 'number' ? value : undefined, metric.key)}
                                    </span>
                                    <TrafficLight
                                      value={typeof value === 'number' ? value : undefined}
                                      thresholds={{
                                        green: METRIC_THRESHOLDS[metric.key]?.green,
                                        red: METRIC_THRESHOLDS[metric.key]?.red
                                      }}
                                      inverse={METRIC_THRESHOLDS[metric.key]?.inverse || false}
                                      size="md"
                                    />
                                    {isBest && companies.length > 1 && (
                                      <Badge variant="default" className="text-xs">
                                        Mejor
                                      </Badge>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <span className={isBest ? "font-bold text-primary" : ""}>
                                      {metric.format ? metric.format(value) : value}
                                    </span>
                                    {isBest && companies.length > 1 && (
                                      <Badge variant="default" className="text-xs">
                                        Mejor
                                      </Badge>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {companies.map((company) => (
                <Card key={company.ticker} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg">{company.ticker}</CardTitle>
                        <CardDescription className="text-xs truncate">{company.sector}</CardDescription>
                        <Badge variant="secondary" className="mt-2 text-xs">{company.sector}</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleRemoveCompany(company.ticker)}
                        className="shrink-0 min-h-[44px] min-w-[44px]"
                      >
                        <XIcon className="size-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {/* Price Change */}
                    <div className="pb-3 border-b border-border">
                      <p className="text-muted-foreground text-xs mb-1">Cambio (24h)</p>
                      <div className="flex items-center gap-2">
                        {company.change >= 0 ? (
                          <TrendingUpIcon className="size-4 text-success" />
                        ) : (
                          <TrendingDownIcon className="size-4 text-destructive" />
                        )}
                        <span className={`font-semibold text-base ${
                          company.change >= 0 ? "text-success" : "text-destructive"
                        }`}>
                          {company.change >= 0 ? "+" : ""}
                          {company.change} ({company.changePercent}%)
                        </span>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {metrics.map((metric) => {
                        const value = company[metric.key as keyof CompanyMetrics]
                        const bestValue = getBestValue(metric.key)
                        const isBest = bestValue !== null && value === bestValue

                        return (
                          <div key={metric.key} className="space-y-1">
                            <p className="text-muted-foreground text-xs">{metric.label}</p>
                            <div className="flex items-center gap-1">
                              <p className={`font-medium text-sm ${isBest ? "text-primary font-bold" : ""}`}>
                                {metric.hasTrafficLight
                                  ? formatMetric(typeof value === 'number' ? value : undefined, metric.key)
                                  : (metric.format ? metric.format(value) : value)}
                              </p>
                              {metric.hasTrafficLight && (
                                <TrafficLight
                                  value={typeof value === 'number' ? value : undefined}
                                  thresholds={{
                                    green: METRIC_THRESHOLDS[metric.key]?.green,
                                    red: METRIC_THRESHOLDS[metric.key]?.red
                                  }}
                                  inverse={METRIC_THRESHOLDS[metric.key]?.inverse || false}
                                  size="sm"
                                />
                              )}
                              {isBest && companies.length > 1 && (
                                <Badge variant="default" className="text-[10px] px-1 py-0 h-4">
                                  Mejor
                                </Badge>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparison Summary */}
      {companies.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrophyIcon className="size-5 text-warning" />
              Resumen de la Comparación
            </CardTitle>
            <CardDescription>
              Análisis rápido de las mejores empresas por categoría
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Best Valuation (Lowest P/E) */}
              <div className="p-4 rounded-lg bg-accent/50 border border-border">
                <p className="text-sm text-muted-foreground mb-1">Mejor valuación</p>
                <p className="text-lg font-bold text-primary">
                  {getComparisonSummary().bestValuation || "Sin datos"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  (menor P/E Ratio)
                </p>
              </div>

              {/* Best Profitability (Highest ROE) */}
              <div className="p-4 rounded-lg bg-accent/50 border border-border">
                <p className="text-sm text-muted-foreground mb-1">Mejor rentabilidad</p>
                <p className="text-lg font-bold text-primary">
                  {getComparisonSummary().bestProfitability || "Sin datos"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  (mayor ROE)
                </p>
              </div>

              {/* Lowest Debt (Lowest Debt/Equity) */}
              <div className="p-4 rounded-lg bg-accent/50 border border-border">
                <p className="text-sm text-muted-foreground mb-1">Menor deuda</p>
                <p className="text-lg font-bold text-primary">
                  {getComparisonSummary().lowestDebt || "Sin datos"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  (menor Deuda/Patrimonio)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
