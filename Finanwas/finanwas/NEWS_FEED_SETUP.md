# Financial News Feed - Setup Guide

## Overview

The News Feed feature provides personalized financial news to users based on their portfolio holdings, along with general market news, cryptocurrency updates, and economy news.

## Features

- **Personalized Portfolio News**: Shows news articles related to companies/assets in the user's portfolio
- **Market News**: General business and financial news from Argentina
- **Cryptocurrency News**: Latest updates on Bitcoin, Ethereum, and crypto markets
- **Economy News**: Economic and investment-related news
- **Smart Caching**: 30-minute in-memory cache to avoid API rate limits
- **Responsive UI**: Tab-based interface with article previews and external links
- **Real-time Updates**: News refreshes automatically based on user's portfolio changes

## Setup Instructions

### Step 1: Get a News API Key

1. Visit [NewsAPI.org](https://newsapi.org/)
2. Sign up for a free account
3. Copy your API key from the dashboard
4. Free tier includes:
   - 100 requests/day
   - Developer usage
   - Access to all news sources

**Alternative APIs** (if you want to switch later):
- Alpha Vantage: Includes news endpoint
- Yahoo Finance RSS: Free but requires scraping
- Google News RSS: Free but limited

### Step 2: Configure Environment Variables

Add the following to your `.env.local` file:

```bash
# News API Configuration
NEWS_API_KEY=your_actual_api_key_here
```

**Important**:
- Never commit your `.env.local` file to version control
- The `.env.example` file has been updated with the template
- Restart your Next.js development server after adding the key

### Step 3: Verify Installation

The feature is already integrated into the dashboard. To verify:

1. Make sure your development server is running:
   ```bash
   npm run dev
   ```

2. Navigate to the dashboard page (`/dashboard`)

3. You should see the "Noticias Financieras" widget

4. If NEWS_API_KEY is not configured, the widget will show empty but won't crash

## Architecture

### Files Created

```
src/
├── lib/
│   └── services/
│       └── news-feed.ts              # News service with API integration
├── app/
│   └── api/
│       └── news/
│           └── route.ts              # News API endpoint
└── components/
    └── dashboard/
        └── NewsFeedWidget.tsx        # News widget component
```

### Data Flow

```
User Portfolio → API Endpoint → News Service → NewsAPI.org
                      ↓
                News Cache (30 min)
                      ↓
                Dashboard Widget
```

### Caching Strategy

- **In-Memory Cache**: 30-minute TTL for all news categories
- **HTTP Cache**: `Cache-Control: private, max-age=1800` on API responses
- **Per-User Cache**: Portfolio news cached separately per user
- **Shared Cache**: Market, crypto, and economy news shared across users

### API Response Format

```typescript
{
  success: true,
  data: {
    portfolio: NewsArticle[],    // News for user's holdings
    market: NewsArticle[],        // Argentina business news
    crypto: NewsArticle[],        // Cryptocurrency news
    economy: NewsArticle[],       // General economy news
    timestamp: string             // When news was fetched
  }
}
```

### NewsArticle Interface

```typescript
interface NewsArticle {
  id: string
  title: string
  description: string
  url: string
  imageUrl: string | null
  source: string
  publishedAt: Date
  category?: 'market' | 'company' | 'economy' | 'crypto'
}
```

## Usage

### In the Dashboard

The news widget automatically appears on the dashboard with four tabs:

1. **Portfolio** (only if user has assets with tickers)
   - Shows news related to user's holdings
   - Empty if no tickers in portfolio

2. **Mercado** (Market)
   - Argentina business news
   - Top headlines in Spanish

3. **Crypto**
   - Bitcoin, Ethereum, cryptocurrency news
   - International and local sources

4. **Economía** (Economy)
   - General economic news
   - Investment-related articles

### Customizing the Widget

To change the widget appearance or position:

1. Open `src/app/(main)/dashboard/page.tsx`
2. Find the `<NewsFeedWidget />` component
3. Adjust className or positioning in grid

Example - Make it full width:
```tsx
<NewsFeedWidget className="md:col-span-2" />
```

Example - Add margin:
```tsx
<NewsFeedWidget className="md:col-span-2 mt-4" />
```

## API Endpoints

### GET /api/news

**Authentication**: Required (JWT token)

**Query Parameters**: None (uses authenticated user's portfolio)

**Response**:
```json
{
  "success": true,
  "data": {
    "portfolio": [...],
    "market": [...],
    "crypto": [...],
    "economy": [...],
    "timestamp": "2026-01-21T10:30:00.000Z"
  }
}
```

**Cache**: 30 minutes

## Service Functions

### `getPersonalizedNewsFeed(tickers: string[])`

Main function that fetches all news categories for a user.

```typescript
const tickers = ['AAPL', 'TSLA', 'BTC']
const news = await getPersonalizedNewsFeed(tickers)
```

### `getNewsForTickers(tickers: string[])`

Fetch news for specific stock tickers.

```typescript
const portfolioNews = await getNewsForTickers(['AAPL', 'GOOGL'])
```

### `getMarketNews()`

Fetch general market news from Argentina.

```typescript
const marketNews = await getMarketNews()
```

### `getCryptoNews()`

Fetch cryptocurrency-related news.

```typescript
const cryptoNews = await getCryptoNews()
```

### `getEconomyNews()`

Fetch economy and investment news.

```typescript
const economyNews = await getEconomyNews()
```

### `clearNewsCache()`

Manually clear the news cache.

```typescript
import { clearNewsCache } from '@/lib/services/news-feed'

clearNewsCache()
```

## Troubleshooting

### "No hay noticias disponibles"

**Possible causes**:
1. NEWS_API_KEY not configured
2. API rate limit exceeded (100/day on free tier)
3. Network error

**Solutions**:
- Check `.env.local` has NEWS_API_KEY
- Check browser console for errors
- Verify API key at newsapi.org dashboard
- Wait if rate limit exceeded (resets daily)

### News not updating

**Cause**: Cache is active (30 minutes)

**Solutions**:
- Wait 30 minutes for cache to expire
- Restart development server
- Call `clearNewsCache()` to force refresh

### "Error al cargar noticias"

**Possible causes**:
1. API connection failure
2. Invalid API key
3. Server error

**Solutions**:
- Check network connection
- Verify API key is correct
- Check server logs for detailed error
- Test API key directly at newsapi.org

### No portfolio news showing

**Cause**: User has no assets with ticker symbols

**Solution**:
- Add stocks with ticker symbols to portfolio
- Portfolio news only shows for assets with valid tickers
- Other tabs (Market, Crypto, Economy) will still show news

## Rate Limiting

### Free Tier Limits

- **Requests per day**: 100
- **Requests per second**: Not specified (be reasonable)
- **Cache duration**: 30 minutes (to minimize requests)

### Best Practices

1. Cache is enabled by default (30 min)
2. Each user's first visit creates a cache entry
3. Subsequent visits use cached data
4. Separate caches for each news category
5. Consider upgrading to paid tier for production

### Monitoring Usage

Check your API usage at:
- [NewsAPI Dashboard](https://newsapi.org/account)
- Server logs: `console.log` in news-feed.ts shows errors

## Customization

### Change Cache Duration

Edit `src/lib/services/news-feed.ts`:

```typescript
const CACHE_DURATION = 60 * 60 * 1000 // 60 minutes instead of 30
```

### Change Number of Articles

Edit the `pageSize` parameter in each function:

```typescript
params: {
  // ...
  pageSize: 20  // Change to desired number (max 100)
}
```

### Change Language

Edit the `language` parameter:

```typescript
params: {
  // ...
  language: 'en'  // Change to 'en' for English
}
```

### Add More Categories

1. Create a new function in `news-feed.ts`:

```typescript
export async function getTechNews(): Promise<NewsArticle[]> {
  // Implementation similar to other functions
}
```

2. Add to `getPersonalizedNewsFeed`:

```typescript
const [portfolioNews, marketNews, cryptoNews, economyNews, techNews] = await Promise.all([
  // ...
  getTechNews()
])

return {
  portfolio: portfolioNews,
  market: marketNews,
  crypto: cryptoNews,
  economy: economyNews,
  tech: techNews
}
```

3. Update the widget component to add a new tab

## Production Considerations

### Before Going Live

1. **Upgrade API Plan**
   - Free tier (100/day) is insufficient for production
   - Consider paid tier or alternative APIs
   - Calculate expected daily requests

2. **Add Redis Cache**
   - Replace in-memory cache with Redis
   - Share cache across server instances
   - Persist cache across deployments

3. **Error Monitoring**
   - Already integrated with error logging system
   - Monitor API failures and rate limits
   - Set up alerts for errors

4. **Rate Limiting**
   - Implement user-level rate limiting
   - Prevent abuse of news endpoint
   - Consider caching at CDN level

5. **Alternative News Sources**
   - Consider multiple news APIs for redundancy
   - Yahoo Finance RSS as fallback
   - Alpha Vantage for market data

### Recommended Production Setup

```typescript
// Use Redis for caching in production
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

async function getCachedNews(key: string) {
  const cached = await redis.get(key)
  return cached ? JSON.parse(cached) : null
}

async function setCachedNews(key: string, data: any) {
  await redis.setex(key, 1800, JSON.stringify(data)) // 30 min
}
```

## Support

For issues or questions:

1. Check this documentation first
2. Review server logs for errors
3. Test API key at newsapi.org
4. Check NewsAPI documentation: https://newsapi.org/docs

## Changelog

### Version 1.0.0 (2026-01-21)

- Initial implementation
- Four news categories (Portfolio, Market, Crypto, Economy)
- 30-minute in-memory caching
- Dashboard widget with tabs
- NewsAPI.org integration
- Spanish language support
