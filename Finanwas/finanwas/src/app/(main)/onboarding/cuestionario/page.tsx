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
import { ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon } from "lucide-react"
import { toast } from "sonner"
import { calculateInvestorType } from "@/lib/utils/investor-type"

/**
 * Onboarding Questionnaire Wizard
 * 7-step wizard for collecting user investment profile
 * US-035, US-036, US-037
 */

interface QuestionnaireData {
  knowledge_level: string
  main_goal: string
  risk_tolerance: string
  has_debt: boolean | null
  has_emergency_fund: boolean | null
  has_investments: boolean | null
  income_range: string
  expense_range: string
  investment_horizon: string
}

const initialData: QuestionnaireData = {
  knowledge_level: "",
  main_goal: "",
  risk_tolerance: "",
  has_debt: null,
  has_emergency_fund: null,
  has_investments: null,
  income_range: "",
  expense_range: "",
  investment_horizon: "",
}

export default function CuestionarioPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(1)
  const [formData, setFormData] = React.useState<QuestionnaireData>(initialData)
  const [isSaving, setIsSaving] = React.useState(false)

  const totalSteps = 7

  const updateField = <K extends keyof QuestionnaireData>(field: K, value: QuestionnaireData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.knowledge_level !== ""
      case 2:
        return formData.main_goal !== ""
      case 3:
        return formData.risk_tolerance !== ""
      case 4:
        return formData.has_debt !== null && formData.has_emergency_fund !== null && formData.has_investments !== null
      case 5:
        return formData.income_range !== ""
      case 6:
        return formData.expense_range !== ""
      case 7:
        return formData.investment_horizon !== ""
      default:
        return false
    }
  }

  const saveCurrentStep = async () => {
    setIsSaving(true)
    try {
      const updateData: Record<string, unknown> = {}

      // Add current step data to update
      switch (currentStep) {
        case 1:
          updateData.knowledge_level = formData.knowledge_level
          break
        case 2:
          updateData.main_goal = formData.main_goal
          break
        case 3:
          updateData.risk_tolerance = formData.risk_tolerance
          break
        case 4:
          updateData.has_debt = formData.has_debt
          updateData.has_emergency_fund = formData.has_emergency_fund
          updateData.has_investments = formData.has_investments
          break
        case 5:
          updateData.income_range = formData.income_range
          break
        case 6:
          updateData.expense_range = formData.expense_range
          break
        case 7:
          updateData.investment_horizon = formData.investment_horizon
          break
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error("Error al guardar")
      }

      return true
    } catch (error) {
      console.error("Error saving step:", error)
      toast.error("Error al guardar tus respuestas. Por favor intenta de nuevo.")
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const handleNext = async () => {
    if (!canProceed()) return

    const saved = await saveCurrentStep()
    if (saved && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }


  const handleSubmit = async () => {
    if (!canProceed()) return

    setIsSaving(true)
    try {
      // Save final step data and mark questionnaire as completed
      const finalData = {
        investment_horizon: formData.investment_horizon,
        questionnaire_completed: true,
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalData),
      })

      if (!response.ok) {
        throw new Error("Error al guardar el cuestionario")
      }

      toast.success("Cuestionario completado exitosamente")

      // Redirect to success page
      router.push("/onboarding/completado")
    } catch (error) {
      console.error("Error completing questionnaire:", error)
      toast.error("Hubo un error al finalizar. Por favor intenta de nuevo.")
    } finally {
      setIsSaving(false)
    }
  }

  const progress = (currentStep / totalSteps) * 100

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
              <Select value={formData.knowledge_level} onValueChange={(value) => updateField("knowledge_level", value)}>
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
            <RadioGroup value={formData.main_goal} onValueChange={(value) => updateField("main_goal", value)}>
              <div className="flex items-center space-x-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-accent min-h-[60px]">
                <RadioGroupItem value="aprender" id="aprender" className="min-h-[24px] min-w-[24px]" />
                <Label htmlFor="aprender" className="flex-1 cursor-pointer">
                  <p className="font-medium text-base">Aprender sobre finanzas</p>
                  <p className="text-sm text-muted-foreground">Educación financiera básica</p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-accent min-h-[60px]">
                <RadioGroupItem value="ahorrar" id="ahorrar" className="min-h-[24px] min-w-[24px]" />
                <Label htmlFor="ahorrar" className="flex-1 cursor-pointer">
                  <p className="font-medium text-base">Ahorrar dinero</p>
                  <p className="text-sm text-muted-foreground">Construir un fondo de ahorro</p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-accent min-h-[60px]">
                <RadioGroupItem value="invertir" id="invertir" className="min-h-[24px] min-w-[24px]" />
                <Label htmlFor="invertir" className="flex-1 cursor-pointer">
                  <p className="font-medium text-base">Invertir mi dinero</p>
                  <p className="text-sm text-muted-foreground">Hacer crecer mi capital</p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-accent min-h-[60px]">
                <RadioGroupItem value="planificar" id="planificar" className="min-h-[24px] min-w-[24px]" />
                <Label htmlFor="planificar" className="flex-1 cursor-pointer">
                  <p className="font-medium text-base">Planificar mi jubilación</p>
                  <p className="text-sm text-muted-foreground">Preparar mi futuro financiero</p>
                </Label>
              </div>
            </RadioGroup>
          )}

          {/* Step 3: Risk Tolerance */}
          {currentStep === 3 && (
            <RadioGroup value={formData.risk_tolerance} onValueChange={(value) => updateField("risk_tolerance", value)}>
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
                <RadioGroup value={formData.has_debt === null ? "" : formData.has_debt ? "si" : "no"} onValueChange={(value) => updateField("has_debt", value === "si")}>
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
                <RadioGroup value={formData.has_emergency_fund === null ? "" : formData.has_emergency_fund ? "si" : "no"} onValueChange={(value) => updateField("has_emergency_fund", value === "si")}>
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
                <RadioGroup value={formData.has_investments === null ? "" : formData.has_investments ? "si" : "no"} onValueChange={(value) => updateField("has_investments", value === "si")}>
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
              <Select value={formData.income_range} onValueChange={(value) => updateField("income_range", value)}>
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue placeholder="Selecciona un rango" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-1000" className="min-h-[44px]">$0 - $1,000</SelectItem>
                  <SelectItem value="1000-2000" className="min-h-[44px]">$1,000 - $2,000</SelectItem>
                  <SelectItem value="2000-5000" className="min-h-[44px]">$2,000 - $5,000</SelectItem>
                  <SelectItem value="5000-10000" className="min-h-[44px]">$5,000 - $10,000</SelectItem>
                  <SelectItem value="10000+" className="min-h-[44px]">Más de $10,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Step 6: Expense Range */}
          {currentStep === 6 && (
            <div className="space-y-2">
              <Label className="text-base">Rango de gastos mensuales (USD)</Label>
              <Select value={formData.expense_range} onValueChange={(value) => updateField("expense_range", value)}>
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue placeholder="Selecciona un rango" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-500" className="min-h-[44px]">$0 - $500</SelectItem>
                  <SelectItem value="500-1000" className="min-h-[44px]">$500 - $1,000</SelectItem>
                  <SelectItem value="1000-2000" className="min-h-[44px]">$1,000 - $2,000</SelectItem>
                  <SelectItem value="2000-5000" className="min-h-[44px]">$2,000 - $5,000</SelectItem>
                  <SelectItem value="5000+" className="min-h-[44px]">Más de $5,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Step 7: Investment Horizon */}
          {currentStep === 7 && (
            <RadioGroup value={formData.investment_horizon} onValueChange={(value) => updateField("investment_horizon", value)}>
              <div className="flex items-center space-x-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-accent min-h-[60px]">
                <RadioGroupItem value="corto" id="corto" className="min-h-[24px] min-w-[24px]" />
                <Label htmlFor="corto" className="flex-1 cursor-pointer">
                  <p className="font-medium text-base">Corto plazo (menos de 2 años)</p>
                  <p className="text-sm text-muted-foreground">Necesito el dinero pronto</p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-accent min-h-[60px]">
                <RadioGroupItem value="medio" id="medio" className="min-h-[24px] min-w-[24px]" />
                <Label htmlFor="medio" className="flex-1 cursor-pointer">
                  <p className="font-medium text-base">Mediano plazo (2-5 años)</p>
                  <p className="text-sm text-muted-foreground">Puedo esperar algunos años</p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-accent min-h-[60px]">
                <RadioGroupItem value="largo" id="largo" className="min-h-[24px] min-w-[24px]" />
                <Label htmlFor="largo" className="flex-1 cursor-pointer">
                  <p className="font-medium text-base">Largo plazo (5-10 años)</p>
                  <p className="text-sm text-muted-foreground">Pienso a largo plazo</p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-accent min-h-[60px]">
                <RadioGroupItem value="muy-largo" id="muy-largo" className="min-h-[24px] min-w-[24px]" />
                <Label htmlFor="muy-largo" className="flex-1 cursor-pointer">
                  <p className="font-medium text-base">Muy largo plazo (más de 10 años)</p>
                  <p className="text-sm text-muted-foreground">Inversión de décadas</p>
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
          disabled={currentStep === 1 || isSaving}
          className="min-h-[44px] flex-1 sm:flex-initial"
        >
          <ArrowLeftIcon className="mr-2 size-4" />
          Anterior
        </Button>

        {currentStep < totalSteps ? (
          <Button onClick={handleNext} disabled={!canProceed() || isSaving} className="min-h-[44px] flex-1 sm:flex-initial">
            {isSaving ? "Guardando..." : "Siguiente"}
            <ArrowRightIcon className="ml-2 size-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!canProceed() || isSaving} className="min-h-[44px] flex-1 sm:flex-initial">
            {isSaving ? (
              "Finalizando..."
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
