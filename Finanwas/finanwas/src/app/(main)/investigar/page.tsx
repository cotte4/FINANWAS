'use client'

import * as React from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatsCard } from "@/components/ui/StatsCard"
import {
  SearchIcon,
  BarChart3Icon,
  TrendingUpIcon,
  LineChartIcon,
  ArrowRightIcon,
  TargetIcon,
  BriefcaseIcon,
} from "lucide-react"

/**
 * Investigar Landing Page
 * Hub for stock research tools - scorecard and comparison
 */

export default function InvestigarPage() {
  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
      {/* Hero Section */}
      <PageHeader
        title="Investigar"
        description="Herramientas profesionales para analizar y comparar empresas del mercado de valores"
      />

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Scorecard"
          value="Análisis Individual"
          description="Métricas detalladas por empresa"
          icon={BarChart3Icon}
          variant="primary"
        />
        <StatsCard
          title="Comparador"
          value="Hasta 3 empresas"
          description="Comparación lado a lado"
          icon={LineChartIcon}
          variant="secondary"
        />
        <StatsCard
          title="Traffic Light"
          value="Indicadores visuales"
          description="Verde, amarillo, rojo"
          icon={TrendingUpIcon}
          variant="default"
        />
      </div>

      {/* Main Features */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Scorecard Feature */}
        <Card className="flex flex-col hover:border-primary transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-lg bg-primary/10">
                <BarChart3Icon className="size-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Scorecard de Empresas</CardTitle>
                <CardDescription className="text-sm">
                  Análisis profundo y calificación automática
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <p className="text-muted-foreground">
              Obtén un análisis completo de cualquier empresa con métricas financieras clave,
              calificación de salud financiera y recomendaciones automáticas.
            </p>

            <div className="space-y-2">
              <p className="font-semibold text-sm">Incluye:</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  <span>Score de salud financiera (0-100)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  <span>Métricas clave: P/E, ROE, Deuda/Patrimonio</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  <span>Análisis de fortalezas y debilidades</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  <span>Traffic light por métrica (verde/amarillo/rojo)</span>
                </li>
              </ul>
            </div>

            <div className="pt-4">
              <Link href="/investigar/scorecard" className="block">
                <Button className="w-full">
                  <SearchIcon className="mr-2 size-4" />
                  Analizar Empresa
                  <ArrowRightIcon className="ml-2 size-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Comparador Feature */}
        <Card className="flex flex-col hover:border-primary transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-lg bg-secondary/10">
                <LineChartIcon className="size-6 text-secondary" />
              </div>
              <div>
                <CardTitle className="text-xl">Comparador de Empresas</CardTitle>
                <CardDescription className="text-sm">
                  Compara hasta 3 empresas simultáneamente
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <p className="text-muted-foreground">
              Compara métricas financieras de múltiples empresas lado a lado para tomar
              decisiones de inversión más informadas.
            </p>

            <div className="space-y-2">
              <p className="font-semibold text-sm">Incluye:</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  <span>Tabla comparativa de hasta 3 empresas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  <span>Identificación automática del mejor valor</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  <span>Resumen con mejores empresas por categoría</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  <span>Vista responsive (tabla en desktop, tarjetas en móvil)</span>
                </li>
              </ul>
            </div>

            <div className="pt-4">
              <Link href="/investigar/comparar" className="block">
                <Button className="w-full" variant="secondary">
                  <LineChartIcon className="mr-2 size-4" />
                  Comparar Empresas
                  <ArrowRightIcon className="ml-2 size-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>¿Cómo funciona?</CardTitle>
          <CardDescription>
            Proceso simple para analizar y comparar empresas del mercado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {/* Step 1 */}
            <div className="flex flex-col items-start gap-3">
              <div className="flex items-center justify-center size-12 rounded-full bg-primary/10 text-primary font-bold text-lg">
                1
              </div>
              <div>
                <p className="font-semibold mb-1">Busca la empresa</p>
                <p className="text-sm text-muted-foreground">
                  Ingresa el ticker de la empresa que deseas analizar (ej: AAPL, MSFT, GOOGL)
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-start gap-3">
              <div className="flex items-center justify-center size-12 rounded-full bg-primary/10 text-primary font-bold text-lg">
                2
              </div>
              <div>
                <p className="font-semibold mb-1">Revisa las métricas</p>
                <p className="text-sm text-muted-foreground">
                  Analiza las métricas financieras clave con indicadores visuales de traffic light
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-start gap-3">
              <div className="flex items-center justify-center size-12 rounded-full bg-primary/10 text-primary font-bold text-lg">
                3
              </div>
              <div>
                <p className="font-semibold mb-1">Toma decisiones</p>
                <p className="text-sm text-muted-foreground">
                  Usa el score y las recomendaciones para decidir si invertir o seguir investigando
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Explicadas */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas que analizamos</CardTitle>
          <CardDescription>
            Entendiendo los indicadores financieros clave
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {/* P/E Ratio */}
            <div className="p-4 rounded-lg border border-border bg-card space-y-2">
              <p className="font-semibold">P/E Ratio (Price to Earnings)</p>
              <p className="text-sm text-muted-foreground">
                Relación entre el precio de la acción y las ganancias por acción.
                Un P/E bajo puede indicar que la acción está subvaluada.
              </p>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-success/10 text-success font-medium">
                  Verde: &lt; 15
                </span>
                <span className="px-2 py-1 rounded bg-warning/10 text-warning font-medium">
                  Amarillo: 15-25
                </span>
                <span className="px-2 py-1 rounded bg-destructive/10 text-destructive font-medium">
                  Rojo: &gt; 25
                </span>
              </div>
            </div>

            {/* ROE */}
            <div className="p-4 rounded-lg border border-border bg-card space-y-2">
              <p className="font-semibold">ROE (Return on Equity)</p>
              <p className="text-sm text-muted-foreground">
                Retorno sobre el patrimonio. Mide la rentabilidad de la empresa en relación
                al capital de los accionistas.
              </p>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-success/10 text-success font-medium">
                  Verde: &gt; 15%
                </span>
                <span className="px-2 py-1 rounded bg-warning/10 text-warning font-medium">
                  Amarillo: 8-15%
                </span>
                <span className="px-2 py-1 rounded bg-destructive/10 text-destructive font-medium">
                  Rojo: &lt; 8%
                </span>
              </div>
            </div>

            {/* Deuda/Patrimonio */}
            <div className="p-4 rounded-lg border border-border bg-card space-y-2">
              <p className="font-semibold">Deuda/Patrimonio (Debt to Equity)</p>
              <p className="text-sm text-muted-foreground">
                Nivel de endeudamiento de la empresa. Un ratio bajo indica menor riesgo
                financiero y mayor estabilidad.
              </p>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-success/10 text-success font-medium">
                  Verde: &lt; 0.5
                </span>
                <span className="px-2 py-1 rounded bg-warning/10 text-warning font-medium">
                  Amarillo: 0.5-1.0
                </span>
                <span className="px-2 py-1 rounded bg-destructive/10 text-destructive font-medium">
                  Rojo: &gt; 1.0
                </span>
              </div>
            </div>

            {/* Dividendo */}
            <div className="p-4 rounded-lg border border-border bg-card space-y-2">
              <p className="font-semibold">Rendimiento por Dividendo</p>
              <p className="text-sm text-muted-foreground">
                Porcentaje de retorno anual por dividendos. Útil para inversores que buscan
                ingresos pasivos.
              </p>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-success/10 text-success font-medium">
                  Verde: &gt; 3%
                </span>
                <span className="px-2 py-1 rounded bg-warning/10 text-warning font-medium">
                  Amarillo: 1-3%
                </span>
                <span className="px-2 py-1 rounded bg-destructive/10 text-destructive font-medium">
                  Rojo: &lt; 1%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-full bg-primary/10">
                <TargetIcon className="size-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold mb-1">¿Listo para comenzar?</p>
                <p className="text-muted-foreground">
                  Empieza a analizar empresas y toma decisiones de inversión más informadas
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Link href="/investigar/scorecard">
                <Button size="lg" className="w-full sm:w-auto">
                  <SearchIcon className="mr-2 size-4" />
                  Analizar Empresa
                </Button>
              </Link>
              <Link href="/investigar/comparar">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <LineChartIcon className="mr-2 size-4" />
                  Comparar Empresas
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration with Portfolio */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BriefcaseIcon className="size-5 text-primary" />
            <CardTitle>Integración con tu Portfolio</CardTitle>
          </div>
          <CardDescription>
            Las empresas analizadas se pueden agregar directamente a tu portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Una vez que hayas investigado una empresa y decidas invertir, puedes agregarla
            a tu portfolio personal para hacer seguimiento de su desempeño a lo largo del tiempo.
          </p>
          <Link href="/portfolio">
            <Button variant="outline">
              <BriefcaseIcon className="mr-2 size-4" />
              Ver mi Portfolio
              <ArrowRightIcon className="ml-2 size-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
