/**
 * Metric thresholds for color coding in financial analysis
 * Used by traffic light indicator and scorecard components
 */

export interface MetricThreshold {
  /** Value above this threshold is green (or below for inverse metrics) */
  green: number;
  /** Value below this threshold is red (or above for inverse metrics) */
  red: number;
  /** Whether lower values are better (default: false - higher is better) */
  inverse?: boolean;
}

/**
 * Color type for traffic light indicators
 */
export type MetricColor = 'green' | 'yellow' | 'red' | 'gray';

/**
 * Thresholds for common financial metrics
 */
export const METRIC_THRESHOLDS: Record<string, MetricThreshold> = {
  // P/E Ratio: lower is cheaper (inverse)
  peRatio: {
    green: 15,
    red: 25,
    inverse: true,
  },
  // Return on Equity: higher is better
  roe: {
    green: 15,
    red: 8,
  },
  // Debt to Equity: lower is better (inverse)
  debtToEquity: {
    green: 0.5,
    red: 1,
    inverse: true,
  },
  // Dividend Yield: higher is better
  dividendYield: {
    green: 3,
    red: 1,
  },
  // Price to Book: lower is better (inverse)
  pbRatio: {
    green: 1,
    red: 3,
    inverse: true,
  },
  // ROA (Return on Assets): higher is better
  roa: {
    green: 10,
    red: 5,
  },
};

/**
 * Determine the metric color based on value and threshold
 * @param metric - The metric name (e.g., 'peRatio', 'roe')
 * @param value - The numeric value to evaluate
 * @returns The color ('green', 'yellow', 'red', or 'gray' for missing data)
 */
export function getMetricColor(
  metric: string,
  value: number | null | undefined
): MetricColor {
  if (value === null || value === undefined) {
    return 'gray';
  }

  const threshold = METRIC_THRESHOLDS[metric];
  if (!threshold) {
    return 'gray';
  }

  const { green, red, inverse = false } = threshold;

  if (inverse) {
    // Inverse mode: lower is better
    if (value <= green) return 'green';
    if (value >= red) return 'red';
    return 'yellow';
  } else {
    // Normal mode: higher is better
    if (value >= green) return 'green';
    if (value <= red) return 'red';
    return 'yellow';
  }
}

/**
 * Get a human-readable description of what the metric measures
 */
export const METRIC_DESCRIPTIONS: Record<string, string> = {
  peRatio: 'Price-to-Earnings Ratio',
  roe: 'Return on Equity',
  debtToEquity: 'Debt to Equity Ratio',
  dividendYield: 'Dividend Yield',
  pbRatio: 'Price-to-Book Ratio',
  roa: 'Return on Assets',
};

/**
 * Get Spanish description of what the metric measures
 */
export const METRIC_DESCRIPTIONS_ES: Record<string, string> = {
  peRatio: 'Relación Precio-Ganancia',
  roe: 'Rentabilidad sobre el Patrimonio',
  debtToEquity: 'Ratio Deuda-Patrimonio',
  dividendYield: 'Rendimiento de Dividendos',
  pbRatio: 'Relación Precio-Valor Libro',
  roa: 'Rentabilidad sobre Activos',
};

/**
 * Format a metric value for display
 * @param value - The numeric value to format
 * @param metric - The metric name to determine formatting
 * @returns Formatted string for display
 */
export function formatMetric(
  value: number | null | undefined,
  metric: string
): string {
  if (value === null || value === undefined) {
    return 'N/A';
  }

  switch (metric) {
    case 'dividendYield':
      // Format as percentage
      return `${(value * 100).toFixed(2)}%`;
    case 'peRatio':
    case 'pbRatio':
    case 'roe':
    case 'roa':
      // Format with 2 decimal places
      return value.toFixed(2);
    case 'debtToEquity':
      // Format with 2 decimal places
      return value.toFixed(2);
    default:
      return value.toFixed(2);
  }
}
