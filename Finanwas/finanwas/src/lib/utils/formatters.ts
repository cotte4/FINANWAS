/**
 * Formatting utilities for currency, dates, and percentages
 * All formatters use Spanish/Argentina locale
 */

/**
 * Formats a number as currency with Spanish Argentina locale
 * @param amount - The amount to format
 * @param currency - Currency code (default: 'ARS')
 * @returns Formatted currency string
 * @example
 * formatCurrency(1234.56) // "$1.234,56"
 * formatCurrency(1000, 'USD') // "US$1.000,00"
 */
export function formatCurrency(amount: number, currency: string = 'ARS'): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a number as a compact currency (K, M, B abbreviations)
 * @param amount - The amount to format
 * @param currency - Currency code (default: 'ARS')
 * @returns Compact formatted currency string
 * @example
 * formatCompactCurrency(1500) // "$1,5K"
 * formatCompactCurrency(1500000) // "$1,5M"
 */
export function formatCompactCurrency(amount: number, currency: string = 'ARS'): string {
  const formatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  });
  return formatter.format(amount);
}

/**
 * Formats a date to Spanish Argentina locale (dd/MM/yyyy)
 * @param date - Date to format (Date object or ISO string)
 * @returns Formatted date string
 * @example
 * formatDate(new Date('2024-01-15')) // "15/01/2024"
 * formatDate('2024-01-15') // "15/01/2024"
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-AR').format(dateObj);
}

/**
 * Formats a date to long format (e.g., "15 de enero de 2024")
 * @param date - Date to format (Date object or ISO string)
 * @returns Formatted date string in long format
 * @example
 * formatLongDate(new Date('2024-01-15')) // "15 de enero de 2024"
 */
export function formatLongDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

/**
 * Formats a date to relative time (e.g., "hace 2 días")
 * @param date - Date to format (Date object or ISO string)
 * @returns Relative time string
 * @example
 * formatRelativeTime(new Date(Date.now() - 86400000)) // "hace 1 día"
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat('es-AR', { numeric: 'auto' });

  if (diffInSeconds < 60) {
    return 'hace unos segundos';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return rtf.format(-minutes, 'minute');
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return rtf.format(-hours, 'hour');
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return rtf.format(-days, 'day');
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return rtf.format(-months, 'month');
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return rtf.format(-years, 'year');
  }
}

/**
 * Formats a number as a percentage
 * @param value - Decimal value to format (e.g., 0.15 for 15%)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string
 * @example
 * formatPercentage(0.1523) // "15,23%"
 * formatPercentage(0.1523, 1) // "15,2%"
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formats a number with thousands separators (Spanish locale)
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string
 * @example
 * formatNumber(1234567.89) // "1.234.567,89"
 * formatNumber(1234567.89, 0) // "1.234.568"
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
