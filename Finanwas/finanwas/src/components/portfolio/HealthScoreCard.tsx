'use client'

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { toast } from "sonner"
import {
  HeartPulseIcon,
  RefreshCwIcon,
  TrendingUpIcon,
  ShieldCheckIcon,
  TargetIcon,
  SparklesIcon,
  InfoIcon
} from "lucide-react"
import { captureEvent } from '@/lib/analytics/posthog'

/**
 * Portfolio Health Score Card Component
 *
 * Displays an algorithmic portfolio health score (0-100) that evaluates
 * portfolio quality based on diversification, risk metrics, and best practices.
 */

interface HealthScoreBreakdown {
  diversification: {
    score: number
    details: {
      assetCount: number
      assetCountScore: number
      sectorCount: number
      sectorDiversityScore: number
      assetTypeCount: number
      assetTypeDiversityScore: number
      maxConcentration: number
      concentrationScore: number
    }
  }
  riskManagement: {
    score: number
    details: {
      volatilityScore: number
      riskAlignmentScore: number
      hasRiskProfile: boolean
    }
  }
  performance: {
    score: number
    details: {
      positiveAssetsCount: number
      totalAssetsCount: number
      positiveReturnsRatio: number
      totalReturnPercentage: number
      totalReturnScore: number
      avgDividendYield: number
      dividendYieldScore: number
    }
  }
  bestPractices: {
    score: number
    details: {
      hasEmergencyFund: boolean
      emergencyFundScore: number
      hasRecentActivity: boolean
      contributionScore: number
      diversificationMeetsTarget: boolean
      rebalancingScore: number
    }
  }
}

interface HealthScoreResult {
  totalScore: number
  rating: string
  color: string
  breakdown: HealthScoreBreakdown
  recommendations: string[]
}

interface HealthScoreCardProps {
  className?: string
}

export function HealthScoreCard({ className }: HealthScoreCardProps) {
  const [isLoading, setIsLoading] = React.useState(true)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [healthScore, setHealthScore] = React.useState<HealthScoreResult | null>(null)

  const fetchHealthScore = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/portfolio/health-score')
      if (!response.ok) {
        throw new Error('Error fetching health score')
      }
      const data = await response.json()
      setHealthScore(data.data)
    } catch (error) {
      console.error('Error fetching health score:', error)
      toast.error('Error al cargar el puntaje de salud del portafolio')
      setHealthScore(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchHealthScore()
  }, [fetchHealthScore])

  // Track health score view
  React.useEffect(() => {
    if (!isLoading && healthScore) {
      captureEvent('health_score_viewed', {
        score: healthScore.totalScore,
        rating: healthScore.rating,
        diversification_score: healthScore.breakdown.diversification.score,
        risk_score: healthScore.breakdown.riskManagement.score,
        performance_score: healthScore.breakdown.performance.score,
        best_practices_score: healthScore.breakdown.bestPractices.score,
      });
    }
  }, [isLoading, healthScore])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchHealthScore()
    setIsRefreshing(false)
    toast.success('Puntaje de salud actualizado')
  }

  // Get color class based on score color
  const getColorClass = (color: string) => {
    switch (color) {
      case 'green':
        return 'text-success border-success'
      case 'lightgreen':
        return 'text-success/80 border-success/80'
      case 'yellow':
        return 'text-warning border-warning'
      case 'orange':
        return 'text-orange-500 border-orange-500'
      case 'red':
        return 'text-destructive border-destructive'
      default:
        return 'text-muted-foreground border-muted-foreground'
    }
  }

  const getScoreColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'oklch(0.62 0.18 165)' // success
      case 'lightgreen':
        return 'oklch(0.72 0.15 165)'
      case 'yellow':
        return 'oklch(0.75 0.14 90)' // warning
      case 'orange':
        return 'oklch(0.68 0.18 50)'
      case 'red':
        return 'oklch(0.55 0.18 25)' // destructive
      default:
        return 'oklch(0.53 0.01 265)'
    }
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <HeartPulseIcon className="size-5" />
                Salud del Portafolio
              </CardTitle>
              <CardDescription>
                Evaluación integral de la calidad de tu portafolio
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <Skeleton className="h-40 w-40 rounded-full mb-4" />
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!healthScore) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulseIcon className="size-5" />
            Salud del Portafolio
          </CardTitle>
          <CardDescription>
            No se pudo cargar el puntaje de salud
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground mb-4">
              Error al calcular el puntaje de salud
            </p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCwIcon className="mr-2 size-4" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <HeartPulseIcon className="size-5" />
              Salud del Portafolio
            </CardTitle>
            <CardDescription>
              Evaluación integral de la calidad de tu portafolio
            </CardDescription>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="min-h-[40px]"
          >
            <RefreshCwIcon className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Score Display */}
        <div className="flex flex-col items-center justify-center py-6 mb-6">
          {/* Circular Score */}
          <div className="relative mb-4">
            <svg className="size-40" viewBox="0 0 160 160">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="oklch(0.88 0.01 265)"
                strokeWidth="12"
              />
              {/* Progress circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke={getScoreColor(healthScore.color)}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${(healthScore.totalScore / 100) * 440} 440`}
                transform="rotate(-90 80 80)"
              />
              {/* Score text */}
              <text
                x="80"
                y="75"
                textAnchor="middle"
                fontSize="36"
                fontWeight="bold"
                fill="currentColor"
              >
                {healthScore.totalScore}
              </text>
              <text
                x="80"
                y="95"
                textAnchor="middle"
                fontSize="14"
                fill="currentColor"
                opacity="0.6"
              >
                de 100
              </text>
            </svg>
          </div>

          {/* Rating Badge */}
          <Badge
            variant="outline"
            className={`text-lg px-4 py-2 mb-2 ${getColorClass(healthScore.color)}`}
          >
            {healthScore.rating}
          </Badge>

          <p className="text-sm text-muted-foreground text-center max-w-md">
            Tu portafolio tiene un puntaje de salud {healthScore.rating.toLowerCase()}
          </p>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <TargetIcon className="size-4 text-muted-foreground" />
              <p className="text-xs font-medium">Diversificación</p>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold">{healthScore.breakdown.diversification.score}</p>
              <p className="text-xs text-muted-foreground mb-1">/ 35</p>
            </div>
            <Progress
              value={(healthScore.breakdown.diversification.score / 35) * 100}
              className="h-1 mt-2"
            />
          </div>

          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheckIcon className="size-4 text-muted-foreground" />
              <p className="text-xs font-medium">Gestión de Riesgo</p>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold">{healthScore.breakdown.riskManagement.score}</p>
              <p className="text-xs text-muted-foreground mb-1">/ 30</p>
            </div>
            <Progress
              value={(healthScore.breakdown.riskManagement.score / 30) * 100}
              className="h-1 mt-2"
            />
          </div>

          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUpIcon className="size-4 text-muted-foreground" />
              <p className="text-xs font-medium">Rendimiento</p>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold">{healthScore.breakdown.performance.score}</p>
              <p className="text-xs text-muted-foreground mb-1">/ 20</p>
            </div>
            <Progress
              value={(healthScore.breakdown.performance.score / 20) * 100}
              className="h-1 mt-2"
            />
          </div>

          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <SparklesIcon className="size-4 text-muted-foreground" />
              <p className="text-xs font-medium">Buenas Prácticas</p>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold">{healthScore.breakdown.bestPractices.score}</p>
              <p className="text-xs text-muted-foreground mb-1">/ 15</p>
            </div>
            <Progress
              value={(healthScore.breakdown.bestPractices.score / 15) * 100}
              className="h-1 mt-2"
            />
          </div>
        </div>

        {/* Recommendations */}
        {healthScore.recommendations.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <InfoIcon className="size-4" />
              Recomendaciones para Mejorar
            </h4>
            <ul className="space-y-2">
              {healthScore.recommendations.map((recommendation, index) => (
                <li
                  key={index}
                  className="text-sm p-3 rounded-lg bg-muted/50 border border-muted"
                >
                  {recommendation}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Detailed Breakdown (Accordion) */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="details">
            <AccordionTrigger className="text-sm font-medium">
              Ver Detalles Completos
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                {/* Diversification Details */}
                <div className="p-3 rounded-lg bg-muted/30">
                  <h5 className="font-semibold text-sm mb-2">Diversificación</h5>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Número de activos:</span>
                      <span className="font-medium">{healthScore.breakdown.diversification.details.assetCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sectores diferentes:</span>
                      <span className="font-medium">{healthScore.breakdown.diversification.details.sectorCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tipos de activos:</span>
                      <span className="font-medium">{healthScore.breakdown.diversification.details.assetTypeCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Concentración máxima:</span>
                      <span className="font-medium">{healthScore.breakdown.diversification.details.maxConcentration}%</span>
                    </div>
                  </div>
                </div>

                {/* Risk Management Details */}
                <div className="p-3 rounded-lg bg-muted/30">
                  <h5 className="font-semibold text-sm mb-2">Gestión de Riesgo</h5>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Score de volatilidad:</span>
                      <span className="font-medium">{healthScore.breakdown.riskManagement.details.volatilityScore}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Alineación con perfil:</span>
                      <span className="font-medium">{healthScore.breakdown.riskManagement.details.riskAlignmentScore}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Perfil de riesgo:</span>
                      <span className="font-medium">
                        {healthScore.breakdown.riskManagement.details.hasRiskProfile ? 'Completado' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Performance Details */}
                <div className="p-3 rounded-lg bg-muted/30">
                  <h5 className="font-semibold text-sm mb-2">Rendimiento</h5>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Activos con ganancia:</span>
                      <span className="font-medium">
                        {healthScore.breakdown.performance.details.positiveAssetsCount} / {healthScore.breakdown.performance.details.totalAssetsCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Retorno total:</span>
                      <span className={`font-medium ${healthScore.breakdown.performance.details.totalReturnPercentage >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {healthScore.breakdown.performance.details.totalReturnPercentage >= 0 ? '+' : ''}
                        {healthScore.breakdown.performance.details.totalReturnPercentage}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Yield promedio dividendos:</span>
                      <span className="font-medium">{healthScore.breakdown.performance.details.avgDividendYield}%</span>
                    </div>
                  </div>
                </div>

                {/* Best Practices Details */}
                <div className="p-3 rounded-lg bg-muted/30">
                  <h5 className="font-semibold text-sm mb-2">Buenas Prácticas</h5>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fondo de emergencia:</span>
                      <Badge variant={healthScore.breakdown.bestPractices.details.hasEmergencyFund ? 'default' : 'outline'} className="text-xs">
                        {healthScore.breakdown.bestPractices.details.hasEmergencyFund ? 'Sí' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Actividad reciente:</span>
                      <Badge variant={healthScore.breakdown.bestPractices.details.hasRecentActivity ? 'default' : 'outline'} className="text-xs">
                        {healthScore.breakdown.bestPractices.details.hasRecentActivity ? 'Sí' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Balance de portafolio:</span>
                      <Badge variant={healthScore.breakdown.bestPractices.details.diversificationMeetsTarget ? 'default' : 'outline'} className="text-xs">
                        {healthScore.breakdown.bestPractices.details.diversificationMeetsTarget ? 'Balanceado' : 'Desbalanceado'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
