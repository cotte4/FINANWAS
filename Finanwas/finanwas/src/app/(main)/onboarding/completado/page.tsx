'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircleIcon, ArrowRightIcon, TrendingUpIcon, ShieldIcon, TargetIcon } from "lucide-react"
import type { UserProfile } from "@/types/database"
import { calculateInvestorType, type InvestorType } from "@/lib/utils/investor-type"

/**
 * Onboarding Completion Page
 * Shows investor type and personalized message
 * US-038
 */

export default function CompletadoPage() {
  const router = useRouter()
  const [profile, setProfile] = React.useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [investorType, setInvestorType] = React.useState<InvestorType | null>(null)

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile")
        if (!response.ok) {
          throw new Error("Error al obtener perfil")
        }
        const data = await response.json()
        setProfile(data)

        // Calculate investor type using centralized utility
        const type = calculateInvestorType(data)
        setInvestorType(type)
      } catch (error) {
        console.error("Error fetching profile:", error)
        // Redirect to dashboard if profile not found
        router.push("/dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  const getInvestorTypeMessage = (type: InvestorType | null) => {
    if (!type) {
      return {
        icon: TargetIcon,
        color: "text-gray-500",
        bgColor: "bg-gray-500/10",
        message: "Completa tu perfil para recibir recomendaciones personalizadas.",
        recommendations: []
      }
    }

    switch (type) {
      case "conservador":
        return {
          icon: ShieldIcon,
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
          message: "Tu perfil se enfoca en la protección del capital y estrategias de bajo riesgo.",
          recommendations: [
            "Comienza con inversiones de renta fija y bonos",
            "Mantén un fondo de emergencia sólido",
            "Diversifica en instrumentos de bajo riesgo",
            "Considera plazos fijos y fondos conservadores"
          ]
        }
      case "moderado":
        return {
          icon: TargetIcon,
          color: "text-orange-500",
          bgColor: "bg-orange-500/10",
          message: "Tu perfil busca un balance entre seguridad y crecimiento del capital.",
          recommendations: [
            "Combina inversiones de renta fija y variable",
            "Diversifica entre diferentes clases de activos",
            "Considera fondos indexados y ETFs balanceados",
            "Mantén una estrategia de mediano a largo plazo"
          ]
        }
      case "agresivo":
        return {
          icon: TrendingUpIcon,
          color: "text-green-500",
          bgColor: "bg-green-500/10",
          message: "Tu perfil busca maximizar el crecimiento con estrategias de mayor riesgo.",
          recommendations: [
            "Explora acciones individuales y ETFs de crecimiento",
            "Considera inversiones en mercados emergentes",
            "Mantén una visión de largo plazo (5-10+ años)",
            "Rebalancea tu portafolio periódicamente"
          ]
        }
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-2/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  const typeInfo = getInvestorTypeMessage(investorType)
  const Icon = typeInfo.icon

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="size-16 sm:size-20 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircleIcon className="size-8 sm:size-10 text-success" />
          </div>
        </div>
        <PageHeader
          title="¡Perfil Completado!"
          description="Ya puedes comenzar a usar Finanwas con recomendaciones personalizadas"
        />
      </div>

      {/* Investor Type Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`size-12 rounded-lg ${typeInfo.bgColor} flex items-center justify-center`}>
              <Icon className={`size-6 ${typeInfo.color}`} />
            </div>
            <div>
              <CardTitle>Tu Perfil de Inversor</CardTitle>
              <Badge variant="default" className="mt-1 capitalize">
                {investorType}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base text-muted-foreground">
            {typeInfo.message}
          </p>

          {typeInfo.recommendations.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Recomendaciones personalizadas:</h3>
              <ul className="space-y-2">
                {typeInfo.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircleIcon className="size-4 text-success mt-0.5 shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de tu perfil</CardTitle>
          <CardDescription>
            Puedes actualizar esta información en cualquier momento desde tu perfil
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">País</p>
            <p className="font-medium">{profile.country || "No especificado"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Nivel de conocimiento</p>
            <p className="font-medium capitalize">{profile.knowledge_level || "No especificado"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Objetivo principal</p>
            <p className="font-medium capitalize">{profile.main_goal?.replace("-", " ") || "No especificado"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Tolerancia al riesgo</p>
            <p className="font-medium capitalize">{profile.risk_tolerance || "No especificado"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Horizonte de inversión</p>
            <p className="font-medium capitalize">{profile.investment_horizon?.replace("-", " ") + " plazo" || "No especificado"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Fondo de emergencia</p>
            <p className="font-medium">{profile.has_emergency_fund ? "Sí" : "No"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps Card */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos pasos</CardTitle>
          <CardDescription>
            Explora las funcionalidades de Finanwas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="size-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium text-sm">Explora cursos educativos</p>
              <p className="text-sm text-muted-foreground">
                Aprende sobre finanzas e inversiones con contenido personalizado
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="size-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium text-sm">Configura tus metas financieras</p>
              <p className="text-sm text-muted-foreground">
                Define objetivos y haz seguimiento de tu progreso
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="size-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium text-sm">Usa las herramientas de análisis</p>
              <p className="text-sm text-muted-foreground">
                Calculadoras, comparadores y más para tomar mejores decisiones
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA Button */}
      <div className="flex justify-center">
        <Button asChild size="lg" className="min-h-[44px]">
          <Link href="/dashboard">
            Ir al Dashboard
            <ArrowRightIcon className="ml-2 size-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
