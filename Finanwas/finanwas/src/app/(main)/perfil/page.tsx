'use client'

import * as React from "react"
import Link from "next/link"
import { useUser } from '@/contexts/UserContext'
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { calculateInvestorType, getInvestorTypeDescription } from '@/lib/utils/investor-type'
import {
  UserIcon,
  MailIcon,
  MapPinIcon,
  TrendingUpIcon,
  TargetIcon,
  ShieldIcon,
  DollarSignIcon,
  Edit2Icon,
  CheckCircleIcon,
  RocketIcon,
  ScaleIcon,
  CalendarIcon,
  DownloadIcon,
  LockIcon,
} from "lucide-react"

/**
 * Profile Page
 * Display user profile information and questionnaire results
 */

interface ProfileData {
  id: string
  user_id: string
  country: string | null
  knowledge_level: string | null
  main_goal: string | null
  risk_tolerance: string | null
  has_debt: boolean | null
  has_emergency_fund: boolean | null
  has_investments: boolean | null
  income_range: string | null
  expense_range: string | null
  investment_horizon: string | null
  questionnaire_completed: boolean
  questionnaire_completed_at: string | null
  updated_at: string
}

export default function PerfilPage() {
  const { user } = useUser()
  const [isLoading, setIsLoading] = React.useState(true)
  const [profile, setProfile] = React.useState<ProfileData | null>(null)
  const [isExporting, setIsExporting] = React.useState(false)

  // Fetch user profile from API
  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile')
        if (response.ok) {
          const data = await response.json()
          setProfile(data)
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  // Calculate investor type
  const investorType = React.useMemo(() =>
    profile && profile.questionnaire_completed ? calculateInvestorType(profile as any) : null,
    [profile]
  )

  // Get investor type icon
  const getInvestorTypeIcon = React.useCallback(() => {
    if (!investorType) return null
    switch (investorType) {
      case 'conservador':
        return ShieldIcon
      case 'moderado':
        return ScaleIcon
      case 'agresivo':
        return RocketIcon
      default:
        return null
    }
  }, [investorType])

  const InvestorTypeIcon = getInvestorTypeIcon()

  // Format member since date
  const formatMemberSince = React.useCallback(() => {
    if (!(user as any).created_at) return 'Fecha no disponible'
    const date = new Date((user as any).created_at)
    return date.toLocaleDateString('es-AR', { year: 'numeric', month: 'long' })
  }, [user])

  // Export user data (GDPR compliance)
  const handleExportData = React.useCallback(async () => {
    try {
      setIsExporting(true)
      const response = await fetch('/api/user/export-data')

      if (!response.ok) {
        throw new Error('Error al exportar datos')
      }

      // Get the blob and filename from response
      const blob = await response.blob()
      const contentDisposition = response.headers.get('Content-Disposition')
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
      const filename = filenameMatch ? filenameMatch[1] : `finanwas-data-export-${new Date().toISOString().split('T')[0]}.json`

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()

      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Error al exportar tus datos. Por favor, intentá nuevamente.')
    } finally {
      setIsExporting(false)
    }
  }, [])

  const profileSections = React.useMemo(() => [
    {
      title: "Ubicación",
      icon: MapPinIcon,
      data: profile?.country || "No especificado",
    },
    {
      title: "Nivel de Conocimiento",
      icon: TrendingUpIcon,
      data: profile?.knowledge_level || "No especificado",
    },
    {
      title: "Objetivo Principal",
      icon: TargetIcon,
      data: profile?.main_goal || "No especificado",
    },
    {
      title: "Tolerancia al Riesgo",
      icon: ShieldIcon,
      data: profile?.risk_tolerance || "No especificado",
    },
    {
      title: "Horizonte de Inversión",
      icon: DollarSignIcon,
      data: profile?.investment_horizon || "No especificado",
    },
  ], [profile])

  return (
    <div className="p-6 space-y-8">
      <PageHeader
        title="Mi Perfil"
        description="Información personal y perfil de inversor"
      />

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-2xl font-bold">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <CardTitle className="text-2xl">{user.name}</CardTitle>
                <CardDescription className="space-y-1 mt-1">
                  <div className="flex items-center gap-2">
                    <MailIcon className="size-4" />
                    {user.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="size-4" />
                    Miembro desde {formatMemberSince()}
                  </div>
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end">
              {investorType && InvestorTypeIcon && (
                <Badge variant="default" className="gap-2 text-base py-1.5 px-3">
                  <InvestorTypeIcon className="size-4" />
                  Perfil {investorType.charAt(0).toUpperCase() + investorType.slice(1)}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Questionnaire Status - Banner for incomplete profile */}
      {!isLoading && !profile?.questionnaire_completed && (
        <Card className="border-warning bg-warning/5">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Completá tu perfil financiero</CardTitle>
                <CardDescription>
                  Completá tu perfil financiero para recibir recomendaciones personalizadas
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/perfil/cuestionario">
                Completar ahora
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Profile Information */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : profile?.questionnaire_completed ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Perfil de Inversor</h2>
            <Button variant="outline" asChild>
              <Link href="/perfil/cuestionario">
                <Edit2Icon className="mr-2 size-4" />
                Editar cuestionario
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {profileSections.map((section, index) => {
              const Icon = section.icon
              return (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Icon className="size-5 text-primary" />
                      <CardTitle className="text-base">{section.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-semibold">{section.data}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Financial Situation */}
          <Card>
            <CardHeader>
              <CardTitle>Situación Financiera</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3 p-4 rounded-lg border border-border">
                  <div
                    className={`size-12 rounded-full flex items-center justify-center ${
                      profile.has_debt ? "bg-destructive/10" : "bg-success/10"
                    }`}
                  >
                    {profile.has_debt ? (
                      <span className="text-2xl">⚠️</span>
                    ) : (
                      <CheckCircleIcon className="size-6 text-success" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">Deudas</p>
                    <p className="text-sm text-muted-foreground">
                      {profile.has_debt ? "Sí tiene" : "No tiene"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg border border-border">
                  <div
                    className={`size-12 rounded-full flex items-center justify-center ${
                      profile.has_emergency_fund ? "bg-success/10" : "bg-warning/10"
                    }`}
                  >
                    {profile.has_emergency_fund ? (
                      <CheckCircleIcon className="size-6 text-success" />
                    ) : (
                      <span className="text-2xl">⚠️</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">Fondo de Emergencia</p>
                    <p className="text-sm text-muted-foreground">
                      {profile.has_emergency_fund ? "Sí tiene" : "No tiene"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg border border-border">
                  <div
                    className={`size-12 rounded-full flex items-center justify-center ${
                      profile.has_investments ? "bg-primary/10" : "bg-muted"
                    }`}
                  >
                    {profile.has_investments ? (
                      <TrendingUpIcon className="size-6 text-primary" />
                    ) : (
                      <span className="text-2xl">💼</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">Inversiones</p>
                    <p className="text-sm text-muted-foreground">
                      {profile.has_investments ? "Sí tiene" : "No tiene"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Income and Expenses */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Rango de Ingresos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{profile.income_range || 'No especificado'}</p>
                <p className="text-sm text-muted-foreground mt-1">Mensuales</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Rango de Gastos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{profile.expense_range || 'No especificado'}</p>
                <p className="text-sm text-muted-foreground mt-1">Mensuales</p>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <UserIcon className="size-16 mx-auto mb-4 opacity-50" />
              <p className="mb-4">Completa el cuestionario para ver tu perfil de inversor</p>
              <Button asChild>
                <Link href="/perfil/cuestionario">
                  Ir al Cuestionario
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data & Privacy Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <LockIcon className="size-5 text-primary" />
            <CardTitle>Datos y Privacidad</CardTitle>
          </div>
          <CardDescription>
            Administrá tus datos personales y ejercé tus derechos de privacidad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between p-4 rounded-lg border border-border bg-muted/50">
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Exportar mis datos</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Descargá una copia completa de todos tus datos en formato JSON. Incluye tu perfil,
                portafolio, metas, notas, progreso en cursos y más.
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Esta funcionalidad cumple con las regulaciones de protección de datos (GDPR, CCPA).
                Tus datos se exportan en un formato legible y portable.
              </p>
              <Button
                onClick={handleExportData}
                disabled={isExporting}
                variant="outline"
                className="gap-2"
              >
                <DownloadIcon className="size-4" />
                {isExporting ? 'Exportando...' : 'Exportar Datos'}
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground p-4 bg-muted/30 rounded-lg">
            <p className="font-semibold mb-2">Acerca de tus datos:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Tus datos están encriptados y almacenados de forma segura</li>
              <li>Solo vos tenés acceso a tu información personal</li>
              <li>Nunca compartimos tus datos sin tu consentimiento</li>
              <li>Podés exportar o eliminar tus datos en cualquier momento</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
