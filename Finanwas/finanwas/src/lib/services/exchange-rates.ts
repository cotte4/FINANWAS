/**
 * Exchange Rate Service
 * Fetches and caches exchange rates for currency conversion
 * Uses exchangerate-api.com (free tier, no API key required for basic usage)
 */

import type { CurrencyCode } from '@/lib/constants/currency-options';

interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
}

// In-memory cache for exchange rates (1 hour)
let ratesCache: ExchangeRates | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Fetches exchange rates from the API
 * Base currency is USD (most APIs use USD as base for free tier)
 * @returns Exchange rates object with USD as base
 */
async function fetchExchangeRates(): Promise<ExchangeRates> {
  try {
    // Using exchangerate-api.com free tier (no API key required)
    // Supports 1500 requests/month for free
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');

    if (!response.ok) {
      throw new Error(`Exchange rate API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      base: 'USD',
      rates: data.rates,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    throw new Error('Failed to fetch exchange rates');
  }
}

/**
 * Gets current exchange rates (from cache or API)
 * @returns Exchange rates object
 */
export async function getExchangeRates(): Promise<ExchangeRates> {
  // Check if cache is valid
  if (ratesCache && Date.now() - ratesCache.timestamp < CACHE_DURATION) {
    return ratesCache;
  }

  // Fetch fresh rates
  const rates = await fetchExchangeRates();
  ratesCache = rates;
  return rates;
}

/**
 * Converts an amount from one currency to another
 * @param amount - Amount to convert
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @returns Converted amount
 *
 * @example
 * const usdAmount = await convertCurrency(100, 'ARS', 'USD')
 * console.log(`100 ARS = ${usdAmount} USD`)
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  // If same currency, no conversion needed
  if (fromCurrency === toCurrency) {
    return amount;
  }

  try {
    const rates = await getExchangeRates();

    // Convert from source currency to USD first (base currency)
    const amountInUSD = fromCurrency === 'USD'
      ? amount
      : amount / (rates.rates[fromCurrency] || 1);

    // Convert from USD to target currency
    const convertedAmount = toCurrency === 'USD'
      ? amountInUSD
      : amountInUSD * (rates.rates[toCurrency] || 1);

    return convertedAmount;
  } catch (error) {
    console.error('Currency conversion error:', error);
    // If conversion fails, return original amount
    // This prevents the app from breaking if exchange rate API is down
    return amount;
  }
}

/**
 * Converts multiple amounts from different currencies to a single target currency
 * Useful for portfolio aggregation
 *
 * @param amounts - Array of {amount, currency} objects
 * @param toCurrency - Target currency code
 * @returns Total amount in target currency
 *
 * @example
 * const total = await convertMultipleCurrencies([
 *   { amount: 100, currency: 'USD' },
 *   { amount: 50000, currency: 'ARS' },
 *   { amount: 75, currency: 'EUR' }
 * ], 'USD')
 * console.log(`Total in USD: ${total}`)
 */
export async function convertMultipleCurrencies(
  amounts: Array<{ amount: number; currency: string }>,
  toCurrency: string
): Promise<number> {
  try {
    const rates = await getExchangeRates();

    let totalInTargetCurrency = 0;

    for (const item of amounts) {
      const converted = await convertCurrency(item.amount, item.currency, toCurrency);
      totalInTargetCurrency += converted;
    }

    return totalInTargetCurrency;
  } catch (error) {
    console.error('Multiple currency conversion error:', error);
    // If conversion fails, sum only amounts in target currency
    return amounts
      .filter(item => item.currency === toCurrency)
      .reduce((sum, item) => sum + item.amount, 0);
  }
}

/**
 * Gets the exchange rate between two currencies
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @returns Exchange rate (how much 1 unit of fromCurrency is worth in toCurrency)
 *
 * @example
 * const rate = await getExchangeRate('USD', 'ARS')
 * console.log(`1 USD = ${rate} ARS`)
 */
export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return 1;
  }

  try {
    const converted = await convertCurrency(1, fromCurrency, toCurrency);
    return converted;
  } catch (error) {
    console.error('Get exchange rate error:', error);
    return 1; // Fallback to 1:1 ratio
  }
}

/**
 * Clears the exchange rate cache
 * Useful for testing or forcing a refresh
 */
export function clearExchangeRateCache(): void {
  ratesCache = null;
}
