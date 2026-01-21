import { createClient } from '../supabase'
import type { DividendPayment, Database } from '@/types/database'

/**
 * Interface for dividend summary statistics
 */
export interface DividendSummary {
  totalDividends: number
  totalDividendsYTD: number
  totalDividendsLastYear: number
  totalWithholdingTax: number
  averageDividendPerPayment: number
  currency: string
  dividendsByAsset: Record<string, {
    assetName: string
    ticker: string | null
    totalAmount: number
    paymentCount: number
    lastPaymentDate: string | null
  }>
  dividendsByMonth: Record<string, number>
  totalReinvested: number
}

/**
 * Gets all dividend payments for a user
 *
 * @param userId - User ID
 * @returns Array of dividend payments ordered by date (newest first)
 */
export async function getUserDividends(userId: string): Promise<DividendPayment[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('dividend_payments')
      .select('*')
      .eq('user_id', userId)
      .order('payment_date', { ascending: false })

    if (error) {
      throw new Error(`Error fetching dividend payments: ${error.message}`)
    }

    return data || []
  } catch (error) {
    throw error
  }
}

/**
 * Gets dividend payments for a specific asset
 *
 * @param assetId - Asset ID
 * @param userId - User ID (for security)
 * @returns Array of dividend payments for the asset
 */
export async function getAssetDividends(assetId: string, userId: string): Promise<DividendPayment[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('dividend_payments')
      .select('*')
      .eq('asset_id', assetId)
      .eq('user_id', userId)
      .order('payment_date', { ascending: false })

    if (error) {
      throw new Error(`Error fetching asset dividends: ${error.message}`)
    }

    return data || []
  } catch (error) {
    throw error
  }
}

/**
 * Gets a specific dividend payment by ID
 *
 * @param id - Dividend payment ID
 * @param userId - User ID (for security)
 * @returns Dividend payment or null if not found
 */
export async function getDividendById(id: string, userId: string): Promise<DividendPayment | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('dividend_payments')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Error fetching dividend: ${error.message}`)
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
 * Creates a new dividend payment record
 *
 * @param userId - User ID
 * @param data - Dividend payment data
 * @returns Created dividend payment
 */
export async function createDividend(
  userId: string,
  data: Omit<Database['public']['Tables']['dividend_payments']['Insert'], 'user_id'>
): Promise<DividendPayment> {
  try {
    const supabase = createClient()
    const { data: dividend, error } = await supabase
      .from('dividend_payments')
      .insert({
        user_id: userId,
        ...data,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Error creating dividend payment: ${error.message}`)
    }

    return dividend
  } catch (error) {
    throw error
  }
}

/**
 * Updates an existing dividend payment
 *
 * @param id - Dividend payment ID
 * @param userId - User ID (for security)
 * @param data - Data to update
 * @returns Updated dividend payment
 */
export async function updateDividend(
  id: string,
  userId: string,
  data: Database['public']['Tables']['dividend_payments']['Update']
): Promise<DividendPayment> {
  try {
    const supabase = createClient()
    const { data: dividend, error } = await supabase
      .from('dividend_payments')
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
        throw new Error('Dividend payment not found or you do not have permission')
      }
      throw new Error(`Error updating dividend payment: ${error.message}`)
    }

    return dividend
  } catch (error) {
    throw error
  }
}

/**
 * Deletes a dividend payment
 *
 * @param id - Dividend payment ID
 * @param userId - User ID (for security)
 */
export async function deleteDividend(id: string, userId: string): Promise<void> {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from('dividend_payments')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Error deleting dividend payment: ${error.message}`)
    }
  } catch (error) {
    throw error
  }
}

/**
 * Calculates dividend summary for a user
 *
 * @param userId - User ID
 * @param baseCurrency - Base currency for summary (optional, default 'USD')
 * @returns Dividend summary with statistics
 */
export async function getDividendSummary(
  userId: string,
  baseCurrency: string = 'USD'
): Promise<DividendSummary> {
  try {
    const dividends = await getUserDividends(userId)

    if (dividends.length === 0) {
      return {
        totalDividends: 0,
        totalDividendsYTD: 0,
        totalDividendsLastYear: 0,
        totalWithholdingTax: 0,
        averageDividendPerPayment: 0,
        currency: baseCurrency,
        dividendsByAsset: {},
        dividendsByMonth: {},
        totalReinvested: 0,
      }
    }

    // Get all unique asset IDs
    const assetIds = [...new Set(dividends.map(d => d.asset_id))]

    // Fetch asset details for mapping
    const supabase = createClient()
    const { data: assets } = await supabase
      .from('portfolio_assets')
      .select('id, name, ticker')
      .in('id', assetIds)

    const assetMap = new Map(assets?.map(a => [a.id, a]) || [])

    // Current year start
    const currentYear = new Date().getFullYear()
    const yearStart = new Date(currentYear, 0, 1)
    const lastYearStart = new Date(currentYear - 1, 0, 1)
    const lastYearEnd = new Date(currentYear - 1, 11, 31)

    let totalDividends = 0
    let totalDividendsYTD = 0
    let totalDividendsLastYear = 0
    let totalWithholdingTax = 0
    let totalReinvested = 0

    const dividendsByAsset: Record<string, {
      assetName: string
      ticker: string | null
      totalAmount: number
      paymentCount: number
      lastPaymentDate: string | null
    }> = {}

    const dividendsByMonth: Record<string, number> = {}

    // Process dividends
    // Note: For simplicity, assuming all dividends are in the same currency
    // In a production system, you'd want to convert to baseCurrency using exchange rates
    for (const dividend of dividends) {
      const paymentDate = new Date(dividend.payment_date)

      // Total dividends
      totalDividends += dividend.total_amount
      totalWithholdingTax += dividend.withholding_tax

      if (dividend.reinvested) {
        totalReinvested += dividend.total_amount
      }

      // Year-to-date
      if (paymentDate >= yearStart) {
        totalDividendsYTD += dividend.total_amount
      }

      // Last year
      if (paymentDate >= lastYearStart && paymentDate <= lastYearEnd) {
        totalDividendsLastYear += dividend.total_amount
      }

      // By asset
      const asset = assetMap.get(dividend.asset_id)
      if (asset) {
        if (!dividendsByAsset[dividend.asset_id]) {
          dividendsByAsset[dividend.asset_id] = {
            assetName: asset.name,
            ticker: asset.ticker,
            totalAmount: 0,
            paymentCount: 0,
            lastPaymentDate: null,
          }
        }
        dividendsByAsset[dividend.asset_id].totalAmount += dividend.total_amount
        dividendsByAsset[dividend.asset_id].paymentCount++

        if (!dividendsByAsset[dividend.asset_id].lastPaymentDate ||
            dividend.payment_date > dividendsByAsset[dividend.asset_id].lastPaymentDate!) {
          dividendsByAsset[dividend.asset_id].lastPaymentDate = dividend.payment_date
        }
      }

      // By month (for last 12 months)
      const monthKey = paymentDate.toISOString().slice(0, 7) // YYYY-MM
      if (!dividendsByMonth[monthKey]) {
        dividendsByMonth[monthKey] = 0
      }
      dividendsByMonth[monthKey] += dividend.total_amount
    }

    const averageDividendPerPayment = totalDividends / dividends.length

    return {
      totalDividends,
      totalDividendsYTD,
      totalDividendsLastYear,
      totalWithholdingTax,
      averageDividendPerPayment,
      currency: baseCurrency,
      dividendsByAsset,
      dividendsByMonth,
      totalReinvested,
    }
  } catch (error) {
    throw error
  }
}

/**
 * Gets total dividend income for a date range
 *
 * @param userId - User ID
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Total dividend income in the period
 */
export async function getDividendIncomeForPeriod(
  userId: string,
  startDate: string,
  endDate: string
): Promise<number> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('dividend_payments')
      .select('total_amount')
      .eq('user_id', userId)
      .gte('payment_date', startDate)
      .lte('payment_date', endDate)

    if (error) {
      throw new Error(`Error fetching dividend income: ${error.message}`)
    }

    if (!data || data.length === 0) {
      return 0
    }

    return data.reduce((sum, d) => sum + d.total_amount, 0)
  } catch (error) {
    throw error
  }
}
