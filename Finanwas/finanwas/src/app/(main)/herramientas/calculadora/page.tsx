'use client'

import * as React from "react"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { LineChart } from "@/components/charts/LineChart"
import { TrendingUpIcon, DollarSignIcon, CalendarIcon, PercentIcon } from "lucide-react"

/**
 * Compound Interest Calculator Page
 * Interactive calculator with visualization
 */

export default function CalculadoraPage() {
  const [initialAmount, setInitialAmount] = React.useState(10000)
  const [monthlyContribution, setMonthlyContribution] = React.useState(500)
  const [annualReturn, setAnnualReturn] = React.useState(8)
  const [years, setYears] = React.useState(10)
  const [results, setResults] = React.useState({
    finalAmount: 0,
    totalContributions: 0,
    totalInterest: 0,
  })

  // Calculate compound interest
  React.useEffect(() => {
    const monthlyRate = annualReturn / 100 / 12
    const months = years * 12

    // Future value of initial investment
    const fvInitial = initialAmount * Math.pow(1 + monthlyRate, months)

    // Future value of monthly contributions (annuity)
    const fvContributions =
      monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)

    const finalAmount = fvInitial + fvContributions
    const totalContributions = initialAmount + monthlyContribution * months
    const totalInterest = finalAmount - totalContributions

    setResults({
      finalAmount: Math.round(finalAmount * 100) / 100,
      totalContributions: Math.round(totalContributions * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
    })
  }, [initialAmount, monthlyContribution, annualReturn, years])

  // Generate chart data
  const chartData = React.useMemo(() => {
    const data = []
    const monthlyRate = annualReturn / 100 / 12

    for (let year = 0; year <= years; year++) {
      const months = year * 12
      const fvInitial = initialAmount * Math.pow(1 + monthlyRate, months)
      const fvContributions =
        months > 0
          ? monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
          : 0

      const total = fvInitial + fvContributions
      const contributions = initialAmount + monthlyContribution * months

      data.push({
        year,
        total: Math.round(total),
        contributions: Math.round(contributions),
        interest: Math.round(total - contributions),
      })
    }

    return data
  }, [initialAmount, monthlyContribution, annualReturn, years])

  return (
    <div className="p-6 space-y-8">
      <PageHeader
        title="Calculadora de Interés Compuesto"
        description="Visualiza cómo crecen tus inversiones con el tiempo"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Parámetros de Inversión</CardTitle>
            <CardDescription>
              Ajusta los valores para calcular el crecimiento de tu inversión
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Initial Amount */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="initial">Inversión Inicial</Label>
                <div className="flex items-center gap-2">
                  <DollarSignIcon className="size-4 text-muted-foreground" />
                  <span className="font-bold">${initialAmount.toLocaleString()}</span>
                </div>
              </div>
              <Input
                id="initial"
                type="number"
                value={initialAmount}
                onChange={(e) => setInitialAmount(Number(e.target.value))}
                min={0}
                step={100}
              />
            </div>

            {/* Monthly Contribution */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="monthly">Aporte Mensual</Label>
                <div className="flex items-center gap-2">
                  <DollarSignIcon className="size-4 text-muted-foreground" />
                  <span className="font-bold">${monthlyContribution.toLocaleString()}</span>
                </div>
              </div>
              <Input
                id="monthly"
                type="number"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                min={0}
                step={50}
              />
            </div>

            {/* Annual Return */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="return">Retorno Anual</Label>
                <div className="flex items-center gap-2">
                  <PercentIcon className="size-4 text-muted-foreground" />
                  <span className="font-bold">{annualReturn}%</span>
                </div>
              </div>
              <Slider
                id="return"
                value={[annualReturn]}
                onValueChange={([value]) => setAnnualReturn(value)}
                min={0}
                max={20}
                step={0.5}
                className="w-full"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>20%</span>
              </div>
            </div>

            {/* Years */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="years">Plazo (años)</Label>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="size-4 text-muted-foreground" />
                  <span className="font-bold">{years} años</span>
                </div>
              </div>
              <Slider
                id="years"
                value={[years]}
                onValueChange={([value]) => setYears(value)}
                min={1}
                max={40}
                step={1}
                className="w-full"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>1 año</span>
                <span>40 años</span>
              </div>
            </div>

            {/* Reset Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setInitialAmount(10000)
                setMonthlyContribution(500)
                setAnnualReturn(8)
                setYears(10)
              }}
            >
              Restaurar Valores por Defecto
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Resultados Proyectados</CardTitle>
            <CardDescription>
              Estimación basada en los parámetros ingresados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Final Amount */}
            <div className="p-6 rounded-lg bg-primary/10 border-2 border-primary">
              <div className="flex items-center gap-2 mb-2 text-primary">
                <TrendingUpIcon className="size-5" />
                <p className="font-semibold">Monto Final</p>
              </div>
              <p className="text-4xl font-bold text-primary">
                ${results.finalAmount.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Después de {years} {years === 1 ? "año" : "años"}
              </p>
            </div>

            {/* Breakdown */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-accent">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Invertido</p>
                  <p className="text-2xl font-bold">
                    ${results.totalContributions.toLocaleString()}
                  </p>
                </div>
                <DollarSignIcon className="size-8 text-muted-foreground" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-success/10 border border-success">
                <div>
                  <p className="text-sm font-medium text-success">Interés Ganado</p>
                  <p className="text-2xl font-bold text-success">
                    ${results.totalInterest.toLocaleString()}
                  </p>
                </div>
                <TrendingUpIcon className="size-8 text-success" />
              </div>

              {/* Percentage */}
              <div className="p-4 rounded-lg bg-accent">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Crecimiento Total
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold">
                    {(
                      ((results.finalAmount - results.totalContributions) /
                        results.totalContributions) *
                      100
                    ).toFixed(1)}
                    %
                  </p>
                  <p className="text-sm text-muted-foreground">
                    sobre el capital invertido
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Proyección de Crecimiento</CardTitle>
          <CardDescription>
            Visualización del crecimiento de tu inversión a lo largo del tiempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <LineChart
              data={chartData}
              xAxisKey="year"
              lines={[
                { dataKey: "total", name: "Total", color: "#2563eb" },
                { dataKey: "contributions", name: "Aportes", color: "#64748b" },
                { dataKey: "interest", name: "Interés", color: "#10b981" },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="border-warning/50 bg-warning/5">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Nota:</strong> Esta calculadora proporciona estimaciones basadas en retornos constantes
            y no considera impuestos, comisiones ni volatilidad del mercado. Los resultados reales pueden
            variar significativamente. Consulta con un asesor financiero para decisiones de inversión personalizadas.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
