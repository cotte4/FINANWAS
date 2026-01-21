'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  BarChartIcon,
  UsersIcon,
  TrendingUpIcon,
  ActivityIcon,
  ExternalLinkIcon,
  InfoIcon
} from 'lucide-react'

/**
 * Analytics Dashboard Page
 *
 * Displays PostHog analytics insights and provides access to the full PostHog dashboard.
 * This page serves as a bridge to the external PostHog analytics platform.
 */
export default function AnalyticsPage() {
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
      <PageHeader
        title="Analytics Dashboard"
        description="Insights sobre el comportamiento de usuarios y uso de features"
      />

      {/* Info Alert */}
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>PostHog Analytics</AlertTitle>
        <AlertDescription>
          Esta aplicación usa PostHog para rastrear eventos de usuario y métricas de producto.
          Para ver dashboards completos, funnels, y análisis detallados, visitá el dashboard de PostHog.
        </AlertDescription>
      </Alert>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Eventos Rastreados
            </CardTitle>
            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15+</div>
            <p className="text-xs text-muted-foreground">
              Eventos personalizados implementados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Categorías
            </CardTitle>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Auth, Portfolio, Goals, Learning, Export
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              User Tracking
            </CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Activado</div>
            <p className="text-xs text-muted-foreground">
              Identificación de usuarios en login
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Privacy
            </CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GDPR</div>
            <p className="text-xs text-muted-foreground">
              Compliant, self-hostable
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Events Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Eventos de Autenticación</CardTitle>
            <CardDescription>Rastreo de registro, login y 2FA</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">user_registered</span>
              <Badge variant="secondary">Auth</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">user_logged_in</span>
              <Badge variant="secondary">Auth</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">user_login_2fa_required</span>
              <Badge variant="secondary">Auth</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">2fa_verification_failed</span>
              <Badge variant="destructive">Error</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Eventos de Portfolio</CardTitle>
            <CardDescription>Rastreo de assets y análisis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">portfolio_viewed</span>
              <Badge variant="secondary">Portfolio</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">asset_added</span>
              <Badge variant="secondary">Portfolio</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">asset_deleted</span>
              <Badge variant="secondary">Portfolio</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">prices_refreshed</span>
              <Badge variant="secondary">Portfolio</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">health_score_viewed</span>
              <Badge variant="secondary">Portfolio</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Eventos de Learning</CardTitle>
            <CardDescription>Rastreo de cursos y lecciones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">lesson_started</span>
              <Badge variant="secondary">Learning</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">lesson_completed</span>
              <Badge variant="secondary">Learning</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Eventos de Export</CardTitle>
            <CardDescription>Rastreo de exportación de datos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">data_exported</span>
              <Badge variant="secondary">Export</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PostHog Dashboard Link */}
      <Card>
        <CardHeader>
          <CardTitle>PostHog Dashboard Completo</CardTitle>
          <CardDescription>
            Accedé al dashboard completo de PostHog para análisis detallados, funnels, cohorts, y session recordings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <a
            href={posthogHost}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Abrir PostHog Dashboard
            <ExternalLinkIcon className="h-4 w-4" />
          </a>
        </CardContent>
      </Card>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Features de PostHog Disponibles</CardTitle>
          <CardDescription>Capacidades de analytics implementadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col space-y-1">
              <h4 className="font-medium">Event Tracking</h4>
              <p className="text-sm text-muted-foreground">
                Rastreo de eventos personalizados en toda la aplicación
              </p>
            </div>
            <div className="flex flex-col space-y-1">
              <h4 className="font-medium">User Identification</h4>
              <p className="text-sm text-muted-foreground">
                Identificación de usuarios en login para tracking personalizado
              </p>
            </div>
            <div className="flex flex-col space-y-1">
              <h4 className="font-medium">Pageview Tracking</h4>
              <p className="text-sm text-muted-foreground">
                Rastreo automático de navegación entre páginas
              </p>
            </div>
            <div className="flex flex-col space-y-1">
              <h4 className="font-medium">Session Recording</h4>
              <p className="text-sm text-muted-foreground">
                Grabación de sesiones con privacidad (inputs enmascarados)
              </p>
            </div>
            <div className="flex flex-col space-y-1">
              <h4 className="font-medium">Feature Flags</h4>
              <p className="text-sm text-muted-foreground">
                Soporte para feature flags (disponible en PostHog)
              </p>
            </div>
            <div className="flex flex-col space-y-1">
              <h4 className="font-medium">Privacy-First</h4>
              <p className="text-sm text-muted-foreground">
                GDPR compliant, self-hostable, sin terceros
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
