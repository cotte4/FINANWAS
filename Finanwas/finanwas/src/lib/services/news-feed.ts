import axios from 'axios'

const NEWS_API_KEY = process.env.NEWS_API_KEY
const NEWS_API_BASE_URL = 'https://newsapi.org/v2'

export interface NewsArticle {
  id: string
  title: string
  description: string
  url: string
  imageUrl: string | null
  source: string
  publishedAt: Date
  ticker?: string
  category?: 'market' | 'company' | 'economy' | 'crypto'
}

interface CacheEntry {
  data: NewsArticle[]
  timestamp: number
  expiresAt: number
}

// In-memory cache with 30-minute TTL (following project pattern from exchange-rates.ts)
const newsCache = new Map<string, CacheEntry>()
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

/**
 * Get cached news if available and not expired
 */
function getCachedNews(key: string): NewsArticle[] | null {
  const entry = newsCache.get(key)

  if (!entry) return null

  if (Date.now() > entry.expiresAt) {
    newsCache.delete(key)
    return null
  }

  return entry.data
}

/**
 * Cache news data
 */
function setCachedNews(key: string, data: NewsArticle[]): void {
  newsCache.set(key, {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + CACHE_DURATION
  })
}

/**
 * Clear all news cache
 */
export function clearNewsCache(): void {
  newsCache.clear()
}

/**
 * Fetch news for specific tickers (portfolio holdings)
 */
export async function getNewsForTickers(tickers: string[]): Promise<NewsArticle[]> {
  if (!NEWS_API_KEY) {
    console.warn('NEWS_API_KEY not configured')
    return []
  }

  if (tickers.length === 0) {
    return []
  }

  // Check cache
  const cacheKey = `tickers-${tickers.sort().join(',')}`
  const cached = getCachedNews(cacheKey)
  if (cached) {
    return cached
  }

  try {
    // Create search query with company tickers
    const query = tickers.join(' OR ')

    const response = await axios.get(`${NEWS_API_BASE_URL}/everything`, {
      params: {
        q: query,
        apiKey: NEWS_API_KEY,
        language: 'es', // Spanish first
        sortBy: 'publishedAt',
        pageSize: 20,
        searchIn: 'title,description'
      },
      timeout: 10000 // 10 second timeout
    })

    const articles: NewsArticle[] = response.data.articles.map((article: any, index: number) => ({
      id: `${article.url}-${index}`,
      title: article.title || 'Sin título',
      description: article.description || '',
      url: article.url,
      imageUrl: article.urlToImage,
      source: article.source.name,
      publishedAt: new Date(article.publishedAt),
      category: 'company' as const
    }))

    // Cache the results
    setCachedNews(cacheKey, articles)

    return articles
  } catch (error) {
    console.error('Error fetching news for tickers:', error)
    return []
  }
}

/**
 * Fetch general market news
 */
export async function getMarketNews(): Promise<NewsArticle[]> {
  if (!NEWS_API_KEY) {
    console.warn('NEWS_API_KEY not configured')
    return []
  }

  // Check cache
  const cacheKey = 'market-news'
  const cached = getCachedNews(cacheKey)
  if (cached) {
    return cached
  }

  try {
    const response = await axios.get(`${NEWS_API_BASE_URL}/top-headlines`, {
      params: {
        category: 'business',
        country: 'ar', // Argentina
        apiKey: NEWS_API_KEY,
        pageSize: 15
      },
      timeout: 10000
    })

    const articles: NewsArticle[] = response.data.articles.map((article: any, index: number) => ({
      id: `market-${article.url}-${index}`,
      title: article.title || 'Sin título',
      description: article.description || '',
      url: article.url,
      imageUrl: article.urlToImage,
      source: article.source.name,
      publishedAt: new Date(article.publishedAt),
      category: 'market' as const
    }))

    // Cache the results
    setCachedNews(cacheKey, articles)

    return articles
  } catch (error) {
    console.error('Error fetching market news:', error)
    return []
  }
}

/**
 * Fetch cryptocurrency news
 */
export async function getCryptoNews(): Promise<NewsArticle[]> {
  if (!NEWS_API_KEY) {
    console.warn('NEWS_API_KEY not configured')
    return []
  }

  // Check cache
  const cacheKey = 'crypto-news'
  const cached = getCachedNews(cacheKey)
  if (cached) {
    return cached
  }

  try {
    const response = await axios.get(`${NEWS_API_BASE_URL}/everything`, {
      params: {
        q: 'bitcoin OR ethereum OR cryptocurrency',
        apiKey: NEWS_API_KEY,
        language: 'es',
        sortBy: 'publishedAt',
        pageSize: 10,
        searchIn: 'title,description'
      },
      timeout: 10000
    })

    const articles: NewsArticle[] = response.data.articles.map((article: any, index: number) => ({
      id: `crypto-${article.url}-${index}`,
      title: article.title || 'Sin título',
      description: article.description || '',
      url: article.url,
      imageUrl: article.urlToImage,
      source: article.source.name,
      publishedAt: new Date(article.publishedAt),
      category: 'crypto' as const
    }))

    // Cache the results
    setCachedNews(cacheKey, articles)

    return articles
  } catch (error) {
    console.error('Error fetching crypto news:', error)
    return []
  }
}

/**
 * Fetch economy/general financial news
 */
export async function getEconomyNews(): Promise<NewsArticle[]> {
  if (!NEWS_API_KEY) {
    console.warn('NEWS_API_KEY not configured')
    return []
  }

  // Check cache
  const cacheKey = 'economy-news'
  const cached = getCachedNews(cacheKey)
  if (cached) {
    return cached
  }

  try {
    const response = await axios.get(`${NEWS_API_BASE_URL}/everything`, {
      params: {
        q: 'economía OR inflación OR mercados OR inversiones',
        apiKey: NEWS_API_KEY,
        language: 'es',
        sortBy: 'publishedAt',
        pageSize: 10,
        searchIn: 'title,description'
      },
      timeout: 10000
    })

    const articles: NewsArticle[] = response.data.articles.map((article: any, index: number) => ({
      id: `economy-${article.url}-${index}`,
      title: article.title || 'Sin título',
      description: article.description || '',
      url: article.url,
      imageUrl: article.urlToImage,
      source: article.source.name,
      publishedAt: new Date(article.publishedAt),
      category: 'economy' as const
    }))

    // Cache the results
    setCachedNews(cacheKey, articles)

    return articles
  } catch (error) {
    console.error('Error fetching economy news:', error)
    return []
  }
}

/**
 * Get personalized news feed for a user based on their portfolio
 */
export async function getPersonalizedNewsFeed(tickers: string[]): Promise<{
  portfolio: NewsArticle[]
  market: NewsArticle[]
  crypto: NewsArticle[]
  economy: NewsArticle[]
}> {
  // Fetch all news sources in parallel
  const [portfolioNews, marketNews, cryptoNews, economyNews] = await Promise.all([
    tickers.length > 0 ? getNewsForTickers(tickers) : Promise.resolve([]),
    getMarketNews(),
    getCryptoNews(),
    getEconomyNews()
  ])

  return {
    portfolio: portfolioNews,
    market: marketNews,
    crypto: cryptoNews,
    economy: economyNews
  }
}
