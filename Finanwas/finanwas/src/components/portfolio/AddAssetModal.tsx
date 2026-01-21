'use client'

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface AddAssetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const ASSET_TYPES = [
  { value: "accion", label: "Acción" },
  { value: "etf", label: "ETF" },
  { value: "bono", label: "Bono" },
  { value: "crypto", label: "Crypto" },
  { value: "efectivo", label: "Efectivo" },
  { value: "otro", label: "Otro" },
]

const CURRENCIES = [
  { value: "USD", label: "USD" },
  { value: "ARS", label: "ARS" },
]

export function AddAssetModal({ open, onOpenChange, onSuccess }: AddAssetModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [formData, setFormData] = React.useState({
    type: "",
    ticker: "",
    name: "",
    quantity: "",
    purchase_price: "",
    purchase_date: "",
    currency: "USD",
    notes: "",
  })

  const resetForm = () => {
    setFormData({
      type: "",
      ticker: "",
      name: "",
      quantity: "",
      purchase_price: "",
      purchase_date: "",
      currency: "USD",
      notes: "",
    })
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Client-side validation
    if (!formData.type || !formData.name || !formData.quantity || !formData.purchase_price || !formData.purchase_date || !formData.currency) {
      toast.error("Por favor completá todos los campos requeridos")
      return
    }

    const quantity = parseFloat(formData.quantity)
    const purchasePrice = parseFloat(formData.purchase_price)

    if (isNaN(quantity) || quantity <= 0) {
      toast.error("La cantidad debe ser un número mayor a 0")
      return
    }

    if (isNaN(purchasePrice) || purchasePrice <= 0) {
      toast.error("El precio de compra debe ser un número mayor a 0")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: formData.type,
          ticker: formData.ticker || null,
          name: formData.name,
          quantity,
          purchase_price: purchasePrice,
          purchase_date: formData.purchase_date,
          currency: formData.currency,
          notes: formData.notes || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al crear activo")
      }

      toast.success(`${formData.name} agregado al portfolio`)
      resetForm()
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error("Error creating asset:", error)
      toast.error(error instanceof Error ? error.message : "Error al crear activo")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agregar Activo</DialogTitle>
          <DialogDescription>
            Agregá un nuevo activo a tu portfolio. Los campos con * son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Asset Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange("type", value)}
              >
                <SelectTrigger id="type" className="w-full">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {ASSET_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ticker (optional) */}
            <div className="space-y-2">
              <Label htmlFor="ticker">Ticker</Label>
              <Input
                id="ticker"
                placeholder="Ej: AAPL"
                value={formData.ticker}
                onChange={(e) => handleChange("ticker", e.target.value.toUpperCase())}
                className="uppercase"
              />
            </div>
          </div>

          {/* Asset Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              placeholder="Ej: Apple Inc."
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad *</Label>
              <Input
                id="quantity"
                type="number"
                step="any"
                min="0.00000001"
                placeholder="Ej: 10"
                value={formData.quantity}
                onChange={(e) => handleChange("quantity", e.target.value)}
                required
              />
            </div>

            {/* Purchase Price */}
            <div className="space-y-2">
              <Label htmlFor="purchase_price">Precio de Compra *</Label>
              <Input
                id="purchase_price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Ej: 150.00"
                value={formData.purchase_price}
                onChange={(e) => handleChange("purchase_price", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Purchase Date */}
            <div className="space-y-2">
              <Label htmlFor="purchase_date">Fecha de Compra *</Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) => handleChange("purchase_date", e.target.value)}
                required
              />
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <Label htmlFor="currency">Moneda *</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleChange("currency", value)}
              >
                <SelectTrigger id="currency" className="w-full">
                  <SelectValue placeholder="Seleccionar moneda" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes (optional) */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Input
              id="notes"
              placeholder="Notas adicionales (opcional)"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Agregar Activo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
