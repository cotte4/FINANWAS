import { createClient } from '../supabase'
import type { User, InvitationCode, Database } from '@/types/database'
import { randomBytes } from 'crypto'

/**
 * Interfaz para estadísticas de usuarios
 */
export interface UserStats {
  totalUsers: number
  activeUsers: number
  newUsersThisMonth: number
  usersWithCompletedQuestionnaire: number
  usersByRole: Record<string, number>
  averageLoginFrequency: number
}

/**
 * Obtiene todos los usuarios del sistema (solo para administradores)
 *
 * @example
 * const users = await getAllUsers()
 * console.log(`Total de usuarios: ${users.length}`)
 *
 * @returns Array de todos los usuarios
 * @throws Error si hay un problema con la base de datos
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Error al obtener usuarios: ${error.message}`)
    }

    return data || []
  } catch (error) {
    throw error
  }
}

/**
 * Obtiene estadísticas generales de usuarios
 *
 * @example
 * const stats = await getUserStats()
 * console.log(`Usuarios activos: ${stats.activeUsers}`)
 * console.log(`Nuevos este mes: ${stats.newUsersThisMonth}`)
 *
 * @returns Estadísticas calculadas de usuarios
 * @throws Error si hay un problema con la base de datos
 */
export async function getUserStats(): Promise<UserStats> {
  try {
    const supabase = createClient()

    // Obtener todos los usuarios
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')

    if (usersError) {
      throw new Error(`Error al obtener usuarios: ${usersError.message}`)
    }

    // Obtener perfiles para estadísticas adicionales
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('questionnaire_completed')

    if (profilesError) {
      throw new Error(`Error al obtener perfiles: ${profilesError.message}`)
    }

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Calcular estadísticas
    const totalUsers = users?.length || 0
    const activeUsers = users?.filter(u => {
      if (!u.last_login) return false
      return new Date(u.last_login) > thirtyDaysAgo
    }).length || 0

    const newUsersThisMonth = users?.filter(u => {
      return new Date(u.created_at) >= firstDayOfMonth
    }).length || 0

    const usersWithCompletedQuestionnaire = profiles?.filter(
      p => p.questionnaire_completed
    ).length || 0

    // Agrupar por rol
    const usersByRole: Record<string, number> = {}
    users?.forEach(user => {
      usersByRole[user.role] = (usersByRole[user.role] || 0) + 1
    })

    // Calcular frecuencia promedio de login (usuarios con al menos un login)
    const usersWithLogin = users?.filter(u => u.last_login) || []
    let averageLoginFrequency = 0
    if (usersWithLogin.length > 0) {
      const daysSinceCreation = usersWithLogin.map(u => {
        const created = new Date(u.created_at)
        const lastLogin = u.last_login ? new Date(u.last_login) : created
        return Math.max((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24), 1)
      })
      averageLoginFrequency = daysSinceCreation.reduce((a, b) => a + b, 0) / usersWithLogin.length
    }

    return {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      usersWithCompletedQuestionnaire,
      usersByRole,
      averageLoginFrequency,
    }
  } catch (error) {
    throw error
  }
}

/**
 * Obtiene todos los códigos de invitación
 *
 * @example
 * const codes = await getAllInvitationCodes()
 * const availableCodes = codes.filter(c => !c.used_at)
 * console.log(`Códigos disponibles: ${availableCodes.length}`)
 *
 * @returns Array de códigos de invitación
 * @throws Error si hay un problema con la base de datos
 */
export async function getAllInvitationCodes(): Promise<InvitationCode[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('invitation_codes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Error al obtener códigos de invitación: ${error.message}`)
    }

    return data || []
  } catch (error) {
    throw error
  }
}

/**
 * Genera un nuevo código de invitación único
 *
 * @example
 * const code = await generateInvitationCode()
 * console.log(`Nuevo código: ${code.code}`)
 *
 * @returns Código de invitación generado
 * @throws Error si hay un problema al generar el código
 */
export async function generateInvitationCode(): Promise<InvitationCode> {
  try {
    const supabase = createClient()

    // Generar código único de 8 caracteres
    const generateCode = (): string => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      const bytes = randomBytes(8)
      let code = ''
      for (let i = 0; i < 8; i++) {
        code += chars[bytes[i] % chars.length]
      }
      return code
    }

    // Intentar generar un código único (máximo 5 intentos)
    let attempts = 0
    let code = generateCode()
    let isUnique = false

    while (!isUnique && attempts < 5) {
      const { data: existing } = await supabase
        .from('invitation_codes')
        .select('id')
        .eq('code', code)
        .single()

      if (!existing) {
        isUnique = true
      } else {
        code = generateCode()
        attempts++
      }
    }

    if (!isUnique) {
      throw new Error('No se pudo generar un código único después de varios intentos')
    }

    // Crear el código en la base de datos
    const { data: newCode, error } = await supabase
      .from('invitation_codes')
      .insert({
        code,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Error al crear código de invitación: ${error.message}`)
    }

    return newCode
  } catch (error) {
    throw error
  }
}
