/**
 * User Profile Database Queries
 * Functions for retrieving and managing user profile data
 */

import { createClient } from '../supabase'
import type { UserProfile } from '@/types/database'

/**
 * Get user profile by user ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No profile found
        return null
      }
      throw error
    }

    return data
  } catch (error) {
    console.error('Error fetching user profile:', error)
    throw error
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  profileData: Partial<UserProfile>
): Promise<UserProfile> {
  try {
    const supabase = createClient()

    // Remove fields that shouldn't be updated
    const updateData = { ...profileData }
    delete (updateData as any).id
    delete (updateData as any).user_id
    delete (updateData as any).updated_at

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    if (!data) {
      throw new Error('User profile not found')
    }

    return data
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

/**
 * Create user profile if it doesn't exist
 */
export async function createUserProfile(
  userId: string,
  profileData: Partial<UserProfile> = {}
): Promise<UserProfile> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        country: profileData.country || null,
        knowledge_level: profileData.knowledge_level || null,
        main_goal: profileData.main_goal || null,
        risk_tolerance: profileData.risk_tolerance || null,
        has_debt: profileData.has_debt ?? null,
        has_emergency_fund: profileData.has_emergency_fund ?? null,
        has_investments: profileData.has_investments ?? null,
        income_range: profileData.income_range || null,
        expense_range: profileData.expense_range || null,
        investment_horizon: profileData.investment_horizon || null,
        questionnaire_completed: profileData.questionnaire_completed ?? false,
        preferred_currency: profileData.preferred_currency || 'ARS'
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Error creating user profile:', error)
    throw error
  }
}

/**
 * Get or create user profile
 */
export async function getOrCreateUserProfile(userId: string): Promise<UserProfile> {
  let profile = await getUserProfile(userId)

  if (!profile) {
    profile = await createUserProfile(userId)
  }

  return profile
}
