import { createClient } from '../supabase'
import type { PortfolioAsset, Database } from '@/types/database'
import { convertMultipleCurrencies } from '@/lib/services/exchange-rates'

/**
 * Interfaz para resumen del portafolio
 */
export interface PortfolioSummary {
  totalAssets: number
  totalInvested: number
  totalCurrentValue: number
  totalGainLoss: number
  percentageGainLoss: number
  currency: string // Base currency for the summary
  assetsByType: Record<string, {
    count: number
    invested: number
    currentValue: number
  }>
  lastUpdated: string | null
}

/**
 * Interfaz para actualización masiva de precios
 */
export interface PriceUpdate {
  id: string
  currentPrice: number
  priceSource?: string
}

/**
 * Obtiene todos los activos del portafolio de un usuario
 *
 * @example
 * const assets = await getUserAssets('550e8400-e29b-41d4-a716-446655440000')
 * console.log(`Activos en portafolio: ${assets.length}`)
 *
 * @param userId - ID del usuario
 * @returns Array de activos del portafolio
 * @throws Error si hay un problema con la base de datos
 */
export async function getUserAssets(userId: string): Promise<PortfolioAsset[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('portfolio_assets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Error al obtener activos del portafolio: ${error.message}`)
    }

    return data || []
  } catch (error) {
    throw error
  }
}

/**
 * Obtiene un activo específico por ID, verificando que pertenezca al usuario
 *
 * @example
 * const asset = await getAssetById('asset-id', 'user-id')
 * if (asset) {
 *   console.log(`Activo: ${asset.name}`)
 * }
 *
 * @param id - ID del activo
 * @param userId - ID del usuario dueño
 * @returns Activo encontrado o null si no existe o no pertenece al usuario
 * @throws Error si hay un problema con la base de datos
 */
export async function getAssetById(id: string, userId: string): Promise<PortfolioAsset | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('portfolio_assets')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Error al obtener activo: ${error.message}`)
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
 * Crea un nuevo activo en el portafolio
 *
 * @example
 * const asset = await createAsset('user-id', {
 *   type: 'stock',
 *   ticker: 'AAPL',
 *   name: 'Apple Inc.',
 *   quantity: 10,
 *   purchase_price: 150,
 *   purchase_date: '2024-01-15',
 *   currency: 'USD'
 * })
 *
 * @param userId - ID del usuario
 * @param data - Datos del activo (sin user_id)
 * @returns Activo creado
 * @throws Error si hay un problema al crear el activo
 */
export async function createAsset(
  userId: string,
  data: Omit<Database['public']['Tables']['portfolio_assets']['Insert'], 'user_id'>
): Promise<PortfolioAsset> {
  try {
    const supabase = createClient()
    const { data: asset, error } = await supabase
      .from('portfolio_assets')
      .insert({
        user_id: userId,
        ...data,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Error al crear activo: ${error.message}`)
    }

    return asset
  } catch (error) {
    throw error
  }
}

/**
 * Actualiza un activo existente, verificando que pertenezca al usuario
 *
 * @example
 * const updated = await updateAsset('asset-id', 'user-id', {
 *   quantity: 15,
 *   notes: 'Compré 5 acciones más'
 * })
 *
 * @param id - ID del activo
 * @param userId - ID del usuario dueño
 * @param data - Datos a actualizar
 * @returns Activo actualizado
 * @throws Error si el activo no existe, no pertenece al usuario o hay un problema al actualizar
 */
export async function updateAsset(
  id: string,
  userId: string,
  data: Database['public']['Tables']['portfolio_assets']['Update']
): Promise<PortfolioAsset> {
  try {
    const supabase = createClient()
    const { data: asset, error } = await supabase
      .from('portfolio_assets')
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
        throw new Error('Activo no encontrado o no tienes permiso para editarlo')
      }
      throw new Error(`Error al actualizar activo: ${error.message}`)
    }

    return asset
  } catch (error) {
    throw error
  }
}

/**
 * Elimina un activo del portafolio, verificando que pertenezca al usuario
 *
 * @example
 * await deleteAsset('asset-id', 'user-id')
 *
 * @param id - ID del activo
 * @param userId - ID del usuario dueño
 * @throws Error si el activo no existe, no pertenece al usuario o hay un problema al eliminar
 */
export async function deleteAsset(id: string, userId: string): Promise<void> {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from('portfolio_assets')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Error al eliminar activo: ${error.message}`)
    }
  } catch (error) {
    throw error
  }
}

/**
 * Actualiza el precio actual de un activo
 *
 * @example
 * await updateAssetPrice('asset-id', 175.50)
 *
 * @param id - ID del activo
 * @param price - Nuevo precio actual
 * @param priceSource - Fuente del precio (opcional, por defecto 'manual')
 * @returns Activo actualizado
 * @throws Error si hay un problema al actualizar
 */
export async function updateAssetPrice(
  id: string,
  price: number,
  priceSource: string = 'manual'
): Promise<PortfolioAsset> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('portfolio_assets')
      .update({
        current_price: price,
        current_price_updated_at: new Date().toISOString(),
        price_source: priceSource,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Error al actualizar precio del activo: ${error.message}`)
    }

    return data
  } catch (error) {
    throw error
  }
}

/**
 * Actualiza los precios de múltiples activos de forma masiva
 *
 * @example
 * await bulkUpdatePrices([
 *   { id: 'asset-1', currentPrice: 150.50, priceSource: 'api' },
 *   { id: 'asset-2', currentPrice: 2500.00, priceSource: 'api' }
 * ])
 *
 * @param updates - Array de actualizaciones de precios
 * @returns Cantidad de activos actualizados
 * @throws Error si hay un problema al actualizar
 */
export async function bulkUpdatePrices(updates: PriceUpdate[]): Promise<number> {
  try {
    const supabase = createClient()
    let updatedCount = 0

    // Supabase no tiene soporte nativo para bulk updates eficientes,
    // así que hacemos las actualizaciones en paralelo
    const updatePromises = updates.map(update =>
      updateAssetPrice(update.id, update.currentPrice, update.priceSource)
    )

    const results = await Promise.allSettled(updatePromises)
    updatedCount = results.filter(r => r.status === 'fulfilled').length

    return updatedCount
  } catch (error) {
    throw error
  }
}

/**
 * Calcula el resumen del portafolio de un usuario
 * Convierte todos los valores a la moneda preferida del usuario
 *
 * @example
 * const summary = await getPortfolioSummary('user-id', 'USD')
 * console.log(`Valor total: $${summary.totalCurrentValue} ${summary.currency}`)
 * console.log(`Ganancia/Pérdida: ${summary.percentageGainLoss}%`)
 *
 * @param userId - ID del usuario
 * @param baseCurrency - Moneda base para el resumen (opcional, default 'USD')
 * @returns Resumen del portafolio con totales y estadísticas en la moneda base
 * @throws Error si hay un problema con la base de datos
 */
export async function getPortfolioSummary(userId: string, baseCurrency: string = 'USD'): Promise<PortfolioSummary> {
  try {
    const assets = await getUserAssets(userId)

    if (assets.length === 0) {
      return {
        totalAssets: 0,
        totalInvested: 0,
        totalCurrentValue: 0,
        totalGainLoss: 0,
        percentageGainLoss: 0,
        currency: baseCurrency,
        assetsByType: {},
        lastUpdated: null,
      }
    }

    // Prepare amounts for conversion
    const investedAmounts = assets.map(asset => ({
      amount: asset.quantity * asset.purchase_price,
      currency: asset.currency,
    }))

    const currentValueAmounts = assets.map(asset => ({
      amount: asset.quantity * (asset.current_price || asset.purchase_price),
      currency: asset.currency,
    }))

    // Convert all amounts to base currency
    const totalInvested = await convertMultipleCurrencies(investedAmounts, baseCurrency)
    const totalCurrentValue = await convertMultipleCurrencies(currentValueAmounts, baseCurrency)

    // Calculate assets by type (also converted to base currency)
    const assetsByType: Record<string, { count: number; invested: number; currentValue: number }> = {}
    let lastUpdated: string | null = null

    for (const asset of assets) {
      const invested = asset.quantity * asset.purchase_price
      const currentValue = asset.quantity * (asset.current_price || asset.purchase_price)

      // Convert to base currency
      const { convertCurrency } = await import('@/lib/services/exchange-rates')
      const investedConverted = await convertCurrency(invested, asset.currency, baseCurrency)
      const currentValueConverted = await convertCurrency(currentValue, asset.currency, baseCurrency)

      // Agrupar por tipo
      if (!assetsByType[asset.type]) {
        assetsByType[asset.type] = {
          count: 0,
          invested: 0,
          currentValue: 0,
        }
      }
      assetsByType[asset.type].count++
      assetsByType[asset.type].invested += investedConverted
      assetsByType[asset.type].currentValue += currentValueConverted

      // Actualizar última fecha de actualización de precio
      if (asset.current_price_updated_at) {
        if (!lastUpdated || asset.current_price_updated_at > lastUpdated) {
          lastUpdated = asset.current_price_updated_at
        }
      }
    }

    const totalGainLoss = totalCurrentValue - totalInvested
    const percentageGainLoss = totalInvested > 0
      ? (totalGainLoss / totalInvested) * 100
      : 0

    return {
      totalAssets: assets.length,
      totalInvested,
      totalCurrentValue,
      totalGainLoss,
      percentageGainLoss,
      currency: baseCurrency,
      assetsByType,
      lastUpdated,
    }
  } catch (error) {
    throw error
  }
}
