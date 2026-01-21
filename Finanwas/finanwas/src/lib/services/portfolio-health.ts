import { PortfolioAsset, UserProfile } from '@/types/database'
import { ASSET_TYPE_SECTORS } from '@/lib/constants/asset-types'

export interface HealthScoreBreakdown {
  diversification: {
    score: number
    details: {
      assetCount: number
      assetCountScore: number
      sectorCount: number
      sectorDiversityScore: number
      assetTypeCount: number
      assetTypeDiversityScore: number
      maxConcentration: number
      concentrationScore: number
    }
  }
  riskManagement: {
    score: number
    details: {
      volatilityScore: number
      riskAlignmentScore: number
      hasRiskProfile: boolean
    }
  }
  performance: {
    score: number
    details: {
      positiveAssetsCount: number
      totalAssetsCount: number
      positiveReturnsRatio: number
      totalReturnPercentage: number
      totalReturnScore: number
      avgDividendYield: number
      dividendYieldScore: number
    }
  }
  bestPractices: {
    score: number
    details: {
      hasEmergencyFund: boolean
      emergencyFundScore: number
      hasRecentActivity: boolean
      contributionScore: number
      diversificationMeetsTarget: boolean
      rebalancingScore: number
    }
  }
}

export interface HealthScoreResult {
  totalScore: number
  rating: string
  color: string
  breakdown: HealthScoreBreakdown
  recommendations: string[]
}

// Asset sectors mapping (simplified - can be extended)
const ASSET_SECTORS: Record<string, string[]> = {
  Technology: ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA', 'AMD', 'INTC', 'CSCO'],
  Finance: ['JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'BLK', 'V', 'MA'],
  Healthcare: ['JNJ', 'UNH', 'PFE', 'ABBV', 'TMO', 'MRK', 'LLY', 'DHR'],
  Consumer: ['AMZN', 'TSLA', 'WMT', 'HD', 'MCD', 'NKE', 'SBUX', 'TGT'],
  Energy: ['XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'PSX', 'VLO'],
  'Real Estate': ['AMT', 'PLD', 'CCI', 'EQIX', 'PSA', 'DLR', 'SPG', 'O'],
  Utilities: ['NEE', 'DUK', 'SO', 'D', 'AEP', 'EXC', 'SRE', 'XEL'],
  Materials: ['LIN', 'APD', 'ECL', 'SHW', 'NEM', 'FCX', 'NUE', 'DD'],
  Industrials: ['BA', 'HON', 'UNP', 'UPS', 'RTX', 'LMT', 'CAT', 'GE'],
  Communications: ['T', 'VZ', 'TMUS', 'DIS', 'CMCSA', 'NFLX', 'CHTR']
}

// Default sectors for asset types without tickers
const DEFAULT_TYPE_SECTORS: Record<string, string> = {
  'Crypto': 'Cryptocurrency',
  'Efectivo': 'Cash',
  'Bono': 'Fixed Income',
  'ON': 'Fixed Income',
  'Plazo Fijo': 'Fixed Income',
  'Fondo Común': 'Mixed',
  'ETF': 'Mixed',
  'Otro': 'Other'
}

/**
 * Get the sector for an asset
 */
function getAssetSector(asset: PortfolioAsset): string {
  // Check if asset has a ticker
  if (asset.ticker) {
    const ticker = asset.ticker.toUpperCase()
    for (const [sector, tickers] of Object.entries(ASSET_SECTORS)) {
      if (tickers.includes(ticker)) {
        return sector
      }
    }
    // If ticker not found in our mapping, use asset type
    return DEFAULT_TYPE_SECTORS[asset.type] || asset.type
  }

  // No ticker, use asset type to determine sector
  return DEFAULT_TYPE_SECTORS[asset.type] || asset.type
}

/**
 * Calculate diversification score (35% weight)
 */
function calculateDiversificationScore(assets: PortfolioAsset[]): HealthScoreBreakdown['diversification'] {
  const assetCount = assets.length

  // 1. Asset Count Score (0-100)
  let assetCountScore = 0
  if (assetCount === 0) {
    assetCountScore = 0
  } else if (assetCount < 3) {
    assetCountScore = 20
  } else if (assetCount < 5) {
    assetCountScore = 40
  } else if (assetCount < 8) {
    assetCountScore = 60
  } else if (assetCount <= 20) {
    assetCountScore = 100
  } else {
    // Penalty for over-diversification (harder to manage)
    assetCountScore = Math.max(80, 100 - (assetCount - 20) * 2)
  }

  // 2. Sector Diversity Score
  const sectors = new Set(assets.map(getAssetSector))
  const sectorCount = sectors.size
  let sectorDiversityScore = 0
  if (sectorCount === 0) {
    sectorDiversityScore = 0
  } else if (sectorCount === 1) {
    sectorDiversityScore = 20
  } else if (sectorCount === 2) {
    sectorDiversityScore = 40
  } else if (sectorCount === 3) {
    sectorDiversityScore = 60
  } else if (sectorCount === 4) {
    sectorDiversityScore = 80
  } else {
    sectorDiversityScore = 100
  }

  // 3. Asset Type Diversity Score
  const assetTypes = new Set(assets.map(a => a.type))
  const assetTypeCount = assetTypes.size
  let assetTypeDiversityScore = 0
  if (assetTypeCount === 0) {
    assetTypeDiversityScore = 0
  } else if (assetTypeCount === 1) {
    assetTypeDiversityScore = 30
  } else if (assetTypeCount === 2) {
    assetTypeDiversityScore = 60
  } else if (assetTypeCount === 3) {
    assetTypeDiversityScore = 80
  } else {
    assetTypeDiversityScore = 100
  }

  // 4. Concentration Risk Score
  let maxConcentration = 0
  let concentrationScore = 100

  if (assets.length > 0) {
    // Calculate total portfolio value
    const totalValue = assets.reduce((sum, asset) => {
      const currentPrice = asset.current_price || asset.purchase_price
      return sum + (asset.quantity * currentPrice)
    }, 0)

    if (totalValue > 0) {
      // Find max concentration
      maxConcentration = Math.max(...assets.map(asset => {
        const currentPrice = asset.current_price || asset.purchase_price
        const assetValue = asset.quantity * currentPrice
        return (assetValue / totalValue) * 100
      }))

      // Score based on max concentration
      if (maxConcentration > 50) {
        concentrationScore = 0
      } else if (maxConcentration > 40) {
        concentrationScore = 30
      } else if (maxConcentration > 30) {
        concentrationScore = 60
      } else if (maxConcentration > 20) {
        concentrationScore = 80
      } else {
        concentrationScore = 100
      }
    }
  }

  // Weighted combination
  const score = (
    (assetCountScore * 0.4) +
    (sectorDiversityScore * 0.3) +
    (assetTypeDiversityScore * 0.2) +
    (concentrationScore * 0.1)
  ) * 0.35 // 35% weight

  return {
    score: Math.round(score),
    details: {
      assetCount,
      assetCountScore,
      sectorCount,
      sectorDiversityScore,
      assetTypeCount,
      assetTypeDiversityScore,
      maxConcentration: Math.round(maxConcentration * 10) / 10,
      concentrationScore
    }
  }
}

/**
 * Calculate risk management score (30% weight)
 */
function calculateRiskScore(
  assets: PortfolioAsset[],
  userProfile: UserProfile | null
): HealthScoreBreakdown['riskManagement'] {

  // 1. Volatility Score (based on asset types)
  // More volatile assets get lower scores for conservative investors
  const volatilityWeights: Record<string, number> = {
    'Efectivo': 0,      // No volatility
    'Plazo Fijo': 0,    // No volatility
    'Bono': 1,          // Low volatility
    'ON': 1,            // Low volatility
    'Fondo Común': 2,   // Low-medium volatility
    'Acción': 3,        // Medium-high volatility
    'ETF': 2,           // Medium volatility
    'CEDEAR': 3,        // Medium-high volatility
    'Crypto': 5,        // Very high volatility
    'Otro': 2           // Unknown, assume medium
  }

  // Calculate average volatility
  let totalValue = 0
  let weightedVolatility = 0

  assets.forEach(asset => {
    const currentPrice = asset.current_price || asset.purchase_price
    const assetValue = asset.quantity * currentPrice
    totalValue += assetValue

    const volatility = volatilityWeights[asset.type] || 2
    weightedVolatility += assetValue * volatility
  })

  const avgVolatility = totalValue > 0 ? weightedVolatility / totalValue : 0

  // Score: lower volatility = higher score
  const volatilityScore = Math.max(0, Math.min(100, 100 - (avgVolatility * 20)))

  // 2. Risk Alignment Score
  let riskAlignmentScore = 50 // Default if no profile
  let hasRiskProfile = false

  if (userProfile?.risk_tolerance) {
    hasRiskProfile = true
    const riskTolerance = userProfile.risk_tolerance

    // Expected volatility ranges for each risk profile
    const expectedVolatility: Record<string, { min: number; max: number }> = {
      'conservador': { min: 0, max: 1.5 },
      'moderado': { min: 1.0, max: 3.0 },
      'agresivo': { min: 2.0, max: 5.0 }
    }

    const expected = expectedVolatility[riskTolerance]
    if (expected) {
      if (avgVolatility >= expected.min && avgVolatility <= expected.max) {
        riskAlignmentScore = 100 // Perfect alignment
      } else if (avgVolatility < expected.min) {
        // Too conservative
        const diff = expected.min - avgVolatility
        riskAlignmentScore = Math.max(60, 100 - (diff * 15))
      } else {
        // Too aggressive
        const diff = avgVolatility - expected.max
        riskAlignmentScore = Math.max(30, 100 - (diff * 20))
      }
    }
  }

  // Weighted combination
  const score = (
    (volatilityScore * 0.5) +
    (riskAlignmentScore * 0.5)
  ) * 0.30 // 30% weight

  return {
    score: Math.round(score),
    details: {
      volatilityScore: Math.round(volatilityScore),
      riskAlignmentScore: Math.round(riskAlignmentScore),
      hasRiskProfile
    }
  }
}

/**
 * Calculate performance score (20% weight)
 */
function calculatePerformanceScore(assets: PortfolioAsset[]): HealthScoreBreakdown['performance'] {
  if (assets.length === 0) {
    return {
      score: 0,
      details: {
        positiveAssetsCount: 0,
        totalAssetsCount: 0,
        positiveReturnsRatio: 0,
        totalReturnPercentage: 0,
        totalReturnScore: 0,
        avgDividendYield: 0,
        dividendYieldScore: 0
      }
    }
  }

  // 1. Positive Returns Ratio
  let positiveAssetsCount = 0
  let totalInvested = 0
  let totalCurrentValue = 0

  assets.forEach(asset => {
    const purchaseValue = asset.quantity * asset.purchase_price
    const currentPrice = asset.current_price || asset.purchase_price
    const currentValue = asset.quantity * currentPrice

    totalInvested += purchaseValue
    totalCurrentValue += currentValue

    if (currentValue > purchaseValue) {
      positiveAssetsCount++
    }
  })

  const positiveReturnsRatio = assets.length > 0 ? (positiveAssetsCount / assets.length) * 100 : 0

  // 2. Total Return Score
  const totalReturnPercentage = totalInvested > 0
    ? ((totalCurrentValue - totalInvested) / totalInvested) * 100
    : 0

  let totalReturnScore = 50 // Neutral at 0% return
  if (totalReturnPercentage >= 20) {
    totalReturnScore = 100
  } else if (totalReturnPercentage >= 10) {
    totalReturnScore = 85
  } else if (totalReturnPercentage >= 5) {
    totalReturnScore = 70
  } else if (totalReturnPercentage >= 0) {
    totalReturnScore = 50 + (totalReturnPercentage * 4) // 0-5% range
  } else if (totalReturnPercentage >= -5) {
    totalReturnScore = 50 + (totalReturnPercentage * 5) // -5-0% range
  } else if (totalReturnPercentage >= -10) {
    totalReturnScore = 25
  } else {
    totalReturnScore = Math.max(0, 25 + (totalReturnPercentage + 10))
  }

  // 3. Dividend Yield Score
  const assetsWithDividends = assets.filter(a => a.dividend_yield && a.dividend_yield > 0)
  const avgDividendYield = assetsWithDividends.length > 0
    ? assetsWithDividends.reduce((sum, a) => sum + (a.dividend_yield || 0), 0) / assetsWithDividends.length
    : 0

  let dividendYieldScore = 0
  if (avgDividendYield >= 5) {
    dividendYieldScore = 100
  } else if (avgDividendYield >= 3) {
    dividendYieldScore = 80
  } else if (avgDividendYield >= 2) {
    dividendYieldScore = 60
  } else if (avgDividendYield >= 1) {
    dividendYieldScore = 40
  } else if (avgDividendYield > 0) {
    dividendYieldScore = 20
  } else {
    dividendYieldScore = 0
  }

  // Weighted combination
  const score = (
    (positiveReturnsRatio * 0.4) +
    (totalReturnScore * 0.3) +
    (dividendYieldScore * 0.3)
  ) * 0.20 // 20% weight

  return {
    score: Math.round(score),
    details: {
      positiveAssetsCount,
      totalAssetsCount: assets.length,
      positiveReturnsRatio: Math.round(positiveReturnsRatio * 10) / 10,
      totalReturnPercentage: Math.round(totalReturnPercentage * 100) / 100,
      totalReturnScore: Math.round(totalReturnScore),
      avgDividendYield: Math.round(avgDividendYield * 100) / 100,
      dividendYieldScore: Math.round(dividendYieldScore)
    }
  }
}

/**
 * Calculate best practices score (15% weight)
 */
function calculateBestPracticesScore(
  assets: PortfolioAsset[],
  userProfile: UserProfile | null
): HealthScoreBreakdown['bestPractices'] {

  // 1. Emergency Fund Score
  const hasEmergencyFund = assets.some(a => a.type === 'Efectivo' && a.quantity > 0) ||
    (userProfile?.has_emergency_fund ?? false)
  const emergencyFundScore = hasEmergencyFund ? 100 : 0

  // 2. Recent Activity Score (check if assets were updated recently)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const hasRecentActivity = assets.some(asset => {
    const updatedAt = new Date(asset.updated_at)
    return updatedAt >= thirtyDaysAgo
  })
  const contributionScore = hasRecentActivity ? 100 : 50

  // 3. Rebalancing Score (simplified - checks if portfolio is reasonably balanced)
  let diversificationMeetsTarget = true
  let rebalancingScore = 100

  if (assets.length > 0) {
    const totalValue = assets.reduce((sum, asset) => {
      const currentPrice = asset.current_price || asset.purchase_price
      return sum + (asset.quantity * currentPrice)
    }, 0)

    // Check if any single asset is > 40% of portfolio
    const maxAllocation = Math.max(...assets.map(asset => {
      const currentPrice = asset.current_price || asset.purchase_price
      const assetValue = asset.quantity * currentPrice
      return (assetValue / totalValue) * 100
    }))

    if (maxAllocation > 40) {
      diversificationMeetsTarget = false
      rebalancingScore = 50
    } else if (maxAllocation > 30) {
      diversificationMeetsTarget = false
      rebalancingScore = 75
    }
  }

  // Weighted combination
  const score = (
    (emergencyFundScore * 0.4) +
    (contributionScore * 0.3) +
    (rebalancingScore * 0.3)
  ) * 0.15 // 15% weight

  return {
    score: Math.round(score),
    details: {
      hasEmergencyFund,
      emergencyFundScore,
      hasRecentActivity,
      contributionScore,
      diversificationMeetsTarget,
      rebalancingScore
    }
  }
}

/**
 * Generate personalized recommendations based on score breakdown
 */
function generateRecommendations(breakdown: HealthScoreBreakdown): string[] {
  const recommendations: string[] = []

  // Diversification recommendations
  if (breakdown.diversification.details.assetCount < 5) {
    recommendations.push('Considera agregar más activos a tu portafolio. Un mínimo de 5-10 activos ayuda a reducir el riesgo.')
  }

  if (breakdown.diversification.details.maxConcentration > 30) {
    recommendations.push(`Tu activo más grande representa ${breakdown.diversification.details.maxConcentration}% del portafolio. Considera rebalancear para reducir la concentración.`)
  }

  if (breakdown.diversification.details.sectorCount < 3) {
    recommendations.push('Diversifica en más sectores para reducir el riesgo sectorial. Apunta a 3-5 sectores diferentes.')
  }

  if (breakdown.diversification.details.assetTypeCount < 2) {
    recommendations.push('Considera diversificar en diferentes tipos de activos (acciones, ETFs, bonos) para mejor balance.')
  }

  // Risk management recommendations
  if (!breakdown.riskManagement.details.hasRiskProfile) {
    recommendations.push('Completa tu perfil de inversor para recibir recomendaciones personalizadas sobre riesgo.')
  }

  if (breakdown.riskManagement.details.riskAlignmentScore < 70) {
    recommendations.push('Tu portafolio puede no estar alineado con tu tolerancia al riesgo. Revisa tus inversiones.')
  }

  // Performance recommendations
  if (breakdown.performance.details.positiveReturnsRatio < 50) {
    recommendations.push('Más del 50% de tus activos están en pérdida. Considera revisar tu estrategia de inversión.')
  }

  if (breakdown.performance.details.totalReturnPercentage < 0) {
    recommendations.push('Tu portafolio tiene retornos negativos. Evalúa si tus inversiones actuales siguen siendo apropiadas.')
  }

  if (breakdown.performance.details.avgDividendYield === 0 && breakdown.performance.details.totalAssetsCount > 0) {
    recommendations.push('Considera añadir activos que generen ingresos pasivos a través de dividendos.')
  }

  // Best practices recommendations
  if (!breakdown.bestPractices.details.hasEmergencyFund) {
    recommendations.push('Establece un fondo de emergencia antes de invertir agresivamente. Se recomienda 3-6 meses de gastos.')
  }

  if (!breakdown.bestPractices.details.hasRecentActivity) {
    recommendations.push('No has actualizado tu portafolio recientemente. Considera revisar y ajustar tus inversiones regularmente.')
  }

  if (!breakdown.bestPractices.details.diversificationMeetsTarget) {
    recommendations.push('Rebalancea tu portafolio para mantener una mejor distribución de activos.')
  }

  // If no specific recommendations, add a general positive message
  if (recommendations.length === 0) {
    recommendations.push('¡Excelente! Tu portafolio está bien diversificado y balanceado. Continúa monitoreando regularmente.')
  }

  // Limit to top 5 recommendations
  return recommendations.slice(0, 5)
}

/**
 * Get rating and color based on score
 */
function getRatingAndColor(score: number): { rating: string; color: string } {
  if (score >= 90) {
    return { rating: 'Excelente', color: 'green' }
  } else if (score >= 75) {
    return { rating: 'Muy Bueno', color: 'lightgreen' }
  } else if (score >= 60) {
    return { rating: 'Bueno', color: 'yellow' }
  } else if (score >= 40) {
    return { rating: 'Regular', color: 'orange' }
  } else {
    return { rating: 'Necesita Mejoras', color: 'red' }
  }
}

/**
 * Main function: Calculate portfolio health score
 */
export function calculatePortfolioHealthScore(
  assets: PortfolioAsset[],
  userProfile: UserProfile | null = null
): HealthScoreResult {

  // Calculate each component
  const diversification = calculateDiversificationScore(assets)
  const riskManagement = calculateRiskScore(assets, userProfile)
  const performance = calculatePerformanceScore(assets)
  const bestPractices = calculateBestPracticesScore(assets, userProfile)

  // Calculate total score
  const totalScore = Math.round(
    diversification.score +
    riskManagement.score +
    performance.score +
    bestPractices.score
  )

  // Get rating and color
  const { rating, color } = getRatingAndColor(totalScore)

  // Create breakdown
  const breakdown: HealthScoreBreakdown = {
    diversification,
    riskManagement,
    performance,
    bestPractices
  }

  // Generate recommendations
  const recommendations = generateRecommendations(breakdown)

  return {
    totalScore,
    rating,
    color,
    breakdown,
    recommendations
  }
}
