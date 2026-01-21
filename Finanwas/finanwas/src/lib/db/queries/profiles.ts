import { createClient } from '../supabase'
import type { UserProfile, Database } from '@/types/database'

/**
 * Obtiene el perfil de un usuario por su ID
 *
 * @example
 * const profile = await getProfileByUserId('550e8400-e29b-41d4-a716-446655440000')
 * if (profile?.questionnaire_completed) {
 *   console.log('Cuestionario completado')
 * }
 *
 * @param userId - ID del usuario
 * @returns Perfil del usuario o null si no existe
 * @throws Error si hay un problema con la base de datos
 */
export async function getProfileByUserId(userId: string): Promise<UserProfile | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Error al obtener perfil de usuario: ${error.message}`)
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
 * Crea un nuevo perfil de usuario
 *
 * @example
 * const profile = await createProfile('550e8400-e29b-41d4-a716-446655440000', {
 *   country: 'Argentina',
 *   knowledge_level: 'beginner',
 *   main_goal: 'save'
 * })
 *
 * @param userId - ID del usuario
 * @param data - Datos del perfil (sin user_id que se agrega automáticamente)
 * @returns Perfil creado
 * @throws Error si hay un problema al crear el perfil
 */
export async function createProfile(
  userId: string,
  data: Omit<Database['public']['Tables']['user_profiles']['Insert'], 'user_id'>
): Promise<UserProfile> {
  try {
    const supabase = createClient()
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        ...data,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        throw new Error('El usuario ya tiene un perfil creado')
      }
      throw new Error(`Error al crear perfil: ${error.message}`)
    }

    return profile
  } catch (error) {
    throw error
  }
}

/**
 * Actualiza el perfil de un usuario
 *
 * @example
 * const updated = await updateProfile('550e8400-e29b-41d4-a716-446655440000', {
 *   risk_tolerance: 'moderate',
 *   has_emergency_fund: true
 * })
 *
 * @param userId - ID del usuario dueño del perfil
 * @param data - Datos a actualizar
 * @returns Perfil actualizado
 * @throws Error si el perfil no existe o hay un problema al actualizar
 */
export async function updateProfile(
  userId: string,
  data: Database['public']['Tables']['user_profiles']['Update']
): Promise<UserProfile> {
  try {
    const supabase = createClient()
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Perfil no encontrado')
      }
      throw new Error(`Error al actualizar perfil: ${error.message}`)
    }

    return profile
  } catch (error) {
    throw error
  }
}

/**
 * Marca el cuestionario de un usuario como completado
 *
 * @example
 * await markQuestionnaireComplete('550e8400-e29b-41d4-a716-446655440000')
 *
 * @param userId - ID del usuario
 * @returns Perfil actualizado
 * @throws Error si hay un problema al actualizar
 */
export async function markQuestionnaireComplete(userId: string): Promise<UserProfile> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        questionnaire_completed: true,
        questionnaire_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Perfil no encontrado')
      }
      throw new Error(`Error al marcar cuestionario como completado: ${error.message}`)
    }

    return data
  } catch (error) {
    throw error
  }
}
