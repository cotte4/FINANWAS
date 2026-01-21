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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
import { Trash2Icon } from "lucide-react"
import { ASSET_TYPES } from "@/lib/constants/asset-types"

interface PortfolioAsset {
  id: string
  type: string
  ticker: string | null
  name: string
  quantity: number
  purchase_price: number
  current_price: number | null
  currency: string
  purchase_date: string
  notes: string | null
}

interface EditAssetModalProps {
  asset: PortfolioAsset | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const CURRENCIES = [
  { value: "USD", label: "USD" },
  { value: "ARS", label: "ARS" },
]

export function EditAssetModal({ asset, open, onOpenChange, onSuccess }: EditAssetModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)
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

  // Update form data when asset changes
  React.useEffect(() => {
    if (asset) {
      setFormData({
        type: asset.type || "",
        ticker: asset.ticker || "",
        name: asset.name || "",
        quantity: asset.quantity.toString(),
        purchase_price: asset.purchase_price.toString(),
        purchase_date: asset.purchase_date || "",
        currency: asset.currency || "USD",
        notes: asset.notes || "",
      })
    }
  }, [asset])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!asset) return

    // Client-side validation
    if (!formData.type || !formData.name || !formData.quantity || !formData.purchase_price || !formData.purchase_date || !formData.currency) {
      toast.error("Por favor completa todos los campos requeridos")
      return
    }

    const quantity = parseFloat(formData.quantity)
    const purchasePrice = parseFloat(formData.purchase_price)

    if (isNaN(quantity) || quantity <= 0) {
      toast.error("La cantidad debe ser un numero mayor a 0")
      return
    }

    if (isNaN(purchasePrice) || purchasePrice <= 0) {
      toast.error("El precio de compra debe ser un numero mayor a 0")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/portfolio/${asset.id}`, {
        method: "PUT",
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
        throw new Error(data.error || "Error al actualizar activo")
      }

      toast.success(`${formData.name} actualizado correctamente`)
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error("Error updating asset:", error)
      toast.error(error instanceof Error ? error.message : "Error al actualizar activo")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!asset) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/portfolio/${asset.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al eliminar activo")
      }

      toast.success(`${asset.name} eliminado del portfolio`)
      setShowDeleteConfirm(false)
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error("Error deleting asset:", error)
      toast.error(error instanceof Error ? error.message : "Error al eliminar activo")
    } finally {
      setIsDeleting(false)
    }
  }

  if (!asset) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Activo</DialogTitle>
            <DialogDescription>
              Modifica los datos de tu activo. Los campos con * son obligatorios.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Asset Type */}
              <div className="space-y-2">
                <Label htmlFor="edit-type">Tipo *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleChange("type", value)}
                >
                  <SelectTrigger id="edit-type" className="w-full">
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
                <Label htmlFor="edit-ticker">Ticker</Label>
                <Input
                  id="edit-ticker"
                  placeholder="Ej: AAPL"
                  value={formData.ticker}
                  onChange={(e) => handleChange("ticker", e.target.value.toUpperCase())}
                  className="uppercase"
                />
              </div>
            </div>

            {/* Asset Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre *</Label>
              <Input
                id="edit-name"
                placeholder="Ej: Apple Inc."
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Cantidad *</Label>
                <Input
                  id="edit-quantity"
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
                <Label htmlFor="edit-purchase_price">Precio de Compra *</Label>
                <Input
                  id="edit-purchase_price"
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
                <Label htmlFor="edit-purchase_date">Fecha de Compra *</Label>
                <Input
                  id="edit-purchase_date"
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => handleChange("purchase_date", e.target.value)}
                  required
                />
              </div>

              {/* Currency */}
              <div className="space-y-2">
                <Label htmlFor="edit-currency">Moneda *</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => handleChange("currency", value)}
                >
                  <SelectTrigger id="edit-currency" className="w-full">
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
              <Label htmlFor="edit-notes">Notas</Label>
              <Input
                id="edit-notes"
                placeholder="Notas adicionales (opcional)"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
              />
            </div>

            <DialogFooter className="pt-4 flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isSubmitting || isDeleting}
                className="w-full sm:w-auto sm:mr-auto"
              >
                <Trash2Icon className="mr-2 size-4" />
                Eliminar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting || isDeleting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || isDeleting}>
                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar activo</AlertDialogTitle>
            <AlertDialogDescription>
              Estas seguro de que queres eliminar <strong>{asset.name}</strong> de tu portfolio? Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
