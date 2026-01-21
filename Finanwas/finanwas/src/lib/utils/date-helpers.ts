/**
 * Date manipulation and helper utilities
 */

/**
 * Adds days to a date
 * @param date - Starting date (Date object or ISO string)
 * @param days - Number of days to add (can be negative)
 * @returns New date with days added
 * @example
 * addDays(new Date('2024-01-15'), 7) // Date object for 2024-01-22
 * addDays('2024-01-15', -3) // Date object for 2024-01-12
 */
export function addDays(date: Date | string, days: number): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  dateObj.setDate(dateObj.getDate() + days);
  return dateObj;
}

/**
 * Adds months to a date
 * @param date - Starting date (Date object or ISO string)
 * @param months - Number of months to add (can be negative)
 * @returns New date with months added
 * @example
 * addMonths(new Date('2024-01-15'), 3) // Date object for 2024-04-15
 */
export function addMonths(date: Date | string, months: number): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  dateObj.setMonth(dateObj.getMonth() + months);
  return dateObj;
}

/**
 * Adds years to a date
 * @param date - Starting date (Date object or ISO string)
 * @param years - Number of years to add (can be negative)
 * @returns New date with years added
 * @example
 * addYears(new Date('2024-01-15'), 2) // Date object for 2026-01-15
 */
export function addYears(date: Date | string, years: number): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  dateObj.setFullYear(dateObj.getFullYear() + years);
  return dateObj;
}

/**
 * Gets the difference in days between two dates
 * @param date1 - First date (Date object or ISO string)
 * @param date2 - Second date (Date object or ISO string)
 * @returns Number of days between dates (positive if date2 is later)
 * @example
 * getDaysDifference('2024-01-15', '2024-01-20') // 5
 * getDaysDifference('2024-01-20', '2024-01-15') // -5
 */
export function getDaysDifference(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  const diffTime = d2.getTime() - d1.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Gets the difference in months between two dates
 * @param date1 - First date (Date object or ISO string)
 * @param date2 - Second date (Date object or ISO string)
 * @returns Number of months between dates
 * @example
 * getMonthsDifference('2024-01-15', '2024-04-15') // 3
 */
export function getMonthsDifference(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  return (
    (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth())
  );
}

/**
 * Gets the start of day (00:00:00.000)
 * @param date - Date to process (Date object or ISO string)
 * @returns New date set to start of day
 * @example
 * getStartOfDay(new Date('2024-01-15T14:30:00')) // 2024-01-15T00:00:00.000
 */
export function getStartOfDay(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  dateObj.setHours(0, 0, 0, 0);
  return dateObj;
}

/**
 * Gets the end of day (23:59:59.999)
 * @param date - Date to process (Date object or ISO string)
 * @returns New date set to end of day
 * @example
 * getEndOfDay(new Date('2024-01-15T14:30:00')) // 2024-01-15T23:59:59.999
 */
export function getEndOfDay(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  dateObj.setHours(23, 59, 59, 999);
  return dateObj;
}

/**
 * Gets the start of month (first day at 00:00:00.000)
 * @param date - Date to process (Date object or ISO string)
 * @returns New date set to start of month
 * @example
 * getStartOfMonth(new Date('2024-01-15')) // 2024-01-01T00:00:00.000
 */
export function getStartOfMonth(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  return new Date(dateObj.getFullYear(), dateObj.getMonth(), 1, 0, 0, 0, 0);
}

/**
 * Gets the end of month (last day at 23:59:59.999)
 * @param date - Date to process (Date object or ISO string)
 * @returns New date set to end of month
 * @example
 * getEndOfMonth(new Date('2024-01-15')) // 2024-01-31T23:59:59.999
 */
export function getEndOfMonth(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  return new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0, 23, 59, 59, 999);
}

/**
 * Checks if two dates are on the same day
 * @param date1 - First date (Date object or ISO string)
 * @param date2 - Second date (Date object or ISO string)
 * @returns True if dates are on the same day
 * @example
 * isSameDay('2024-01-15T10:00', '2024-01-15T20:00') // true
 * isSameDay('2024-01-15', '2024-01-16') // false
 */
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
}

/**
 * Checks if a date is today
 * @param date - Date to check (Date object or ISO string)
 * @returns True if date is today
 * @example
 * isToday(new Date()) // true
 */
export function isToday(date: Date | string): boolean {
  return isSameDay(date, new Date());
}

/**
 * Formats a date to ISO string (YYYY-MM-DD) for database storage
 * @param date - Date to format (Date object or ISO string)
 * @returns ISO date string (YYYY-MM-DD)
 * @example
 * toISODate(new Date('2024-01-15T14:30:00')) // '2024-01-15'
 */
export function toISODate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString().split('T')[0];
}

/**
 * Parses a date string in various formats
 * @param dateStr - Date string to parse
 * @returns Date object or null if invalid
 * @example
 * parseDate('2024-01-15') // Date object
 * parseDate('15/01/2024') // Date object
 * parseDate('invalid') // null
 */
export function parseDate(dateStr: string): Date | null {
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Gets the name of the day in Spanish
 * @param date - Date to get day name from
 * @returns Day name in Spanish
 * @example
 * getDayName(new Date('2024-01-15')) // 'lunes' (if Monday)
 */
export function getDayName(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-AR', { weekday: 'long' }).format(dateObj);
}

/**
 * Gets the name of the month in Spanish
 * @param date - Date to get month name from
 * @returns Month name in Spanish
 * @example
 * getMonthName(new Date('2024-01-15')) // 'enero'
 */
export function getMonthName(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-AR', { month: 'long' }).format(dateObj);
}
