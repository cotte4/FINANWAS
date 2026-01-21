'use client'

import * as React from "react"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { SwipeableCard } from "@/components/ui/SwipeableCard"
import { PullToRefresh } from "@/components/ui/PullToRefresh"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  TargetIcon,
  PlusIcon,
  TrendingUpIcon,
  CalendarIcon,
  CheckCircleIcon,
  Edit2Icon,
  Trash2Icon,
  DollarSignIcon,
  LoaderIcon,
} from "lucide-react"
import type { SavingsGoal } from "@/types/database"
import { toast } from "sonner"

/**
 * Savings Goals Page - US-073, US-074, US-075
 * Display and manage savings goals with progress tracking
 */

interface GoalFormData {
  name: string
  target_amount: string
  currency: string
  target_date: string
}

interface ContributionFormData {
  amount: string
  date: string
  notes: string
}

export default function MetasPage() {
  const [goals, setGoals] = React.useState<SavingsGoal[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = React.useState(false)
  const [showEditDialog, setShowEditDialog] = React.useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState<string | null>(null)
  const [showContributionDialog, setShowContributionDialog] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Form states
  const [goalForm, setGoalForm] = React.useState<GoalFormData>({
    name: '',
    target_amount: '',
    currency: 'ARS',
    target_date: '',
  })

  const [contributionForm, setContributionForm] = React.useState<ContributionFormData>({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  // Fetch goals from API
  const fetchGoals = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/goals')

      if (!response.ok) {
        throw new Error('Error al cargar metas')
      }

      const data = await response.json()
      setGoals(data.goals || [])
    } catch (error) {
      console.error('Error fetching goals:', error)
      toast.error('Error al cargar metas de ahorro')
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  // Create new goal - US-074
  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!goalForm.name || !goalForm.target_amount) {
      toast.error('Por favor completá todos los campos requeridos')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: goalForm.name,
          target_amount: parseFloat(goalForm.target_amount),
          currency: goalForm.currency,
          target_date: goalForm.target_date || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear meta')
      }

      toast.success('Meta creada exitosamente')
      setShowCreateDialog(false)
      setGoalForm({ name: '', target_amount: '', currency: 'ARS', target_date: '' })
      await fetchGoals()
    } catch (error) {
      console.error('Error creating goal:', error)
      toast.error(error instanceof Error ? error.message : 'Error al crear meta')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Edit goal
  const handleEditGoal = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!showEditDialog || !goalForm.name || !goalForm.target_amount) {
      toast.error('Por favor completá todos los campos requeridos')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/goals/${showEditDialog}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: goalForm.name,
          target_amount: parseFloat(goalForm.target_amount),
          currency: goalForm.currency,
          target_date: goalForm.target_date || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al actualizar meta')
      }

      toast.success('Meta actualizada exitosamente')
      setShowEditDialog(null)
      setGoalForm({ name: '', target_amount: '', currency: 'ARS', target_date: '' })
      await fetchGoals()
    } catch (error) {
      console.error('Error updating goal:', error)
      toast.error(error instanceof Error ? error.message : 'Error al actualizar meta')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete goal
  const handleDeleteGoal = async () => {
    if (!showDeleteDialog) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/goals/${showDeleteDialog}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al eliminar meta')
      }

      toast.success('Meta eliminada exitosamente')
      setShowDeleteDialog(null)
      await fetchGoals()
    } catch (error) {
      console.error('Error deleting goal:', error)
      toast.error(error instanceof Error ? error.message : 'Error al eliminar meta')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Add contribution - US-075
  const handleAddContribution = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!showContributionDialog || !contributionForm.amount) {
      toast.error('Por favor ingresá un monto')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/goals/${showContributionDialog}/contributions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(contributionForm.amount),
          date: contributionForm.date,
          notes: contributionForm.notes || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al agregar aporte')
      }

      toast.success('Aporte agregado exitosamente')
      setShowContributionDialog(null)
      setContributionForm({ amount: '', date: new Date().toISOString().split('T')[0], notes: '' })
      await fetchGoals()
    } catch (error) {
      console.error('Error adding contribution:', error)
      toast.error(error instanceof Error ? error.message : 'Error al agregar aporte')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Open edit dialog with goal data
  const openEditDialog = React.useCallback((goal: SavingsGoal) => {
    setGoalForm({
      name: goal.name,
      target_amount: goal.target_amount.toString(),
      currency: goal.currency,
      target_date: goal.target_date ? goal.target_date.split('T')[0] : '',
    })
    setShowEditDialog(goal.id)
  }, [])

  // Calculate progress for each goal with memoization
  const goalsWithProgress = React.useMemo(() => {
    return goals.map(goal => ({
      ...goal,
      progress: goal.target_amount > 0
        ? Math.min((goal.current_amount / goal.target_amount) * 100, 100)
        : 0,
      isCompleted: !!goal.completed_at || goal.current_amount >= goal.target_amount
    }))
  }, [goals])

  const activeGoals = React.useMemo(() => {
    return goalsWithProgress.filter(g => !g.isCompleted)
  }, [goalsWithProgress])

  const completedGoals = React.useMemo(() => {
    return goalsWithProgress.filter(g => g.isCompleted)
  }, [goalsWithProgress])

  // Calculate summary stats with memoization
  const summaryStats = React.useMemo(() => {
    const totalTargetAmount = goals.reduce((sum, g) => sum + g.target_amount, 0)
    const totalCurrentAmount = goals.reduce((sum, g) => sum + g.current_amount, 0)
    const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0
    return { totalTargetAmount, totalCurrentAmount, overallProgress }
  }, [goals])

  const getDaysRemaining = React.useCallback((targetDate: string | null) => {
    if (!targetDate) return null
    const today = new Date()
    const target = new Date(targetDate)
    const diff = target.getTime() - today.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days
  }, [])

  return (
    <PullToRefresh onRefresh={fetchGoals}>
      <div className="p-6 space-y-8">
      <PageHeader
        title="Mis Metas de Ahorro"
        description="Administra tus objetivos financieros y sigue tu progreso"
        action={
          <Button onClick={() => setShowCreateDialog(true)}>
            <PlusIcon className="mr-2 size-4" />
            Nueva Meta
          </Button>
        }
      />

      {/* Summary Card */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle>Progreso General</CardTitle>
          <CardDescription>Resumen de todas tus metas de ahorro</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Metas Activas</p>
                  <p className="text-3xl font-bold">{activeGoals.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Ahorrado</p>
                  <p className="text-3xl font-bold">${summaryStats.totalCurrentAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Meta Total</p>
                  <p className="text-3xl font-bold">${summaryStats.totalTargetAmount.toLocaleString()}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Progreso General</span>
                  <span className="text-muted-foreground">{summaryStats.overallProgress.toFixed(1)}%</span>
                </div>
                <Progress value={summaryStats.overallProgress} className="h-3" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Goals - US-073 */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Metas Activas</h2>
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : activeGoals.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <EmptyState
                icon={TargetIcon}
                title="No tenés metas activas"
                description="¡Creá tu primera meta de ahorro para comenzar a alcanzar tus objetivos financieros!"
                action={{
                  label: "Crear Meta",
                  onClick: () => setShowCreateDialog(true)
                }}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {activeGoals.map((goal) => {
              const daysRemaining = getDaysRemaining(goal.target_date)
              const remaining = goal.target_amount - goal.current_amount

              return (
                <SwipeableCard
                  key={goal.id}
                  onDelete={() => {
                    setShowDeleteDialog(goal.id)
                  }}
                  deleteLabel="Eliminar"
                  className="md:pointer-events-none"
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-xl truncate">{goal.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            {goal.target_date && (
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="size-3" />
                                <span>
                                  {daysRemaining !== null && daysRemaining > 0
                                    ? `${daysRemaining} días restantes`
                                    : daysRemaining === 0
                                    ? "Vence hoy"
                                    : "Vencida"}
                                </span>
                              </div>
                            )}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={goal.progress >= 75 ? "default" : "secondary"}
                          className="shrink-0"
                        >
                          {goal.progress.toFixed(0)}%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Progress */}
                      <div className="space-y-2">
                        <Progress value={goal.progress} className="h-2" />
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">
                            ${goal.current_amount.toLocaleString()} {goal.currency}
                          </span>
                          <span className="text-muted-foreground">
                            de ${goal.target_amount.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Remaining */}
                      <div className="p-3 rounded-lg bg-accent">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Falta</p>
                            <p className="text-lg font-bold">${remaining.toLocaleString()}</p>
                          </div>
                          <TrendingUpIcon className="size-8 text-muted-foreground" />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setShowContributionDialog(goal.id)}
                        >
                          <PlusIcon className="mr-2 size-4" />
                          Agregar Aporte
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(goal)}>
                          <Edit2Icon className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive md:inline-flex hidden"
                          onClick={() => setShowDeleteDialog(goal.id)}
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </SwipeableCard>
              )
            })}
          </div>
        )}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Metas Completadas</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {completedGoals.map((goal) => (
              <Card key={goal.id} className="border-green-500">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircleIcon className="size-5 text-green-500" />
                    <Badge variant="default" className="bg-green-500">
                      Completada
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{goal.name}</CardTitle>
                  <CardDescription>
                    ${goal.target_amount.toLocaleString()} {goal.currency}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Create Goal Dialog - US-074 */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Meta de Ahorro</DialogTitle>
            <DialogDescription>
              Creá una nueva meta y empezá a ahorrar para tus objetivos.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateGoal}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la meta *</Label>
                <Input
                  id="name"
                  placeholder="ej. Fondo de emergencia"
                  value={goalForm.name}
                  onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target_amount">Monto objetivo *</Label>
                  <Input
                    id="target_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="10000"
                    value={goalForm.target_amount}
                    onChange={(e) => setGoalForm({ ...goalForm, target_amount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Moneda *</Label>
                  <select
                    id="currency"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={goalForm.currency}
                    onChange={(e) => setGoalForm({ ...goalForm, currency: e.target.value })}
                  >
                    <option value="ARS">ARS</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="target_date">Fecha objetivo (opcional)</Label>
                <Input
                  id="target_date"
                  type="date"
                  value={goalForm.target_date}
                  onChange={(e) => setGoalForm({ ...goalForm, target_date: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <LoaderIcon className="mr-2 size-4 animate-spin" />}
                Crear Meta
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Goal Dialog */}
      <Dialog open={!!showEditDialog} onOpenChange={() => setShowEditDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Meta de Ahorro</DialogTitle>
            <DialogDescription>
              Modificá los detalles de tu meta de ahorro.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditGoal}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre de la meta *</Label>
                <Input
                  id="edit-name"
                  placeholder="ej. Fondo de emergencia"
                  value={goalForm.name}
                  onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-target_amount">Monto objetivo *</Label>
                  <Input
                    id="edit-target_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="10000"
                    value={goalForm.target_amount}
                    onChange={(e) => setGoalForm({ ...goalForm, target_amount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-currency">Moneda *</Label>
                  <select
                    id="edit-currency"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={goalForm.currency}
                    onChange={(e) => setGoalForm({ ...goalForm, currency: e.target.value })}
                  >
                    <option value="ARS">ARS</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-target_date">Fecha objetivo (opcional)</Label>
                <Input
                  id="edit-target_date"
                  type="date"
                  value={goalForm.target_date}
                  onChange={(e) => setGoalForm({ ...goalForm, target_date: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditDialog(null)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <LoaderIcon className="mr-2 size-4 animate-spin" />}
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Goal Dialog */}
      <Dialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Meta</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que querés eliminar esta meta? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(null)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteGoal}
              disabled={isSubmitting}
            >
              {isSubmitting && <LoaderIcon className="mr-2 size-4 animate-spin" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Contribution Dialog - US-075 */}
      <Dialog open={!!showContributionDialog} onOpenChange={() => setShowContributionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Aporte</DialogTitle>
            <DialogDescription>
              Registrá un nuevo aporte a tu meta de ahorro.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddContribution}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Monto *</Label>
                <div className="relative">
                  <DollarSignIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="1000"
                    className="pl-10"
                    value={contributionForm.amount}
                    onChange={(e) => setContributionForm({ ...contributionForm, amount: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Fecha *</Label>
                <Input
                  id="date"
                  type="date"
                  value={contributionForm.date}
                  onChange={(e) => setContributionForm({ ...contributionForm, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Input
                  id="notes"
                  placeholder="ej. Ahorro del mes"
                  value={contributionForm.notes}
                  onChange={(e) => setContributionForm({ ...contributionForm, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowContributionDialog(null)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <LoaderIcon className="mr-2 size-4 animate-spin" />}
                Agregar Aporte
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </PullToRefresh>
  )
}
