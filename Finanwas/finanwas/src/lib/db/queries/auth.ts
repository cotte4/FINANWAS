import { createClient } from '../supabase'
import type { User, InvitationCode, Database } from '@/types/database'

/**
 * Encuentra un usuario por su email
 *
 * @example
 * const user = await findUserByEmail('usuario@ejemplo.com')
 * if (user) {
 *   console.log('Usuario encontrado:', user.name)
 * }
 *
 * @param email - Email del usuario a buscar
 * @returns Usuario encontrado o null si no existe
 * @throws Error si hay un problema con la base de datos
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - usuario no encontrado
        return null
      }
      throw new Error(`Error al buscar usuario por email: ${error.message}`)
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
 * Encuentra un usuario por su ID
 *
 * @example
 * const user = await findUserById('550e8400-e29b-41d4-a716-446655440000')
 *
 * @param id - ID del usuario
 * @returns Usuario encontrado o null si no existe
 * @throws Error si hay un problema con la base de datos
 */
export async function findUserById(id: string): Promise<User | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Error al buscar usuario por ID: ${error.message}`)
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
 * Crea un nuevo usuario en la base de datos
 *
 * @example
 * const newUser = await createUser({
 *   email: 'nuevo@ejemplo.com',
 *   password_hash: 'hash_seguro',
 *   name: 'Juan Pérez',
 *   role: 'user'
 * })
 *
 * @param data - Datos del nuevo usuario
 * @returns Usuario creado
 * @throws Error si hay un problema al crear el usuario
 */
export async function createUser(
  data: Database['public']['Tables']['users']['Insert']
): Promise<User> {
  try {
    const supabase = createClient()
    const { data: user, error } = await supabase
      .from('users')
      // @ts-ignore - Type inference issue with Supabase client
      .insert({
        ...data,
        email: data.email.toLowerCase(),
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        throw new Error('El email ya está registrado')
      }
      throw new Error(`Error al crear usuario: ${error.message}`)
    }

    return user
  } catch (error) {
    throw error
  }
}

/**
 * Actualiza la fecha de último login de un usuario
 *
 * @example
 * await updateUserLastLogin('550e8400-e29b-41d4-a716-446655440000')
 *
 * @param id - ID del usuario
 * @returns Usuario actualizado
 * @throws Error si hay un problema al actualizar
 */
export async function updateUserLastLogin(id: string): Promise<User> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('users')
      // @ts-ignore - Type inference issue with Supabase client
      .update({ last_login: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Error al actualizar último login: ${error.message}`)
    }

    return data
  } catch (error) {
    throw error
  }
}

/**
 * Valida un código de invitación
 *
 * @example
 * const code = await validateInvitationCode('ABC123')
 * if (code && !code.used_at) {
 *   console.log('Código válido y disponible')
 * }
 *
 * @param code - Código de invitación a validar
 * @returns Código de invitación o null si no existe
 * @throws Error si hay un problema con la base de datos
 */
export async function validateInvitationCode(code: string): Promise<InvitationCode | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('invitation_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Error al validar código de invitación: ${error.message}`)
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
 * Marca un código de invitación como usado
 *
 * @example
 * await markCodeAsUsed('ABC123', '550e8400-e29b-41d4-a716-446655440000')
 *
 * @param code - Código de invitación
 * @param userId - ID del usuario que usó el código
 * @returns Código actualizado
 * @throws Error si el código ya fue usado o hay un problema con la base de datos
 */
export async function markCodeAsUsed(code: string, userId: string): Promise<InvitationCode> {
  try {
    const supabase = createClient()

    // Primero verificamos que el código no haya sido usado
    const existingCode = await validateInvitationCode(code)
    if (!existingCode) {
      throw new Error('Código de invitación no encontrado')
    }
    if (existingCode.used_at) {
      throw new Error('El código de invitación ya fue utilizado')
    }

    const { data, error } = await supabase
      .from('invitation_codes')
      // @ts-ignore - Type inference issue with Supabase client
      .update({
        used_at: new Date().toISOString(),
        used_by: userId,
      })
      .eq('code', code.toUpperCase())
      .is('used_at', null) // Doble verificación para evitar race conditions
      .select()
      .single()

    if (error) {
      throw new Error(`Error al marcar código como usado: ${error.message}`)
    }

    if (!data) {
      throw new Error('El código ya fue utilizado por otro usuario')
    }

    return data
  } catch (error) {
    throw error
  }
}
