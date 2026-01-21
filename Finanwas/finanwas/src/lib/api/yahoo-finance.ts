import yahooFinance from 'yahoo-finance2';

/**
 * Quote data from Yahoo Finance
 */
export interface QuoteData {
  symbol: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  currency: string;
  lastUpdate: Date;
}

/**
 * Key statistics from Yahoo Finance
 */
export interface KeyStats {
  symbol: string;
  peRatio: number | null; // Price-to-Earnings
  pbRatio: number | null; // Price-to-Book
  roe: number | null; // Return on Equity
  roa: number | null; // Return on Assets
  debtToEquity: number | null;
  dividendYield: number | null;
  marketCap: number | null;
  sector: string | null; // Industry sector
  lastUpdate: Date;
}

/**
 * Cache entry for quotes and stats
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// 15-minute cache (in milliseconds)
const CACHE_DURATION = 15 * 60 * 1000;

// In-memory caches
const quoteCache = new Map<string, CacheEntry<QuoteData>>();
const statsCache = new Map<string, CacheEntry<KeyStats>>();

/**
 * Check if a cache entry is still valid
 */
function isCacheValid<T>(entry: CacheEntry<T> | undefined): boolean {
  if (!entry) return false;
  return Date.now() - entry.timestamp < CACHE_DURATION;
}

/**
 * Get stock quote (price, change, changePercent)
 * @param ticker - Stock ticker symbol (e.g., "AAPL", "GGAL.BA")
 * @returns Quote data with 15-minute caching
 * @throws Error with Spanish message if the request fails
 */
export async function getQuote(ticker: string): Promise<QuoteData> {
  try {
    // Check cache first
    const cached = quoteCache.get(ticker);
    if (isCacheValid(cached)) {
      return cached!.data;
    }

    // Fetch from Yahoo Finance
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quote = (await yahooFinance.quote(ticker)) as any;

    if (!quote) {
      throw new Error(`No se encontraron datos para el ticker ${ticker}`);
    }

    const quoteData: QuoteData = {
      symbol: quote.symbol,
      price: quote.regularMarketPrice ?? null,
      change: quote.regularMarketChange ?? null,
      changePercent: quote.regularMarketChangePercent ?? null,
      currency: quote.currency ?? 'USD',
      lastUpdate: new Date(),
    };

    // Update cache
    quoteCache.set(ticker, {
      data: quoteData,
      timestamp: Date.now(),
    });

    return quoteData;
  } catch (error) {
    if (error instanceof Error) {
      // Check for common Yahoo Finance errors
      if (error.message.includes('Not Found') || error.message.includes('404')) {
        throw new Error(`El ticker ${ticker} no existe o no está disponible`);
      }
      if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
        throw new Error('Tiempo de espera agotado al conectar con Yahoo Finance');
      }
      if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
        throw new Error('Error de conexión. Verifica tu conexión a internet');
      }

      throw new Error(`Error al obtener cotización para ${ticker}: ${error.message}`);
    }

    throw new Error(`Error desconocido al obtener cotización para ${ticker}`);
  }
}

/**
 * Get key statistics for a stock (P/E, P/B, ROE, ROA, debt-to-equity, dividend yield)
 * @param ticker - Stock ticker symbol (e.g., "AAPL", "GGAL.BA")
 * @returns Key statistics with 15-minute caching
 * @throws Error with Spanish message if the request fails
 */
export async function getKeyStats(ticker: string): Promise<KeyStats> {
  try {
    // Check cache first
    const cached = statsCache.get(ticker);
    if (isCacheValid(cached)) {
      return cached!.data;
    }

    // Fetch both quoteSummary and quote for comprehensive data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [quoteSummary, quote] = await Promise.all([
      yahooFinance.quoteSummary(ticker, {
        modules: ['defaultKeyStatistics', 'financialData', 'summaryDetail', 'assetProfile'],
      }) as any,
      yahooFinance.quote(ticker) as any,
    ]);

    if (!quoteSummary && !quote) {
      throw new Error(`No se encontraron datos para el ticker ${ticker}`);
    }

    const defaultKeyStats = quoteSummary?.defaultKeyStatistics;
    const financialData = quoteSummary?.financialData;
    const summaryDetail = quoteSummary?.summaryDetail;
    const assetProfile = quoteSummary?.assetProfile;

    const keyStats: KeyStats = {
      symbol: ticker,
      peRatio: summaryDetail?.trailingPE ?? defaultKeyStats?.trailingEps ?? null,
      pbRatio: defaultKeyStats?.priceToBook ?? null,
      roe: financialData?.returnOnEquity ?? null,
      roa: financialData?.returnOnAssets ?? null,
      debtToEquity: financialData?.debtToEquity ?? null,
      dividendYield: summaryDetail?.dividendYield ?? defaultKeyStats?.dividendYield ?? null,
      marketCap: quote?.marketCap ?? summaryDetail?.marketCap ?? null,
      sector: assetProfile?.sector ?? null,
      lastUpdate: new Date(),
    };

    // Update cache
    statsCache.set(ticker, {
      data: keyStats,
      timestamp: Date.now(),
    });

    return keyStats;
  } catch (error) {
    if (error instanceof Error) {
      // Check for common Yahoo Finance errors
      if (error.message.includes('Not Found') || error.message.includes('404')) {
        throw new Error(`El ticker ${ticker} no existe o no está disponible`);
      }
      if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
        throw new Error('Tiempo de espera agotado al conectar con Yahoo Finance');
      }
      if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
        throw new Error('Error de conexión. Verifica tu conexión a internet');
      }

      throw new Error(`Error al obtener estadísticas para ${ticker}: ${error.message}`);
    }

    throw new Error(`Error desconocido al obtener estadísticas para ${ticker}`);
  }
}

/**
 * Clear all caches (useful for testing or forced refresh)
 */
export function clearCache(): void {
  quoteCache.clear();
  statsCache.clear();
}

/**
 * Clear cache for a specific ticker
 */
export function clearTickerCache(ticker: string): void {
  quoteCache.delete(ticker);
  statsCache.delete(ticker);
}
