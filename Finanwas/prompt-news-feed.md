# Ralph Agent - Financial News Feed

## Objective
Implement a personalized financial news feed that shows relevant news articles based on user's portfolio holdings and interests, keeping users informed about their investments.

## Context
Users want to stay informed about companies in their portfolio and market trends. A personalized news feed increases engagement and provides value by surfacing relevant financial news automatically.

## Requirements

### News API Options

**Option 1: NewsAPI.org** (Recommended for MVP)
- Free tier: 100 requests/day
- Good for development/testing
- Simple REST API
- Spanish language support

**Option 2: Alpha Vantage** (Alternative)
- Free tier included
- News API endpoint
- Already used for some financial data

**Option 3: Scraping Financial Sites** (Free but complex)
- Yahoo Finance RSS
- Google Finance
- Requires web scraping

**Start with**: NewsAPI.org for simplicity, can switch later.

### Phase 1: News API Integration

#### Install Dependencies
```bash
npm install axios
```

#### Create News Service
File: `src/lib/services/news.ts`

```typescript
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

/**
 * Fetch news for specific tickers
 */
export async function getNewsForTickers(tickers: string[]): Promise<NewsArticle[]> {
  if (!NEWS_API_KEY) {
    console.warn('NEWS_API_KEY not configured')
    return []
  }

  try {
    const query = tickers.join(' OR ')

    const response = await axios.get(`${NEWS_API_BASE_URL}/everything`, {
      params: {
        q: query,
        apiKey: NEWS_API_KEY,
        language: 'es', // Spanish first
        sortBy: 'publishedAt',
        pageSize: 20
      }
    })

    return response.data.articles.map((article: any, index: number) => ({
      id: `${article.url}-${index}`,
      title: article.title,
      description: article.description,
      url: article.url,
      imageUrl: article.urlToImage,
      source: article.source.name,
      publishedAt: new Date(article.publishedAt)
    }))
  } catch (error) {
    console.error('Error fetching news:', error)
    return []
  }
}

/**
 * Fetch general market news
 */
export async function getMarketNews(): Promise<NewsArticle[]> {
  if (!NEWS_API_KEY) return []

  try {
    const response = await axios.get(`${NEWS_API_BASE_URL}/top-headlines`, {
      params: {
        category: 'business',
        country: 'ar', // Argentina
        apiKey: NEWS_API_KEY,
        pageSize: 10
      }
    })

    return response.data.articles.map((article: any, index: number) => ({
      id: `market-${article.url}-${index}`,
      title: article.title,
      description: article.description,
      url: article.url,
      imageUrl: article.urlToImage,
      source: article.source.name,
      publishedAt: new Date(article.publishedAt),
      category: 'market'
    }))
  } catch (error) {
    console.error('Error fetching market news:', error)
    return []
  }
}

/**
 * Fetch crypto news
 */
export async function getCryptoNews(): Promise<NewsArticle[]> {
  if (!NEWS_API_KEY) return []

  try {
    const response = await axios.get(`${NEWS_API_BASE_URL}/everything`, {
      params: {
        q: 'bitcoin OR ethereum OR crypto',
        apiKey: NEWS_API_KEY,
        language: 'es',
        sortBy: 'publishedAt',
        pageSize: 5
      }
    })

    return response.data.articles.map((article: any, index: number) => ({
      id: `crypto-${article.url}-${index}`,
      title: article.title,
      description: article.description,
      url: article.url,
      imageUrl: article.urlToImage,
      source: article.source.name,
      publishedAt: new Date(article.publishedAt),
      category: 'crypto'
    }))
  } catch (error) {
    console.error('Error fetching crypto news:', error)
    return []
  }
}
```

### Phase 2: Caching Strategy

Cache news to avoid hitting API limits:

File: `src/lib/cache/news-cache.ts`

```typescript
interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

const newsCache = new Map<string, CacheEntry<any>>()
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

export function getCachedNews<T>(key: string): T | null {
  const entry = newsCache.get(key)

  if (!entry) return null

  if (Date.now() > entry.expiresAt) {
    newsCache.delete(key)
    return null
  }

  return entry.data
}

export function setCachedNews<T>(key: string, data: T): void {
  newsCache.set(key, {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + CACHE_DURATION
  })
}
```

### Phase 3: API Endpoints

File: `src/app/api/news/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth/cookies'
import { verifyToken } from '@/lib/auth/jwt'
import { getUserAssets } from '@/lib/db/queries/portfolio'
import { getNewsForTickers, getMarketNews, getCryptoNews } from '@/lib/services/news'
import { getCachedNews, setCachedNews } from '@/lib/cache/news-cache'

/**
 * GET /api/news
 * Returns personalized news feed based on user portfolio
 */
export async function GET(request: NextRequest) {
  try {
    // Auth
    const token = await getAuthCookie()
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const userId = payload.userId

    // Check cache
    const cacheKey = `news-${userId}`
    const cachedNews = getCachedNews(cacheKey)
    if (cachedNews) {
      return NextResponse.json({
        success: true,
        data: cachedNews,
        cached: true
      })
    }

    // Get user assets to personalize news
    const assets = await getUserAssets(userId)
    const tickers = assets
      .map(asset => asset.ticker)
      .filter(ticker => ticker !== null) as string[]

    // Fetch news
    const [portfolioNews, marketNews, cryptoNews] = await Promise.all([
      tickers.length > 0 ? getNewsForTickers(tickers) : Promise.resolve([]),
      getMarketNews(),
      getCryptoNews()
    ])

    const newsData = {
      portfolio: portfolioNews,
      market: marketNews,
      crypto: cryptoNews,
      timestamp: new Date().toISOString()
    }

    // Cache result
    setCachedNews(cacheKey, newsData)

    return NextResponse.json({
      success: true,
      data: newsData,
      cached: false
    }, {
      headers: {
        'Cache-Control': 'private, max-age=1800' // 30 minutes
      }
    })

  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { success: false, error: 'Error al cargar noticias' },
      { status: 500 }
    )
  }
}
```

### Phase 4: News Feed Component

File: `src/components/news/NewsFeed.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExternalLinkIcon, NewspaperIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface NewsArticle {
  id: string
  title: string
  description: string
  url: string
  imageUrl: string | null
  source: string
  publishedAt: Date
}

export function NewsFeed() {
  const [news, setNews] = useState<{
    portfolio: NewsArticle[]
    market: NewsArticle[]
    crypto: NewsArticle[]
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/news')
      const result = await response.json()

      if (result.success) {
        setNews(result.data)
      }
    } catch (error) {
      console.error('Error loading news:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!news) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No se pudieron cargar las noticias
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <NewspaperIcon className="size-5" />
          Noticias Financieras
        </CardTitle>
        <CardDescription>
          Mantente informado sobre tus inversiones y el mercado
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="portfolio" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="portfolio">
              Tu Portfolio ({news.portfolio.length})
            </TabsTrigger>
            <TabsTrigger value="market">
              Mercado ({news.market.length})
            </TabsTrigger>
            <TabsTrigger value="crypto">
              Crypto ({news.crypto.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-4 mt-4">
            {news.portfolio.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Agregá activos a tu portfolio para ver noticias personalizadas
              </p>
            ) : (
              news.portfolio.map(article => (
                <NewsArticleCard key={article.id} article={article} />
              ))
            )}
          </TabsContent>

          <TabsContent value="market" className="space-y-4 mt-4">
            {news.market.map(article => (
              <NewsArticleCard key={article.id} article={article} />
            ))}
          </TabsContent>

          <TabsContent value="crypto" className="space-y-4 mt-4">
            {news.crypto.map(article => (
              <NewsArticleCard key={article.id} article={article} />
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function NewsArticleCard({ article }: { article: NewsArticle }) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <div className="flex gap-4 p-4 rounded-lg border hover:bg-accent transition-colors">
        {article.imageUrl && (
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-24 h-24 object-cover rounded flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {article.description}
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span>{article.source}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(article.publishedAt), { locale: es, addSuffix: true })}</span>
            <ExternalLinkIcon className="size-3 ml-auto" />
          </div>
        </div>
      </div>
    </a>
  )
}
```

### Phase 5: Integration

#### Add to Dashboard
File: `src/app/(main)/dashboard/page.tsx`

```typescript
import { NewsFeed } from '@/components/news/NewsFeed'

// Add news feed widget
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Other widgets */}

  <div className="lg:col-span-2">
    <NewsFeed />
  </div>
</div>
```

#### Create Dedicated News Page (Optional)
File: `src/app/(main)/noticias/page.tsx`

```typescript
import { NewsFeed } from '@/components/news/NewsFeed'

export const metadata = {
  title: 'Noticias Financieras'
}

export default function NoticiasPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Noticias Financieras</h1>
      <NewsFeed />
    </div>
  )
}
```

### Phase 6: Fallback for Free Tier Limits

When API limit reached, show cached news or placeholder:

```typescript
const FALLBACK_NEWS = [
  {
    id: 'fallback-1',
    title: 'Mantente informado',
    description: 'Las noticias se actualizarán pronto. Mientras tanto, revisá tu portfolio.',
    url: '/portfolio',
    imageUrl: null,
    source: 'Finanwas',
    publishedAt: new Date()
  }
]
```

## Environment Variables

Add to `.env.local`:
```env
NEWS_API_KEY=your_newsapi_key_here
```

Get free API key from: https://newsapi.org/register

## Success Criteria
✅ News API integration working
✅ Personalized news based on portfolio tickers
✅ Market and crypto news tabs
✅ Caching to avoid API limits
✅ News feed component responsive
✅ Opens articles in new tab
✅ Graceful fallback when API limit reached
✅ Loading and empty states
✅ Documentation created (NEWS_FEED.md)

## Implementation Strategy

### Iteration 1: News Service
1. Get NewsAPI key
2. Create news service with API functions
3. Test fetching news
4. Implement caching

### Iteration 2: API Endpoint
1. Create GET /api/news endpoint
2. Personalize based on user portfolio
3. Add caching headers
4. Test with various users

### Iteration 3: News Feed Component
1. Create NewsFeed component
2. Add tabs for portfolio/market/crypto
3. Style news articles
4. Add loading states

### Iteration 4: Integration
1. Add to dashboard
2. Create dedicated news page (optional)
3. Test on mobile
4. Add to navigation

### Iteration 5: Polish
1. Handle API limit errors
2. Add fallback content
3. Optimize performance
4. Create documentation

## Code Quality Standards
- Follow existing patterns
- Use TypeScript properly
- Add proper error handling
- Caching to respect API limits
- Responsive design
- Accessible links

## Constraints
- Do NOT exceed NewsAPI free tier limits (100/day)
- Do NOT block app if news fails to load
- Use existing UI components
- Follow Next.js patterns
- Maintain Spanish language

## Testing Checklist
- [ ] News loads for users with tickers
- [ ] Market news shows for all users
- [ ] Crypto news tab works
- [ ] Caching prevents excessive API calls
- [ ] Links open in new tab
- [ ] Mobile responsive
- [ ] Handles API errors gracefully

## Commit Message Format
```
feat: Add personalized financial news feed

- Integrate NewsAPI.org for financial news
- Create news service with caching (30min cache)
- Implement GET /api/news endpoint
- Build NewsFeed component with tabs (portfolio/market/crypto)
- Personalize news based on user's portfolio tickers
- Add to dashboard and create dedicated news page
- Handle API rate limits with graceful fallback
- Responsive design for mobile and desktop
- Create NEWS_FEED.md documentation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

**Important**: NewsAPI free tier has 100 requests/day limit. With caching (30min) and ~50 active users, this should be sufficient. Can upgrade or switch to alternative source if needed later.
