/**
 * Currency options for financial operations
 * Used in portfolio assets, savings goals, and other financial features
 */

export const CURRENCY_OPTIONS = [
  { value: 'ARS', label: 'Peso Argentino (ARS)', symbol: '$' },
  { value: 'USD', label: 'Dólar Estadounidense (USD)', symbol: 'US$' },
  { value: 'EUR', label: 'Euro (EUR)', symbol: '€' },
  { value: 'BRL', label: 'Real Brasileño (BRL)', symbol: 'R$' },
  { value: 'GBP', label: 'Libra Esterlina (GBP)', symbol: '£' },
  { value: 'JPY', label: 'Yen Japonés (JPY)', symbol: '¥' },
  { value: 'CAD', label: 'Dólar Canadiense (CAD)', symbol: 'CA$' },
  { value: 'CHF', label: 'Franco Suizo (CHF)', symbol: 'CHF' },
  { value: 'CNY', label: 'Yuan Chino (CNY)', symbol: '¥' },
  { value: 'MXN', label: 'Peso Mexicano (MXN)', symbol: 'MX$' },
] as const;

/**
 * Type-safe currency code values
 */
export type CurrencyCode = (typeof CURRENCY_OPTIONS)[number]['value'];

/**
 * Helper function to get currency symbol from code
 * @param code - Currency code (e.g., 'ARS', 'USD')
 * @returns Currency symbol or the code if not found
 * @example
 * getCurrencySymbol('ARS') // '$'
 * getCurrencySymbol('USD') // 'US$'
 */
export function getCurrencySymbol(code: string): string {
  const currency = CURRENCY_OPTIONS.find((curr) => curr.value === code);
  return currency?.symbol || code;
}

/**
 * Helper function to get currency label from code
 * @param code - Currency code (e.g., 'ARS', 'USD')
 * @returns Currency label or the code if not found
 * @example
 * getCurrencyLabel('ARS') // 'Peso Argentino (ARS)'
 */
export function getCurrencyLabel(code: string): string {
  const currency = CURRENCY_OPTIONS.find((curr) => curr.value === code);
  return currency?.label || code;
}

/**
 * Default currency for the application (Argentina)
 */
export const DEFAULT_CURRENCY: CurrencyCode = 'ARS';

/**
 * Most commonly used currencies
 */
export const POPULAR_CURRENCIES: CurrencyCode[] = ['ARS', 'USD', 'EUR'];
