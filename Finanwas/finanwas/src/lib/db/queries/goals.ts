import { createClient } from '../supabase'
import type { SavingsGoal, SavingsContribution, Database } from '@/types/database'

/**
 * Interfaz para el progreso calculado de una meta
 */
export interface GoalProgress {
  goal: SavingsGoal
  contributions: SavingsContribution[]
  totalContributed: number
  percentageComplete: number
  remainingAmount: number
  daysUntilTarget: number | null
  isCompleted: boolean
}

/**
 * Obtiene todas las metas de ahorro de un usuario
 *
 * @example
 * const goals = await getUserGoals('550e8400-e29b-41d4-a716-446655440000')
 * console.log(`Metas activas: ${goals.filter(g => !g.completed_at).length}`)
 *
 * @param userId - ID del usuario
 * @returns Array de metas de ahorro
 * @throws Error si hay un problema con la base de datos
 */
export async function getUserGoals(userId: string): Promise<SavingsGoal[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Error al obtener metas de ahorro: ${error.message}`)
    }

    return data || []
  } catch (error) {
    throw error
  }
}

/**
 * Obtiene una meta específica por ID, verificando que pertenezca al usuario
 *
 * @example
 * const goal = await getGoalById('goal-id', 'user-id')
 * if (goal) {
 *   console.log(`Meta: ${goal.name}`)
 * }
 *
 * @param id - ID de la meta
 * @param userId - ID del usuario dueño
 * @returns Meta encontrada o null si no existe o no pertenece al usuario
 * @throws Error si hay un problema con la base de datos
 */
export async function getGoalById(id: string, userId: string): Promise<SavingsGoal | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Error al obtener meta: ${error.message}`)
    }

    return data
  } catch (error) {
    if (error instanceof Error && error.message.includes('No rows')) {
      return null
    }
    throw error
  }
}

/**
 * Crea una nueva meta de ahorro
 *
 * @example
 * const goal = await createGoal('user-id', {
 *   name: 'Fondo de emergencia',
 *   target_amount: 10000,
 *   currency: 'USD',
 *   target_date: '2024-12-31'
 * })
 *
 * @param userId - ID del usuario
 * @param data - Datos de la meta (sin user_id)
 * @returns Meta creada
 * @throws Error si hay un problema al crear la meta
 */
export async function createGoal(
  userId: string,
  data: Omit<Database['public']['Tables']['savings_goals']['Insert'], 'user_id'>
): Promise<SavingsGoal> {
  try {
    const supabase = createClient()
    const { data: goal, error } = await supabase
      .from('savings_goals')
      // @ts-ignore - Type inference issue with Supabase client
      .insert({
        user_id: userId,
        ...data,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Error al crear meta de ahorro: ${error.message}`)
    }

    return goal
  } catch (error) {
    throw error
  }
}

/**
 * Actualiza una meta existente, verificando que pertenezca al usuario
 *
 * @example
 * const updated = await updateGoal('goal-id', 'user-id', {
 *   target_amount: 15000,
 *   target_date: '2025-06-30'
 * })
 *
 * @param id - ID de la meta
 * @param userId - ID del usuario dueño
 * @param data - Datos a actualizar
 * @returns Meta actualizada
 * @throws Error si la meta no existe, no pertenece al usuario o hay un problema al actualizar
 */
export async function updateGoal(
  id: string,
  userId: string,
  data: Database['public']['Tables']['savings_goals']['Update']
): Promise<SavingsGoal> {
  try {
    const supabase = createClient()
    const { data: goal, error } = await supabase
      .from('savings_goals')
      // @ts-ignore - Type inference issue with Supabase client
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Meta no encontrada o no tienes permiso para editarla')
      }
      throw new Error(`Error al actualizar meta: ${error.message}`)
    }

    return goal
  } catch (error) {
    throw error
  }
}

/**
 * Elimina una meta de ahorro, verificando que pertenezca al usuario
 *
 * @example
 * await deleteGoal('goal-id', 'user-id')
 *
 * @param id - ID de la meta
 * @param userId - ID del usuario dueño
 * @throws Error si la meta no existe, no pertenece al usuario o hay un problema al eliminar
 */
export async function deleteGoal(id: string, userId: string): Promise<void> {
  try {
    const supabase = createClient()

    // Primero eliminamos las contribuciones asociadas
    await supabase
      .from('savings_contributions')
      .delete()
      .eq('goal_id', id)

    // Luego eliminamos la meta
    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Error al eliminar meta: ${error.message}`)
    }
  } catch (error) {
    throw error
  }
}

/**
 * Obtiene todas las contribuciones de una meta
 *
 * @example
 * const contributions = await getGoalContributions('goal-id')
 * console.log(`Total de contribuciones: ${contributions.length}`)
 *
 * @param goalId - ID de la meta
 * @returns Array de contribuciones
 * @throws Error si hay un problema con la base de datos
 */
export async function getGoalContributions(goalId: string): Promise<SavingsContribution[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('savings_contributions')
      .select('*')
      .eq('goal_id', goalId)
      .order('date', { ascending: false })

    if (error) {
      throw new Error(`Error al obtener contribuciones: ${error.message}`)
    }

    return data || []
  } catch (error) {
    throw error
  }
}

/**
 * Agrega una nueva contribución a una meta y actualiza el monto actual
 *
 * @example
 * const contribution = await addContribution('goal-id', {
 *   amount: 500,
 *   date: '2024-01-15',
 *   notes: 'Ahorro mensual'
 * })
 *
 * @param goalId - ID de la meta
 * @param data - Datos de la contribución (sin goal_id)
 * @returns Contribución creada
 * @throws Error si hay un problema al crear la contribución o actualizar la meta
 */
export async function addContribution(
  goalId: string,
  data: Omit<Database['public']['Tables']['savings_contributions']['Insert'], 'goal_id'>
): Promise<SavingsContribution> {
  try {
    const supabase = createClient()

    // Crear la contribución
    const { data: contribution, error: contributionError } = await supabase
      .from('savings_contributions')
      // @ts-ignore - Type inference issue with Supabase client
      .insert({
        goal_id: goalId,
        ...data,
      })
      .select()
      .single()

    if (contributionError) {
      throw new Error(`Error al crear contribución: ${contributionError.message}`)
    }

    // Obtener la meta actual
    const { data: goal, error: goalError } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('id', goalId)
      .single() as { data: SavingsGoal | null; error: any }

    if (goalError || !goal) {
      throw new Error(`Error al obtener meta: ${goalError?.message || 'Meta no encontrada'}`)
    }

    // Actualizar el monto actual de la meta
    const newCurrentAmount = goal.current_amount + data.amount
    const isNowComplete = newCurrentAmount >= goal.target_amount && !goal.completed_at

    const { error: updateError } = await supabase
      .from('savings_goals')
      // @ts-ignore - Type inference issue with Supabase client
      .update({
        current_amount: newCurrentAmount,
        completed_at: isNowComplete ? new Date().toISOString() : goal.completed_at,
        updated_at: new Date().toISOString(),
      })
      .eq('id', goalId)

    if (updateError) {
      throw new Error(`Error al actualizar meta: ${updateError.message}`)
    }

    return contribution
  } catch (error) {
    throw error
  }
}

/**
 * Calcula el progreso detallado de una meta
 *
 * @example
 * const progress = await calculateGoalProgress('goal-id')
 * console.log(`Progreso: ${progress.percentageComplete}%`)
 * console.log(`Falta: $${progress.remainingAmount}`)
 *
 * @param goalId - ID de la meta
 * @returns Progreso calculado de la meta
 * @throws Error si la meta no existe o hay un problema con la base de datos
 */
export async function calculateGoalProgress(goalId: string): Promise<GoalProgress> {
  try {
    const supabase = createClient()

    // Obtener la meta
    const { data: goal, error: goalError } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('id', goalId)
      .single()

    if (goalError) {
      throw new Error(`Error al obtener meta: ${goalError.message}`)
    }

    // Obtener las contribuciones
    const contributions = await getGoalContributions(goalId)

    // Calcular totales
    const totalContributed = contributions.reduce((sum, c) => sum + c.amount, 0)
    const percentageComplete = goal.target_amount > 0
      ? Math.min((goal.current_amount / goal.target_amount) * 100, 100)
      : 0
    const remainingAmount = Math.max(goal.target_amount - goal.current_amount, 0)

    // Calcular días hasta la fecha objetivo
    let daysUntilTarget: number | null = null
    if (goal.target_date) {
      const targetDate = new Date(goal.target_date)
      const today = new Date()
      const diffTime = targetDate.getTime() - today.getTime()
      daysUntilTarget = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    const isCompleted = !!goal.completed_at || goal.current_amount >= goal.target_amount

    return {
      goal,
      contributions,
      totalContributed,
      percentageComplete,
      remainingAmount,
      daysUntilTarget,
      isCompleted,
    }
  } catch (error) {
    throw error
  }
}
