'use client'

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser } from "@/contexts/UserContext"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MapPinIcon } from "lucide-react"

/**
 * Onboarding Page
 * Country selection and questionnaire prompt for new users
 */

const countryOptions = [
  { value: "Argentina", label: "Argentina" },
  { value: "Otro país latinoamericano", label: "Otro país latinoamericano" },
  { value: "Otro", label: "Otro" },
]

export default function OnboardingPage() {
  const { user } = useUser()
  const router = useRouter()
  const [selectedCountry, setSelectedCountry] = React.useState<string>("")
  const [isSaving, setIsSaving] = React.useState(false)

  const handleCompleteProfile = async () => {
    if (!selectedCountry) return

    setIsSaving(true)
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          country: selectedCountry,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al guardar el país")
      }

      // Redirect to questionnaire
      router.push("/perfil/cuestionario")
    } catch (error) {
      console.error("Error saving country:", error)
      alert("Hubo un error al guardar tu selección. Por favor intenta de nuevo.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleGoToDashboard = async () => {
    if (selectedCountry) {
      setIsSaving(true)
      try {
        await fetch("/api/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            country: selectedCountry,
          }),
        })
      } catch (error) {
        console.error("Error saving country:", error)
      } finally {
        setIsSaving(false)
      }
    }
    router.push("/dashboard")
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-text">
          Bienvenido a Finanwas, {user?.name}!
        </h1>
        <p className="text-muted-foreground">
          Para comenzar, cuéntanos un poco sobre ti
        </p>
      </div>

      {/* Country Selection Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPinIcon className="size-5 text-primary" />
            <CardTitle>Selecciona tu país</CardTitle>
          </div>
          <CardDescription>
            Esto nos ayudará a personalizar tu experiencia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="country">País de residencia</Label>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger id="country" className="w-full">
                <SelectValue placeholder="Selecciona una opción" />
              </SelectTrigger>
              <SelectContent>
                {countryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleCompleteProfile}
          disabled={!selectedCountry || isSaving}
          className="flex-1"
          size="lg"
        >
          {isSaving ? "Guardando..." : "Completar mi perfil"}
        </Button>
        <Button
          onClick={handleGoToDashboard}
          disabled={isSaving}
          variant="outline"
          className="flex-1"
          size="lg"
        >
          Ir al dashboard
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Puedes completar tu perfil más tarde desde la sección de Perfil
      </p>
    </div>
  )
}
