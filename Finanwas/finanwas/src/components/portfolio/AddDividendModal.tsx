'use client'

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import type { PortfolioAsset } from "@/types/database"

interface AddDividendModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  assets: PortfolioAsset[]
}

export function AddDividendModal({ isOpen, onClose, onSuccess, assets }: AddDividendModalProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [formData, setFormData] = React.useState({
    asset_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    amount_per_share: '',
    total_amount: '',
    currency: 'USD',
    payment_type: 'cash' as 'cash' | 'stock' | 'drip',
    shares_received: '',
    reinvested: false,
    withholding_tax: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/dividends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          asset_id: formData.asset_id,
          payment_date: formData.payment_date,
          amount_per_share: parseFloat(formData.amount_per_share),
          total_amount: parseFloat(formData.total_amount),
          currency: formData.currency,
          payment_type: formData.payment_type,
          shares_received: formData.shares_received ? parseFloat(formData.shares_received) : null,
          reinvested: formData.reinvested,
          withholding_tax: formData.withholding_tax ? parseFloat(formData.withholding_tax) : 0,
          notes: formData.notes || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al crear dividendo')
      }

      toast.success('Dividendo registrado exitosamente')
      onSuccess()
      onClose()
      // Reset form
      setFormData({
        asset_id: '',
        payment_date: new Date().toISOString().split('T')[0],
        amount_per_share: '',
        total_amount: '',
        currency: 'USD',
        payment_type: 'cash',
        shares_received: '',
        reinvested: false,
        withholding_tax: '',
        notes: '',
      })
    } catch (error) {
      console.error('Error creating dividend:', error)
      toast.error(error instanceof Error ? error.message : 'Error al crear dividendo')
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-calculate total amount when amount per share or quantity changes
  const selectedAsset = assets.find(a => a.id === formData.asset_id)
  React.useEffect(() => {
    if (selectedAsset && formData.amount_per_share) {
      const total = parseFloat(formData.amount_per_share) * selectedAsset.quantity
      setFormData(prev => ({ ...prev, total_amount: total.toFixed(2) }))
    }
  }, [formData.amount_per_share, selectedAsset])

  // Update currency when asset changes
  React.useEffect(() => {
    if (selectedAsset) {
      setFormData(prev => ({ ...prev, currency: selectedAsset.currency }))
    }
  }, [selectedAsset])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Dividendo</DialogTitle>
          <DialogDescription>
            Registra un pago de dividendo recibido de uno de tus activos
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Asset Selection */}
          <div className="space-y-2">
            <Label htmlFor="asset_id">Activo *</Label>
            <Select
              value={formData.asset_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, asset_id: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un activo" />
              </SelectTrigger>
              <SelectContent>
                {assets.map((asset) => (
                  <SelectItem key={asset.id} value={asset.id}>
                    {asset.ticker || asset.name} ({asset.quantity} {asset.quantity === 1 ? 'acción' : 'acciones'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Date */}
          <div className="space-y-2">
            <Label htmlFor="payment_date">Fecha de Pago *</Label>
            <Input
              id="payment_date"
              type="date"
              value={formData.payment_date}
              onChange={(e) => setFormData(prev => ({ ...prev, payment_date: e.target.value }))}
              required
            />
          </div>

          {/* Amount Per Share and Total */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount_per_share">Dividendo por Acción *</Label>
              <Input
                id="amount_per_share"
                type="number"
                step="0.000001"
                min="0"
                value={formData.amount_per_share}
                onChange={(e) => setFormData(prev => ({ ...prev, amount_per_share: e.target.value }))}
                placeholder="0.50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_amount">Total Recibido *</Label>
              <Input
                id="total_amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.total_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, total_amount: e.target.value }))}
                placeholder="50.00"
                required
              />
            </div>
          </div>

          {/* Currency and Payment Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Input
                id="currency"
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                maxLength={3}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_type">Tipo de Pago</Label>
              <Select
                value={formData.payment_type}
                onValueChange={(value: 'cash' | 'stock' | 'drip') => setFormData(prev => ({ ...prev, payment_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="stock">Acciones</SelectItem>
                  <SelectItem value="drip">DRIP (Reinversión)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Shares Received (for stock/drip) */}
          {(formData.payment_type === 'stock' || formData.payment_type === 'drip') && (
            <div className="space-y-2">
              <Label htmlFor="shares_received">Acciones Recibidas</Label>
              <Input
                id="shares_received"
                type="number"
                step="0.00000001"
                min="0"
                value={formData.shares_received}
                onChange={(e) => setFormData(prev => ({ ...prev, shares_received: e.target.value }))}
                placeholder="5.5"
              />
            </div>
          )}

          {/* Withholding Tax */}
          <div className="space-y-2">
            <Label htmlFor="withholding_tax">Impuesto Retenido</Label>
            <Input
              id="withholding_tax"
              type="number"
              step="0.01"
              min="0"
              value={formData.withholding_tax}
              onChange={(e) => setFormData(prev => ({ ...prev, withholding_tax: e.target.value }))}
              placeholder="0.00"
            />
          </div>

          {/* Reinvested Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="reinvested"
              checked={formData.reinvested}
              onChange={(e) => setFormData(prev => ({ ...prev, reinvested: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="reinvested" className="cursor-pointer">
              Dividendo reinvertido
            </Label>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Información adicional sobre este dividendo..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Dividendo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
