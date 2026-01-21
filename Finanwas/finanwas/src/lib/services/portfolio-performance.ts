import { createClient } from '../db/supabase'
import { getPortfolioSummary } from '../db/queries/portfolio'

/**
 * Portfolio performance snapshot interface
 */
export interface PortfolioSnapshot {
  id: string
  user_id: string
  snapshot_date: string
  total_value: number
  total_cost: number
  total_gain_loss: number
  gain_loss_percentage: number
  currency: string
  asset_breakdown: Record<string, {
    count: number
    value: number
    cost: number
  }> | null
  created_at: string
}

/**
 * Interface for chart data point
 */
export interface PerformanceDataPoint {
  date: string
  value: number
  cost: number
  gainLoss: number
  gainLossPercentage: number
}

/**
 * Creates a portfolio performance snapshot for a user
 * Captures current portfolio value, cost, and gain/loss metrics
 *
 * @param userId - User ID
 * @param baseCurrency - Currency for the snapshot (default: 'ARS')
 * @param snapshotDate - Date for the snapshot (default: today)
 * @returns Created snapshot
 * @throws Error if snapshot creation fails
 */
export async function createPortfolioSnapshot(
  userId: string,
  baseCurrency: string = 'ARS',
  snapshotDate?: Date
): Promise<PortfolioSnapshot> {
  try {
    const supabase = createClient()

    // Get current portfolio summary
    const summary = await getPortfolioSummary(userId, baseCurrency)

    // Use provided date or today
    const date = snapshotDate || new Date()
    const dateString = date.toISOString().split('T')[0] // Format: YYYY-MM-DD

    // Prepare asset breakdown from summary
    const assetBreakdown: Record<string, { count: number; value: number; cost: number }> = {}

    for (const [type, data] of Object.entries(summary.assetsByType)) {
      assetBreakdown[type] = {
        count: data.count,
        value: data.currentValue,
        cost: data.invested
      }
    }

    // Insert or update snapshot (upsert)
    const { data, error } = await supabase
      .from('portfolio_performance_snapshots')
      .upsert({
        user_id: userId,
        snapshot_date: dateString,
        total_value: summary.totalCurrentValue,
        total_cost: summary.totalInvested,
        total_gain_loss: summary.totalGainLoss,
        gain_loss_percentage: summary.percentageGainLoss,
        currency: baseCurrency,
        asset_breakdown: assetBreakdown,
      }, {
        onConflict: 'user_id,snapshot_date'
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Error al crear snapshot del portafolio: ${error.message}`)
    }

    return data
  } catch (error) {
    throw error
  }
}

/**
 * Gets all portfolio snapshots for a user within a date range
 *
 * @param userId - User ID
 * @param startDate - Start date (optional)
 * @param endDate - End date (optional)
 * @returns Array of snapshots ordered by date (oldest first)
 * @throws Error if retrieval fails
 */
export async function getPortfolioSnapshots(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<PortfolioSnapshot[]> {
  try {
    const supabase = createClient()

    let query = supabase
      .from('portfolio_performance_snapshots')
      .select('*')
      .eq('user_id', userId)

    if (startDate) {
      const startDateString = startDate.toISOString().split('T')[0]
      query = query.gte('snapshot_date', startDateString)
    }

    if (endDate) {
      const endDateString = endDate.toISOString().split('T')[0]
      query = query.lte('snapshot_date', endDateString)
    }

    const { data, error } = await query.order('snapshot_date', { ascending: true })

    if (error) {
      throw new Error(`Error al obtener snapshots del portafolio: ${error.message}`)
    }

    return data || []
  } catch (error) {
    throw error
  }
}

/**
 * Gets the most recent snapshot for a user
 *
 * @param userId - User ID
 * @returns Most recent snapshot or null if none exist
 * @throws Error if retrieval fails
 */
export async function getLatestSnapshot(userId: string): Promise<PortfolioSnapshot | null> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('portfolio_performance_snapshots')
      .select('*')
      .eq('user_id', userId)
      .order('snapshot_date', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Error al obtener último snapshot: ${error.message}`)
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
 * Converts snapshots to chart-friendly data points
 *
 * @param snapshots - Array of snapshots
 * @returns Array of data points for charting
 */
export function snapshotsToChartData(snapshots: PortfolioSnapshot[]): PerformanceDataPoint[] {
  return snapshots.map(snapshot => ({
    date: snapshot.snapshot_date,
    value: snapshot.total_value,
    cost: snapshot.total_cost,
    gainLoss: snapshot.total_gain_loss,
    gainLossPercentage: snapshot.gain_loss_percentage,
  }))
}

/**
 * Gets performance data for charting within a time period
 *
 * @param userId - User ID
 * @param period - Time period ('1M', '3M', '6M', '1Y', 'ALL')
 * @returns Array of data points for charting
 * @throws Error if retrieval fails
 */
export async function getPerformanceChartData(
  userId: string,
  period: '1M' | '3M' | '6M' | '1Y' | 'ALL' = 'ALL'
): Promise<PerformanceDataPoint[]> {
  try {
    let startDate: Date | undefined
    const today = new Date()

    switch (period) {
      case '1M':
        startDate = new Date(today)
        startDate.setMonth(today.getMonth() - 1)
        break
      case '3M':
        startDate = new Date(today)
        startDate.setMonth(today.getMonth() - 3)
        break
      case '6M':
        startDate = new Date(today)
        startDate.setMonth(today.getMonth() - 6)
        break
      case '1Y':
        startDate = new Date(today)
        startDate.setFullYear(today.getFullYear() - 1)
        break
      case 'ALL':
      default:
        startDate = undefined
    }

    const snapshots = await getPortfolioSnapshots(userId, startDate)
    return snapshotsToChartData(snapshots)
  } catch (error) {
    throw error
  }
}

/**
 * Deletes old snapshots beyond a certain retention period
 *
 * @param userId - User ID
 * @param retentionDays - Number of days to retain (default: 365)
 * @returns Number of snapshots deleted
 * @throws Error if deletion fails
 */
export async function cleanupOldSnapshots(
  userId: string,
  retentionDays: number = 365
): Promise<number> {
  try {
    const supabase = createClient()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)
    const cutoffDateString = cutoffDate.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('portfolio_performance_snapshots')
      .delete()
      .eq('user_id', userId)
      .lt('snapshot_date', cutoffDateString)
      .select()

    if (error) {
      throw new Error(`Error al limpiar snapshots antiguos: ${error.message}`)
    }

    return data?.length || 0
  } catch (error) {
    throw error
  }
}
