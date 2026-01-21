'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon, ShieldIcon, ScaleIcon, RocketIcon } from "lucide-react"
import { calculateInvestorType, getInvestorTypeDescription, type InvestorType } from "@/lib/utils/investor-type"
import type { UserProfile } from "@/types/database"

/**
 * Investment Profile Questionnaire Page
 * 7-step wizard for collecting user investment profile
 */

interface QuestionnaireData {
  knowledgeLevel: string
  mainGoal: string
  riskTolerance: string
  hasDebt: string
  hasEmergencyFund: string
  hasInvestments: string
  incomeRange: string
  expenseRange: string
  investmentHorizon: string
}

const initialData: QuestionnaireData = {
  knowledgeLevel: "",
  mainGoal: "",
  riskTolerance: "",
  hasDebt: "",
  hasEmergencyFund: "",
  hasInvestments: "",
  incomeRange: "",
  expenseRange: "",
  investmentHorizon: "",
}

export default function CuestionarioPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(1)
  const [formData, setFormData] = React.useState<QuestionnaireData>(initialData)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isCompleted, setIsCompleted] = React.useState(false)
  const [investorType, setInvestorType] = React.useState<InvestorType | null>(null)

  const totalSteps = 7

  const updateField = React.useCallback((field: keyof QuestionnaireData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const canProceed = React.useCallback(() => {
    switch (currentStep) {
      case 1:
        return formData.knowledgeLevel !== ""
      case 2:
        return formData.mainGoal !== ""
      case 3:
        return formData.riskTolerance !== ""
      case 4:
        return formData.hasDebt !== "" && formData.hasEmergencyFund !== "" && formData.hasInvestments !== ""
      case 5:
        return true // Income range is optional (skip allowed)
      case 6:
        return true // Expense range is optional (skip allowed)
      case 7:
        return formData.investmentHorizon !== ""
      default:
        return false
    }
  }, [currentStep, formData])

  const handleNext = React.useCallback(async () => {
    if (!canProceed()) return

    setIsSaving(true)
    try {
      // Save current step data to profile
      const updateData: Record<string, any> = {}

      if (currentStep === 1) {
        updateData.knowledge_level = formData.knowledgeLevel
      } else if (currentStep === 2) {
        updateData.main_goal = formData.mainGoal
      } else if (currentStep === 3) {
        updateData.risk_tolerance = formData.riskTolerance
      } else if (currentStep === 4) {
        updateData.has_debt = formData.hasDebt === 'si'
        updateData.has_emergency_fund = formData.hasEmergencyFund === 'si'
        updateData.has_investments = formData.hasInvestments === 'si'
      } else if (currentStep === 5) {
        updateData.income_range = formData.incomeRange
      } else if (currentStep === 6) {
        updateData.expense_range = formData.expenseRange
      }

      // Only send API request if there's data to update
      if (Object.keys(updateData).length > 0) {
        const response = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        })

        if (!response.ok) {
          throw new Error('Failed to save profile')
        }
      }

      // Advance to next step
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1)
      }
    } catch (error) {
      console.error('Error saving step:', error)
      alert('Error al guardar. Por favor, intenta de nuevo.')
    } finally {
      setIsSaving(false)
    }
  }, [canProceed, currentStep, formData])

  const handlePrevious = React.useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  const handleSubmit = React.useCallback(async () => {
    if (!canProceed()) return

    setIsSaving(true)
    try {
      // Save step 7 data and mark questionnaire as completed
      const updateData = {
        investment_horizon: formData.investmentHorizon,
        questionnaire_completed: true
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        throw new Error('Failed to save profile')
      }

      // Get updated profile to calculate investor type
      const profileResponse = await fetch('/api/profile')
      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile')
      }

      const profile = await profileResponse.json() as UserProfile
      const calculatedType = calculateInvestorType(profile)

      setInvestorType(calculatedType)
      setIsCompleted(true)
    } catch (error) {
      console.error("Error saving questionnaire:", error)
      alert('Error al guardar. Por favor, intenta de nuevo.')
    } finally {
      setIsSaving(false)
    }
  }, [canProceed, formData])

  const progress = React.useMemo(() => (currentStep / totalSteps) * 100, [currentStep, totalSteps])

  const getInvestorTypeIcon = React.useCallback((type: InvestorType) => {
    switch (type) {
      case 'conservador':
        return <ShieldIcon className="w-16 h-16 text-primary" />
      case 'moderado':
        return <ScaleIcon className="w-16 h-16 text-primary" />
      case 'agresivo':
        return <RocketIcon className="w-16 h-16 text-primary" />
    }
  }, [])

  const getInvestorTypeLabel = React.useCallback((type: InvestorType) => {
    switch (type) {
      case 'conservador':
        return 'Inversor Conservador'
      case 'moderado':
        return 'Inversor Moderado'
      case 'agresivo':
        return 'Inversor Agresivo'
    }
  }, [])

  // Show summary screen after completion
  if (isCompleted && investorType) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
        <PageHeader
          title="¡Perfil Completado!"
          description="Aquí está tu perfil de inversor"
        />

        <Card>
          <CardHeader className="text-center space-y-4 pb-2">
            <div className="flex justify-center">
              {getInvestorTypeIcon(investorType)}
            </div>
            <CardTitle className="text-2xl">{getInvestorTypeLabel(investorType)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-muted-foreground">
              {getInvestorTypeDescription(investorType)}
            </p>

            <div className="pt-4">
              <Button
                onClick={() => router.push('/dashboard')}
                className="w-full min-h-[44px]"
              >
                Ir al dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
      <PageHeader
        title="Cuestionario de Perfil"
        description="Responde estas preguntas para recibir recomendaciones personalizadas"
      />

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Progreso</span>
              <span className="text-muted-foreground">Paso {currentStep} de {totalSteps}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Question Cards */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="default">Paso {currentStep}</Badge>
          </div>
          <CardTitle className="text-xl">
            {currentStep === 1 && "Nivel de Conocimiento Financiero"}
            {currentStep === 2 && "Objetivo Principal"}
            {currentStep === 3 && "Tolerancia al Riesgo"}
            {currentStep === 4 && "Situación Financiera Actual"}
            {currentStep === 5 && "Rango de Ingresos"}
            {currentStep === 6 && "Rango de Gastos"}
            {currentStep === 7 && "Horizonte de Inversión"}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && "¿Cuánto sabes sobre finanzas e inversiones?"}
            {currentStep === 2 && "¿Qué es lo que más quieres lograr con tus inversiones?"}
            {currentStep === 3 && "¿Cómo te sientes respecto al riesgo en las inversiones?"}
            {currentStep === 4 && "Ayúdanos a entender tu situación actual"}
            {currentStep === 5 && "¿Cuál es tu rango de ingresos mensuales?"}
            {currentStep === 6 && "¿Cuál es tu rango de gastos mensuales?"}
            {currentStep === 7 && "¿Por cuánto tiempo planeas invertir?"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Knowledge Level */}
          {currentStep === 1 && (
            <div className="space-y-2">
              <Label className="text-base">Selecciona tu nivel</Label>
              <Select value={formData.knowledgeLevel} onValueChange={(value) => updateField("knowledgeLevel", value)}>
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue placeholder="Selecciona una opción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="principiante" className="min-h-[44px]">Principiante - Recién empiezo</SelectItem>
                  <SelectItem value="intermedio" className="min-h-[44px]">Intermedio - Tengo conocimientos básicos</SelectItem>
                  <SelectItem value="avanzado" className="min-h-[44px]">Avanzado - Soy experimentado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Step 2: Main Goal */}
          {currentStep === 2 && (
            <RadioGroup value={formData.mainGoal} onValueChange={(value) => updateField("mainGoal", value)}>
              <div className="flex items-center space-x-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-accent min-h-[60px]">
                <RadioGroupItem value="Ahorrar" id="ahorrar" className="min-h-[24px] min-w-[24px]" />
                <Label htmlFor="ahorrar" className="flex-1 cursor-pointer">
                  <p className="font-medium text-base">Ahorrar</p>
                  <p className="text-sm text-muted-foreground">Construir un fondo de ahorro</p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-accent min-h-[60px]">
                <RadioGroupItem value="Invertir" id="invertir" className="min-h-[24px] min-w-[24px]" />
                <Label htmlFor="invertir" className="flex-1 cursor-pointer">
                  <p className="font-medium text-base">Invertir</p>
                  <p className="text-sm text-muted-foreground">Hacer crecer mi capital</p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-accent min-h-[60px]">
                <RadioGroupItem value="Salir de deudas" id="salir-deudas" className="min-h-[24px] min-w-[24px]" />
                <Label htmlFor="salir-deudas" className="flex-1 cursor-pointer">
                  <p className="font-medium text-base">Salir de deudas</p>
                  <p className="text-sm text-muted-foreground">Pagar mis deudas</p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-accent min-h-[60px]">
                <RadioGroupItem value="Jubilarme" id="jubilarme" className="min-h-[24px] min-w-[24px]" />
                <Label htmlFor="jubilarme" className="flex-1 cursor-pointer">
                  <p className="font-medium text-base">Jubilarme</p>
                  <p className="text-sm text-muted-foreground">Planificar mi retiro</p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-accent min-h-[60px]">
                <RadioGroupItem value="Aprender" id="aprender" className="min-h-[24px] min-w-[24px]" />
                <Label htmlFor="aprender" className="flex-1 cursor-pointer">
                  <p className="font-medium text-base">Aprender</p>
                  <p className="text-sm text-muted-foreground">Mejorar mi educación financiera</p>
                </Label>
              </div>
            </RadioGroup>
          )}

          {/* Step 3: Risk Tolerance */}
          {currentStep === 3 && (
            <RadioGroup value={formData.riskTolerance} onValueChange={(value) => updateField("riskTolerance", value)}>
              <div className="flex items-center space-x-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-accent min-h-[60px]">
                <RadioGroupItem value="conservador" id="conservador" className="min-h-[24px] min-w-[24px]" />
                <Label htmlFor="conservador" className="flex-1 cursor-pointer">
                  <p className="font-medium text-base">Conservador</p>
                  <p className="text-sm text-muted-foreground">Prefiero proteger mi capital, acepto retornos bajos</p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-accent min-h-[60px]">
                <RadioGroupItem value="moderado" id="moderado" className="min-h-[24px] min-w-[24px]" />
                <Label htmlFor="moderado" className="flex-1 cursor-pointer">
                  <p className="font-medium text-base">Moderado</p>
                  <p className="text-sm text-muted-foreground">Busco balance entre riesgo y retorno</p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-accent min-h-[60px]">
                <RadioGroupItem value="agresivo" id="agresivo" className="min-h-[24px] min-w-[24px]" />
                <Label htmlFor="agresivo" className="flex-1 cursor-pointer">
                  <p className="font-medium text-base">Agresivo</p>
                  <p className="text-sm text-muted-foreground">Acepto alto riesgo por retornos potencialmente altos</p>
                </Label>
              </div>
            </RadioGroup>
          )}

          {/* Step 4: Financial Situation */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>¿Tienes deudas actualmente?</Label>
                <RadioGroup value={formData.hasDebt} onValueChange={(value) => updateField("hasDebt", value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="debt-si" />
                    <Label htmlFor="debt-si">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="debt-no" />
                    <Label htmlFor="debt-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>¿Tienes un fondo de emergencia?</Label>
                <RadioGroup value={formData.hasEmergencyFund} onValueChange={(value) => updateField("hasEmergencyFund", value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="emergency-si" />
                    <Label htmlFor="emergency-si">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="emergency-no" />
                    <Label htmlFor="emergency-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>¿Tienes inversiones actualmente?</Label>
                <RadioGroup value={formData.hasInvestments} onValueChange={(value) => updateField("hasInvestments", value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="investments-si" />
                    <Label htmlFor="investments-si">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="investments-no" />
                    <Label htmlFor="investments-no">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Step 5: Income Range */}
          {currentStep === 5 && (
            <div className="space-y-2">
              <Label className="text-base">Rango de ingresos mensuales (USD)</Label>
              <Select value={formData.incomeRange} onValueChange={(value) => updateField("incomeRange", value)}>
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue placeholder="Selecciona un rango (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="< $500" className="min-h-[44px]">Menos de $500</SelectItem>
                  <SelectItem value="$500-1500" className="min-h-[44px]">$500 - $1,500</SelectItem>
                  <SelectItem value="$1500-3000" className="min-h-[44px]">$1,500 - $3,000</SelectItem>
                  <SelectItem value="> $3000" className="min-h-[44px]">Más de $3,000</SelectItem>
                  <SelectItem value="Prefiero no decir" className="min-h-[44px]">Prefiero no decir</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Step 6: Expense Range */}
          {currentStep === 6 && (
            <div className="space-y-2">
              <Label className="text-base">Rango de gastos mensuales (USD)</Label>
              <Select value={formData.expenseRange} onValueChange={(value) => updateField("expenseRange", value)}>
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue placeholder="Selecciona un rango (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="< $500" className="min-h-[44px]">Menos de $500</SelectItem>
                  <SelectItem value="$500-1500" className="min-h-[44px]">$500 - $1,500</SelectItem>
                  <SelectItem value="$1500-3000" className="min-h-[44px]">$1,500 - $3,000</SelectItem>
                  <SelectItem value="> $3000" className="min-h-[44px]">Más de $3,000</SelectItem>
                  <SelectItem value="Prefiero no decir" className="min-h-[44px]">Prefiero no decir</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Step 7: Investment Horizon */}
          {currentStep === 7 && (
            <RadioGroup value={formData.investmentHorizon} onValueChange={(value) => updateField("investmentHorizon", value)}>
              <div className="flex items-center space-x-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-accent min-h-[60px]">
                <RadioGroupItem value="Corto plazo" id="corto" className="min-h-[24px] min-w-[24px]" />
                <Label htmlFor="corto" className="flex-1 cursor-pointer">
                  <p className="font-medium text-base">Corto plazo (menos de 1 año)</p>
                  <p className="text-sm text-muted-foreground">Necesito el dinero pronto</p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-accent min-h-[60px]">
                <RadioGroupItem value="Mediano plazo" id="medio" className="min-h-[24px] min-w-[24px]" />
                <Label htmlFor="medio" className="flex-1 cursor-pointer">
                  <p className="font-medium text-base">Mediano plazo (1-5 años)</p>
                  <p className="text-sm text-muted-foreground">Puedo esperar algunos años</p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-accent min-h-[60px]">
                <RadioGroupItem value="Largo plazo" id="largo" className="min-h-[24px] min-w-[24px]" />
                <Label htmlFor="largo" className="flex-1 cursor-pointer">
                  <p className="font-medium text-base">Largo plazo (más de 5 años)</p>
                  <p className="text-sm text-muted-foreground">Inversión a largo plazo</p>
                </Label>
              </div>
            </RadioGroup>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="min-h-[44px] flex-1 sm:flex-initial"
        >
          <ArrowLeftIcon className="mr-2 size-4" />
          Anterior
        </Button>

        {currentStep < totalSteps ? (
          <Button onClick={handleNext} disabled={!canProceed() || isSaving} className="min-h-[44px] flex-1 sm:flex-initial">
            {isSaving ? "Guardando..." : "Siguiente"}
            {!isSaving && <ArrowRightIcon className="ml-2 size-4" />}
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!canProceed() || isSaving} className="min-h-[44px] flex-1 sm:flex-initial">
            {isSaving ? (
              "Guardando..."
            ) : (
              <>
                <CheckCircleIcon className="mr-2 size-4" />
                Finalizar
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
