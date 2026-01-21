import { createClient } from '../supabase'
import type { Note, Database } from '@/types/database'

/**
 * Interfaz para filtros de búsqueda de notas
 */
export interface NoteFilters {
  tags?: string[]
  linkedTicker?: string
  searchQuery?: string
  limit?: number
  offset?: number
}

/**
 * Obtiene todas las notas de un usuario con filtros opcionales
 *
 * @example
 * // Obtener todas las notas
 * const notes = await getUserNotes('user-id')
 *
 * // Filtrar por tags
 * const investmentNotes = await getUserNotes('user-id', {
 *   tags: ['inversiones', 'acciones']
 * })
 *
 * // Con paginación
 * const page2 = await getUserNotes('user-id', {
 *   limit: 20,
 *   offset: 20
 * })
 *
 * @param userId - ID del usuario
 * @param filters - Filtros opcionales para la búsqueda
 * @returns Array de notas del usuario
 * @throws Error si hay un problema con la base de datos
 */
export async function getUserNotes(userId: string, filters?: NoteFilters): Promise<Note[]> {
  try {
    const supabase = createClient()
    let query = supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    // Aplicar filtros
    if (filters?.linkedTicker) {
      query = query.eq('linked_ticker', filters.linkedTicker)
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags)
    }

    // Aplicar paginación
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }
    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset + (filters?.limit || 10)) - 1)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Error al obtener notas: ${error.message}`)
    }

    // Filtrar por búsqueda de texto si se proporciona
    let notes = data || []
    if (filters?.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase()
      notes = notes.filter(note =>
        note.title.toLowerCase().includes(searchLower) ||
        note.content.toLowerCase().includes(searchLower)
      )
    }

    return notes
  } catch (error) {
    throw error
  }
}

/**
 * Obtiene una nota específica por ID, verificando que pertenezca al usuario
 *
 * @example
 * const note = await getNoteById('note-id', 'user-id')
 * if (note) {
 *   console.log(`Nota: ${note.title}`)
 * }
 *
 * @param id - ID de la nota
 * @param userId - ID del usuario dueño
 * @returns Nota encontrada o null si no existe o no pertenece al usuario
 * @throws Error si hay un problema con la base de datos
 */
export async function getNoteById(id: string, userId: string): Promise<Note | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Error al obtener nota: ${error.message}`)
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
 * Crea una nueva nota
 *
 * @example
 * const note = await createNote('user-id', {
 *   title: 'Análisis de Apple',
 *   content: 'Observaciones sobre el último reporte trimestral...',
 *   tags: ['análisis', 'tech'],
 *   linked_ticker: 'AAPL'
 * })
 *
 * @param userId - ID del usuario
 * @param data - Datos de la nota (sin user_id)
 * @returns Nota creada
 * @throws Error si hay un problema al crear la nota
 */
export async function createNote(
  userId: string,
  data: Omit<Database['public']['Tables']['notes']['Insert'], 'user_id'>
): Promise<Note> {
  try {
    const supabase = createClient()
    const { data: note, error } = await supabase
      .from('notes')
      .insert({
        user_id: userId,
        ...data,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Error al crear nota: ${error.message}`)
    }

    return note
  } catch (error) {
    throw error
  }
}

/**
 * Actualiza una nota existente, verificando que pertenezca al usuario
 *
 * @example
 * const updated = await updateNote('note-id', 'user-id', {
 *   content: 'Contenido actualizado...',
 *   tags: ['análisis', 'tech', 'actualizado']
 * })
 *
 * @param id - ID de la nota
 * @param userId - ID del usuario dueño
 * @param data - Datos a actualizar
 * @returns Nota actualizada
 * @throws Error si la nota no existe, no pertenece al usuario o hay un problema al actualizar
 */
export async function updateNote(
  id: string,
  userId: string,
  data: Database['public']['Tables']['notes']['Update']
): Promise<Note> {
  try {
    const supabase = createClient()
    const { data: note, error } = await supabase
      .from('notes')
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
        throw new Error('Nota no encontrada o no tienes permiso para editarla')
      }
      throw new Error(`Error al actualizar nota: ${error.message}`)
    }

    return note
  } catch (error) {
    throw error
  }
}

/**
 * Elimina una nota, verificando que pertenezca al usuario
 *
 * @example
 * await deleteNote('note-id', 'user-id')
 *
 * @param id - ID de la nota
 * @param userId - ID del usuario dueño
 * @throws Error si la nota no existe, no pertenece al usuario o hay un problema al eliminar
 */
export async function deleteNote(id: string, userId: string): Promise<void> {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Error al eliminar nota: ${error.message}`)
    }
  } catch (error) {
    throw error
  }
}

/**
 * Busca notas por contenido de texto
 *
 * @example
 * const results = await searchNotes('user-id', 'dividendos')
 * console.log(`Encontradas ${results.length} notas con "dividendos"`)
 *
 * @param userId - ID del usuario
 * @param query - Texto a buscar en título y contenido
 * @returns Array de notas que coinciden con la búsqueda
 * @throws Error si hay un problema con la base de datos
 */
export async function searchNotes(userId: string, query: string): Promise<Note[]> {
  return getUserNotes(userId, { searchQuery: query })
}

/**
 * Obtiene todas las notas con un tag específico
 *
 * @example
 * const investmentNotes = await getNotesByTag('user-id', 'inversiones')
 *
 * @param userId - ID del usuario
 * @param tag - Tag a buscar
 * @returns Array de notas con el tag especificado
 * @throws Error si hay un problema con la base de datos
 */
export async function getNotesByTag(userId: string, tag: string): Promise<Note[]> {
  return getUserNotes(userId, { tags: [tag] })
}

/**
 * Obtiene todas las notas vinculadas a un ticker específico
 *
 * @example
 * const appleNotes = await getNotesByTicker('user-id', 'AAPL')
 *
 * @param userId - ID del usuario
 * @param ticker - Ticker del activo
 * @returns Array de notas vinculadas al ticker
 * @throws Error si hay un problema con la base de datos
 */
export async function getNotesByTicker(userId: string, ticker: string): Promise<Note[]> {
  return getUserNotes(userId, { linkedTicker: ticker })
}
