import { createClient } from '../supabase'
import type { TipView } from '@/types/database'

/**
 * Registra que un usuario vio un tip
 *
 * @example
 * await recordTipView('550e8400-e29b-41d4-a716-446655440000', 'tip-diversificacion')
 *
 * @param userId - ID del usuario
 * @param tipId - ID del tip visto
 * @returns Vista del tip registrada
 * @throws Error si hay un problema con la base de datos
 */
export async function recordTipView(userId: string, tipId: string): Promise<TipView> {
  try {
    const supabase = createClient()

    // Verificar si ya existe una vista previa
    const { data: existing } = await supabase
      .from('tip_views')
      .select('*')
      .eq('user_id', userId)
      .eq('tip_id', tipId)
      .single()

    if (existing) {
      // Si ya existe, actualizamos la fecha de vista
      const { data, error } = await supabase
        .from('tip_views')
        .update({
          viewed_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        throw new Error(`Error al actualizar vista de tip: ${error.message}`)
      }

      return data
    } else {
      // Si no existe, creamos nuevo registro
      const { data, error } = await supabase
        .from('tip_views')
        .insert({
          user_id: userId,
          tip_id: tipId,
          viewed_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Error al registrar vista de tip: ${error.message}`)
      }

      return data
    }
  } catch (error) {
    throw error
  }
}

/**
 * Obtiene todas las vistas de tips de un usuario
 *
 * @example
 * const tipViews = await getUserTipViews('550e8400-e29b-41d4-a716-446655440000')
 * console.log(`Tips vistos: ${tipViews.length}`)
 *
 * @param userId - ID del usuario
 * @returns Array de vistas de tips
 * @throws Error si hay un problema con la base de datos
 */
export async function getUserTipViews(userId: string): Promise<TipView[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('tip_views')
      .select('*')
      .eq('user_id', userId)
      .order('viewed_at', { ascending: false })

    if (error) {
      throw new Error(`Error al obtener vistas de tips: ${error.message}`)
    }

    return data || []
  } catch (error) {
    throw error
  }
}

/**
 * Obtiene los tips guardados por un usuario
 *
 * @example
 * const savedTips = await getSavedTips('550e8400-e29b-41d4-a716-446655440000')
 * console.log(`Tips guardados: ${savedTips.length}`)
 *
 * @param userId - ID del usuario
 * @returns Array de tips guardados
 * @throws Error si hay un problema con la base de datos
 */
export async function getSavedTips(userId: string): Promise<TipView[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('tip_views')
      .select('*')
      .eq('user_id', userId)
      .eq('saved', true)
      .order('viewed_at', { ascending: false })

    if (error) {
      throw new Error(`Error al obtener tips guardados: ${error.message}`)
    }

    return data || []
  } catch (error) {
    throw error
  }
}

/**
 * Alterna el estado guardado de un tip (guardar/des-guardar)
 *
 * @example
 * const tipView = await toggleTipSaved(
 *   '550e8400-e29b-41d4-a716-446655440000',
 *   'tip-diversificacion'
 * )
 * console.log(`Tip guardado: ${tipView.saved}`)
 *
 * @param userId - ID del usuario
 * @param tipId - ID del tip
 * @returns Vista del tip actualizada
 * @throws Error si el tip no ha sido visto o hay un problema con la base de datos
 */
export async function toggleTipSaved(userId: string, tipId: string): Promise<TipView> {
  try {
    const supabase = createClient()

    // Obtener el registro existente
    const { data: existing, error: fetchError } = await supabase
      .from('tip_views')
      .select('*')
      .eq('user_id', userId)
      .eq('tip_id', tipId)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw new Error('Debes ver el tip antes de guardarlo')
      }
      throw new Error(`Error al obtener tip: ${fetchError.message}`)
    }

    // Alternar el estado guardado
    const { data, error } = await supabase
      .from('tip_views')
      .update({
        saved: !existing.saved,
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) {
      throw new Error(`Error al actualizar tip guardado: ${error.message}`)
    }

    return data
  } catch (error) {
    throw error
  }
}
