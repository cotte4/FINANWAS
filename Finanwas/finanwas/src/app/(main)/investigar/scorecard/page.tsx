'use client'

import * as React from "react"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TrafficLight, getTrafficLightDescription } from "@/components/ui/traffic-light"
import { METRIC_THRESHOLDS, formatMetric } from "@/lib/config/metric-thresholds"
import {
  SearchIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSignIcon,
  BarChart3Icon,
  ActivityIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
} from "lucide-react"
import { toast } from "sonner"

/**
 * Company Scorecard Page
 * Search and display detailed company financial information
 */

interface StockData {
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

interface CompanyScorecard {
  ticker: string
  price: number
  change: number
  changePercent: number
  sector: string
  marketCap?: string
  peRatio?: number
  pbRatio?: number
  roe?: number
  roa?: number
  debtToEquity?: number
  dividendYield?: number
}

export default function ScorecardPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isSearching, setIsSearching] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [companyData, setCompanyData] = React.useState<CompanyScorecard | null>(null)

  const handleSearch = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setError(null)
    setCompanyData(null)

    try {
      let ticker = searchQuery.trim().toUpperCase()

      // Auto-correct common ticker mistakes
      const tickerCorrections: Record<string, string> = {
        'YPF.BA': 'YPFD.BA', // YPF in Buenos Aires
        'YPF': 'YPFD.BA',    // YPF without suffix → Argentine stock
      }

      if (tickerCorrections[ticker]) {
        console.log(`Auto-correcting ${ticker} → ${tickerCorrections[ticker]}`)
        ticker = tickerCorrections[ticker]
      }

      let response = await fetch(`/api/market/stock/${ticker}`)

      // If not found and doesn't have a suffix, try with .BA (Buenos Aires)
      if (response.status === 404 && !ticker.includes('.') && !tickerCorrections[searchQuery.trim().toUpperCase()]) {
        console.log(`Ticker ${ticker} not found, trying ${ticker}.BA`)
        ticker = `${ticker}.BA`
        response = await fetch(`/api/market/stock/${ticker}`)
      }

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

      const data: StockData = await response.json()
      setCompanyData({
        ticker,
        price: data.quote.price,
        change: data.quote.change,
        changePercent: data.quote.changePercent,
        sector: data.stats.sector || "Desconocido",
        marketCap: data.stats.marketCap,
        peRatio: data.stats.peRatio,
        pbRatio: data.stats.pbRatio,
        roe: data.stats.roe,
        roa: data.stats.roa,
        debtToEquity: data.stats.debtToEquity,
        dividendYield: data.stats.dividendYield,
      })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error al obtener datos"
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsSearching(false)
    }
  }, [searchQuery])

  const calculateScore = React.useCallback((data: CompanyScorecard): number => {
    const metrics = [
      data.peRatio ? (data.peRatio < 15 ? 100 : data.peRatio < 25 ? 50 : 0) : 0,
      data.roe ? (data.roe > 15 ? 100 : data.roe > 8 ? 50 : 0) : 0,
      data.debtToEquity ? (data.debtToEquity < 0.5 ? 100 : data.debtToEquity < 1 ? 50 : 0) : 0,
      data.dividendYield ? (data.dividendYield > 3 ? 100 : data.dividendYield > 1 ? 50 : 0) : 0,
    ]
    const validMetrics = metrics.filter(m => m > 0 || data.peRatio || data.roe || data.debtToEquity || data.dividendYield)
    return validMetrics.length > 0 ? Math.round(validMetrics.reduce((a, b) => a + b) / validMetrics.length) : 0
  }, [])

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

  const getStrengthsAndWeaknesses = React.useCallback((data: CompanyScorecard) => {
    const strengths: { name: string; metric: string; value: number }[] = []
    const weaknesses: { name: string; metric: string; value: number }[] = []

    const metricsToCheck = [
      { key: 'peRatio', value: data.peRatio, name: 'P/E Ratio' },
      { key: 'pbRatio', value: data.pbRatio, name: 'P/B Ratio' },
      { key: 'roe', value: data.roe, name: 'ROE' },
      { key: 'roa', value: data.roa, name: 'ROA' },
      { key: 'debtToEquity', value: data.debtToEquity, name: 'Deuda/Patrimonio' },
      { key: 'dividendYield', value: data.dividendYield, name: 'Rendimiento por Dividendo' },
    ]

    metricsToCheck.forEach(({ key, value, name }) => {
      if (value === undefined || value === null) return
      const status = getMetricStatus(key, value)
      if (status === 'green') {
        strengths.push({ name, metric: key, value })
      } else if (status === 'red') {
        weaknesses.push({ name, metric: key, value })
      }
    })

    return { strengths, weaknesses }
  }, [getMetricStatus])

  const getScoreColor = React.useCallback((score: number) => {
    if (score >= 80) return "text-success"
    if (score >= 60) return "text-warning"
    return "text-destructive"
  }, [])

  const getScoreBgColor = React.useCallback((score: number) => {
    if (score >= 80) return "bg-success/10 border-success"
    if (score >= 60) return "bg-warning/10 border-warning"
    return "bg-destructive/10 border-destructive"
  }, [])

  return (
    <div className="p-6 space-y-8">
      <PageHeader
        title="Scorecard de Empresas"
        description="Analiza métricas financieras y fundamentales de empresas"
      />

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Empresa</CardTitle>
          <CardDescription>
            Ingresá el ticker de la empresa. Funciona con Argentina (YPF, GGAL, PAMP), USA (AAPL, GOOGL, TSLA) y Europa (SAP.DE, MC.PA)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Ej: YPF, GGAL, AAPL, GOOGL"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={isSearching}>
              {isSearching ? "Buscando..." : "Buscar"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2">
            💡 <strong>Tip:</strong> Buscá empresas por ticker. Funciona con argentinas (YPF, GGAL, PAMP), estadounidenses (AAPL, GOOGL, TSLA) y europeas (SAP.DE, VOW.DE).
          </p>
        </CardContent>
      </Card>

      {/* Company Scorecard */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircleIcon className="size-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-destructive">{error}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Verifica el ticker. Ejemplos: <strong>YPF, GGAL, PAMP</strong> (🇦🇷 Argentina), <strong>AAPL, GOOGL, TSLA</strong> (🇺🇸 USA), <strong>SAP.DE, MC.PA</strong> (🇪🇺 Europa)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isSearching ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-96 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : companyData ? (
        <div className="space-y-6">
          {/* Company Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-2xl">{companyData.ticker}</CardTitle>
                    <Badge variant="secondary">{companyData.sector}</Badge>
                  </div>
                  <CardDescription className="text-base">
                    Información financiera de {companyData.ticker}
                  </CardDescription>
                </div>
                <div className={`text-right ${getScoreColor(calculateScore(companyData))}`}>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Score</p>
                  <p className="text-4xl font-bold">{calculateScore(companyData)}</p>
                  <p className="text-xs">/100</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Price Info */}
              <div className="grid gap-4 md:grid-cols-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Precio Actual</p>
                  <p className="text-2xl font-bold">${companyData.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Cambio</p>
                  <div className="flex items-center gap-1">
                    {companyData.change >= 0 ? (
                      <TrendingUpIcon className="size-5 text-success" />
                    ) : (
                      <TrendingDownIcon className="size-5 text-destructive" />
                    )}
                    <p className={`text-xl font-bold ${companyData.change >= 0 ? "text-success" : "text-destructive"}`}>
                      {companyData.change >= 0 ? "+" : ""}{companyData.change.toFixed(2)} ({companyData.changePercent.toFixed(2)}%)
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Market Cap</p>
                  <p className="text-2xl font-bold">{companyData.marketCap || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">P/E Ratio</p>
                  <p className="text-2xl font-bold">{companyData.peRatio ? companyData.peRatio.toFixed(2) : "N/A"}</p>
                </div>
              </div>

              {/* Health Score */}
              <div className={`p-4 rounded-lg border-2 ${getScoreBgColor(calculateScore(companyData))}`}>
                <div className="flex items-center gap-2 mb-2">
                  <ActivityIcon className={`size-5 ${getScoreColor(calculateScore(companyData))}`} />
                  <p className="font-semibold">Salud Financiera</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {calculateScore(companyData) >= 80
                    ? "Empresa con métricas financieras sólidas y excelente desempeño."
                    : calculateScore(companyData) >= 60
                    ? "Empresa con métricas aceptables pero con áreas de mejora."
                    : "Empresa con métricas débiles que requieren atención."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Financial Metrics */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3Icon className="size-5 text-primary" />
                <CardTitle>Métricas Financieras</CardTitle>
              </div>
              <CardDescription>Indicadores clave con traffic light</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {companyData.peRatio !== undefined && (
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-muted-foreground">P/E Ratio</p>
                      <TrafficLight
                        value={companyData.peRatio}
                        thresholds={{ green: METRIC_THRESHOLDS.peRatio.green, red: METRIC_THRESHOLDS.peRatio.red }}
                        inverse={METRIC_THRESHOLDS.peRatio.inverse}
                        size="md"
                      />
                    </div>
                    <p className="text-xl font-bold">{formatMetric(companyData.peRatio, 'peRatio')}</p>
                  </div>
                )}
                {companyData.pbRatio !== undefined && (
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-muted-foreground">P/B Ratio</p>
                      <TrafficLight
                        value={companyData.pbRatio}
                        thresholds={{ green: METRIC_THRESHOLDS.pbRatio.green, red: METRIC_THRESHOLDS.pbRatio.red }}
                        inverse={METRIC_THRESHOLDS.pbRatio.inverse}
                        size="md"
                      />
                    </div>
                    <p className="text-xl font-bold">{formatMetric(companyData.pbRatio, 'pbRatio')}</p>
                  </div>
                )}
                {companyData.roe !== undefined && (
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-muted-foreground">ROE</p>
                      <TrafficLight
                        value={companyData.roe}
                        thresholds={{ green: METRIC_THRESHOLDS.roe.green, red: METRIC_THRESHOLDS.roe.red }}
                        inverse={METRIC_THRESHOLDS.roe.inverse || false}
                        size="md"
                      />
                    </div>
                    <p className="text-xl font-bold">{formatMetric(companyData.roe, 'roe')}</p>
                  </div>
                )}
                {companyData.roa !== undefined && (
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-muted-foreground">ROA</p>
                      <TrafficLight
                        value={companyData.roa}
                        thresholds={{ green: METRIC_THRESHOLDS.roa.green, red: METRIC_THRESHOLDS.roa.red }}
                        inverse={METRIC_THRESHOLDS.roa.inverse || false}
                        size="md"
                      />
                    </div>
                    <p className="text-xl font-bold">{formatMetric(companyData.roa, 'roa')}</p>
                  </div>
                )}
                {companyData.debtToEquity !== undefined && (
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-muted-foreground">Deuda/Patrimonio</p>
                      <TrafficLight
                        value={companyData.debtToEquity}
                        thresholds={{ green: METRIC_THRESHOLDS.debtToEquity.green, red: METRIC_THRESHOLDS.debtToEquity.red }}
                        inverse={METRIC_THRESHOLDS.debtToEquity.inverse}
                        size="md"
                      />
                    </div>
                    <p className="text-xl font-bold">{formatMetric(companyData.debtToEquity, 'debtToEquity')}</p>
                  </div>
                )}
                {companyData.dividendYield !== undefined && (
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-muted-foreground">Rendimiento por Dividendo</p>
                      <TrafficLight
                        value={companyData.dividendYield}
                        thresholds={{ green: METRIC_THRESHOLDS.dividendYield.green, red: METRIC_THRESHOLDS.dividendYield.red }}
                        inverse={METRIC_THRESHOLDS.dividendYield.inverse || false}
                        size="md"
                      />
                    </div>
                    <p className="text-xl font-bold">{formatMetric(companyData.dividendYield, 'dividendYield')}</p>
                  </div>
                )}
              </div>
              {!companyData.peRatio && !companyData.roe && !companyData.debtToEquity && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No hay métricas disponibles para este ticker</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Strengths and Weaknesses */}
          {(() => {
            const { strengths, weaknesses } = getStrengthsAndWeaknesses(companyData)
            return strengths.length > 0 || weaknesses.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {/* Strengths */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="size-5 text-success" />
                      <CardTitle>Puntos Fuertes</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {strengths.length > 0 ? (
                      <div className="space-y-3">
                        {strengths.map((strength) => (
                          <div key={strength.metric} className="p-3 bg-success/10 rounded-lg border border-success/20">
                            <p className="font-semibold text-sm">{strength.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {strength.metric === 'peRatio' && 'Valuación atractiva'}
                              {strength.metric === 'pbRatio' && 'Buen valor de mercado'}
                              {strength.metric === 'roe' && 'Excelente retorno sobre patrimonio'}
                              {strength.metric === 'roa' && 'Buen retorno sobre activos'}
                              {strength.metric === 'debtToEquity' && 'Bajo nivel de deuda'}
                              {strength.metric === 'dividendYield' && 'Rendimiento de dividendo atractivo'}
                            </p>
                            <p className="text-sm font-bold text-success mt-1">
                              {formatMetric(strength.value, strength.metric)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No se identificaron fortalezas destacadas</p>
                    )}
                  </CardContent>
                </Card>

                {/* Weaknesses */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <AlertTriangleIcon className="size-5 text-destructive" />
                      <CardTitle>Puntos a Revisar</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {weaknesses.length > 0 ? (
                      <div className="space-y-3">
                        {weaknesses.map((weakness) => (
                          <div key={weakness.metric} className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                            <p className="font-semibold text-sm">{weakness.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {weakness.metric === 'peRatio' && 'Valuación potencialmente elevada'}
                              {weakness.metric === 'pbRatio' && 'Valuación por encima del valor de libros'}
                              {weakness.metric === 'roe' && 'Retorno sobre patrimonio bajo'}
                              {weakness.metric === 'roa' && 'Retorno sobre activos bajo'}
                              {weakness.metric === 'debtToEquity' && 'Alto nivel de endeudamiento'}
                              {weakness.metric === 'dividendYield' && 'Bajo rendimiento de dividendo'}
                            </p>
                            <p className="text-sm font-bold text-destructive mt-1">
                              {formatMetric(weakness.value, weakness.metric)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No se identificaron alertas</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : null
          })()}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button variant="outline">
                <DollarSignIcon className="mr-2 size-4" />
                Agregar a Portfolio
              </Button>
              <Button variant="outline">
                Comparar con otra empresa
              </Button>
              <Button variant="outline">
                Ver histórico
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <BarChart3Icon className="size-16 mx-auto mb-4 opacity-50" />
              <p>Busca una empresa para ver su scorecard financiero</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
