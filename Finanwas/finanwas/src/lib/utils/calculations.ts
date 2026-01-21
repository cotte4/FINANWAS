/**
 * Financial calculation utilities
 * Used for portfolio analytics, ROI, percentages, etc.
 */

/**
 * Calculates the Return on Investment (ROI) percentage
 * @param currentValue - Current value of the investment
 * @param initialValue - Initial investment value
 * @returns ROI as a decimal (e.g., 0.15 for 15% gain)
 * @example
 * calculateROI(11500, 10000) // 0.15 (15% gain)
 * calculateROI(9000, 10000) // -0.1 (10% loss)
 */
export function calculateROI(currentValue: number, initialValue: number): number {
  if (initialValue === 0) return 0;
  return (currentValue - initialValue) / initialValue;
}

/**
 * Calculates the total portfolio value from an array of assets
 * @param assets - Array of assets with quantity and current_price
 * @returns Total portfolio value
 * @example
 * calculatePortfolioTotal([
 *   { quantity: 10, current_price: 150 },
 *   { quantity: 5, current_price: 200 }
 * ]) // 2500
 */
export function calculatePortfolioTotal(
  assets: Array<{ quantity: number; current_price: number | null; purchase_price: number }>
): number {
  return assets.reduce((total, asset) => {
    const price = asset.current_price ?? asset.purchase_price;
    return total + asset.quantity * price;
  }, 0);
}

/**
 * Calculates the total gain/loss for a portfolio
 * @param assets - Array of assets with quantity, purchase_price, and current_price
 * @returns Object with totalGain and totalGainPercentage
 * @example
 * calculatePortfolioGain([...]) // { totalGain: 500, totalGainPercentage: 0.05 }
 */
export function calculatePortfolioGain(
  assets: Array<{
    quantity: number;
    purchase_price: number;
    current_price: number | null;
  }>
): { totalGain: number; totalGainPercentage: number } {
  let totalCost = 0;
  let totalValue = 0;

  assets.forEach((asset) => {
    const cost = asset.quantity * asset.purchase_price;
    const value = asset.quantity * (asset.current_price ?? asset.purchase_price);
    totalCost += cost;
    totalValue += value;
  });

  const totalGain = totalValue - totalCost;
  const totalGainPercentage = totalCost > 0 ? totalGain / totalCost : 0;

  return { totalGain, totalGainPercentage };
}

/**
 * Calculates gain/loss for a single asset
 * @param quantity - Number of units
 * @param purchasePrice - Price per unit at purchase
 * @param currentPrice - Current price per unit (optional, uses purchasePrice if not provided)
 * @returns Object with gain and gainPercentage
 * @example
 * calculateAssetGain(10, 100, 115) // { gain: 150, gainPercentage: 0.15 }
 */
export function calculateAssetGain(
  quantity: number,
  purchasePrice: number,
  currentPrice?: number | null
): { gain: number; gainPercentage: number } {
  const price = currentPrice ?? purchasePrice;
  const cost = quantity * purchasePrice;
  const value = quantity * price;
  const gain = value - cost;
  const gainPercentage = cost > 0 ? gain / cost : 0;

  return { gain, gainPercentage };
}

/**
 * Calculates the percentage progress towards a goal
 * @param current - Current amount
 * @param target - Target amount
 * @returns Percentage as a decimal (clamped between 0 and 1)
 * @example
 * calculateGoalProgress(7500, 10000) // 0.75 (75%)
 * calculateGoalProgress(12000, 10000) // 1.0 (100%, clamped)
 */
export function calculateGoalProgress(current: number, target: number): number {
  if (target <= 0) return 0;
  const progress = current / target;
  return Math.min(Math.max(progress, 0), 1);
}

/**
 * Calculates the weighted average of values
 * @param values - Array of objects with value and weight
 * @returns Weighted average
 * @example
 * calculateWeightedAverage([
 *   { value: 100, weight: 0.5 },
 *   { value: 200, weight: 0.5 }
 * ]) // 150
 */
export function calculateWeightedAverage(
  values: Array<{ value: number; weight: number }>
): number {
  const totalWeight = values.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight === 0) return 0;

  const weightedSum = values.reduce((sum, item) => sum + item.value * item.weight, 0);
  return weightedSum / totalWeight;
}

/**
 * Calculates the percentage distribution of portfolio assets by type
 * @param assets - Array of assets with type and current value
 * @returns Object mapping asset types to their percentage of total portfolio
 * @example
 * calculateAssetDistribution([
 *   { type: 'Acción', value: 5000 },
 *   { type: 'ETF', value: 3000 },
 *   { type: 'Acción', value: 2000 }
 * ]) // { 'Acción': 0.7, 'ETF': 0.3 }
 */
export function calculateAssetDistribution(
  assets: Array<{ type: string; quantity: number; current_price: number | null; purchase_price: number }>
): Record<string, number> {
  const total = calculatePortfolioTotal(assets);
  if (total === 0) return {};

  const distribution: Record<string, number> = {};

  assets.forEach((asset) => {
    const price = asset.current_price ?? asset.purchase_price;
    const value = asset.quantity * price;
    distribution[asset.type] = (distribution[asset.type] || 0) + value;
  });

  Object.keys(distribution).forEach((type) => {
    distribution[type] = distribution[type] / total;
  });

  return distribution;
}

/**
 * Calculates compound interest
 * @param principal - Initial investment amount
 * @param rate - Annual interest rate as decimal (e.g., 0.05 for 5%)
 * @param years - Number of years
 * @param compoundingFrequency - Times per year interest is compounded (default: 12 for monthly)
 * @returns Final amount after compound interest
 * @example
 * calculateCompoundInterest(10000, 0.05, 5) // 12833.59
 */
export function calculateCompoundInterest(
  principal: number,
  rate: number,
  years: number,
  compoundingFrequency: number = 12
): number {
  return principal * Math.pow(1 + rate / compoundingFrequency, compoundingFrequency * years);
}

/**
 * Rounds a number to a specified number of decimal places
 * @param value - Number to round
 * @param decimals - Number of decimal places (default: 2)
 * @returns Rounded number
 * @example
 * roundToDecimals(3.14159, 2) // 3.14
 */
export function roundToDecimals(value: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}
