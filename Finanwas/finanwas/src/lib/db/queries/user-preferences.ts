import { createClient } from '../supabase';
import type { Database } from '@/types/database';

/**
 * Gets the user's preferred currency from their profile
 * @param userId - ID of the user
 * @returns Preferred currency code (e.g., 'USD', 'ARS', 'EUR')
 * @throws Error if there's a database problem
 */
export async function getUserPreferredCurrency(userId: string): Promise<string> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('user_profiles')
      .select('preferred_currency')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user preferred currency:', error);
      return 'USD'; // Default fallback
    }

    return data?.preferred_currency || 'USD';
  } catch (error) {
    console.error('Error in getUserPreferredCurrency:', error);
    return 'USD'; // Default fallback
  }
}

/**
 * Updates the user's preferred currency
 * @param userId - ID of the user
 * @param currency - New preferred currency code
 * @throws Error if update fails
 */
export async function updateUserPreferredCurrency(
  userId: string,
  currency: string
): Promise<void> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('user_profiles')
      .update({
        preferred_currency: currency.toUpperCase(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Error updating preferred currency: ${error.message}`);
    }
  } catch (error) {
    throw error;
  }
}
