import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client for server-side usage
 * Uses environment variables for authentication
 * @returns Supabase client instance
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }

  if (!supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Typed Supabase client for server-side operations
 * Export this to use throughout the application
 */
export type SupabaseClient = ReturnType<typeof createClient>
