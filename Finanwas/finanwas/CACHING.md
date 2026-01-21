# Caching Strategy for Finanwas

This document outlines the caching implementation across the Finanwas application.

## Overview

The application uses a multi-layered caching strategy to optimize performance:
- **Server-side in-memory caching** for expensive API calls and file reads
- **HTTP Cache-Control headers** for browser-side caching
- **Tiered cache durations** based on data volatility

## Cache Layers

### 1. Market Data Caching

#### Yahoo Finance Stock Quotes
- **Location**: `src/lib/api/yahoo-finance.ts`
- **Cache Type**: In-memory Map (`quoteCache`, `statsCache`)
- **Duration**: 15 minutes (900 seconds)
- **Endpoints Using This**:
  - `GET /api/market/stock/[ticker]` - Stock quotes and statistics
  - `POST /api/portfolio/refresh-prices` - Portfolio price updates
- **Browser Cache**: `Cache-Control: private, max-age=900` (15 minutes)
- **Why**: Stock prices change frequently but not every second. 15 minutes balances freshness with API costs.

#### Dollar Exchange Rates
- **Location**: `src/app/api/market/dollar/route.ts`
- **Cache Type**: In-memory variable (`dollarCache`)
- **Duration**: 1 hour (3600 seconds)
- **Source**: DolarApi.com (4 endpoints: official, blue, MEP, CCL)
- **Browser Cache**: `Cache-Control: private, max-age=3600` (1 hour)
- **Why**: Exchange rates are less volatile than individual stocks, 1 hour is acceptable.

### 2. Static Content Caching

#### Glossary Terms
- **Location**: `src/app/api/glossary/route.ts`
- **Cache Type**: In-memory variable (`glossaryCache`)
- **Duration**: 1 hour (3600 seconds)
- **Source**: File system (`content/glossary/terms.json`)
- **Browser Cache**: `Cache-Control: public, max-age=3600` (1 hour)
- **Why**: Glossary terms rarely change. Caching reduces file I/O operations.

#### Courses List
- **Location**: `src/app/api/courses/route.ts`
- **Cache Type**: In-memory variable (`coursesCache`)
- **Duration**: 1 hour (3600 seconds)
- **Source**: File system (`content/courses/*/metadata.json`)
- **Browser Cache**: `Cache-Control: public, max-age=3600` (1 hour)
- **Why**: Course metadata is static. Caching prevents repeated file system reads.

## Cache Invalidation

### Current Approach
- **Time-based expiration (TTL)**: All caches expire after their configured duration
- **Manual clearing**: Yahoo Finance module exports `clearCache()` and `clearTickerCache(ticker)` functions

### Not Yet Implemented
- Event-based invalidation (when data is updated in the database)
- Cache warming on application startup
- Distributed caching (Redis) for multi-instance deployments

## HTTP Cache Headers

### Public vs Private
- **Public** (`Cache-Control: public`): Can be cached by browsers and CDNs
  - Used for: Courses, Glossary (non-user-specific data)
- **Private** (`Cache-Control: private`): Only cached by the user's browser
  - Used for: Stock quotes, Dollar rates (user-authenticated endpoints)

### Max-Age Values
| Duration | Seconds | Use Case |
|----------|---------|----------|
| 15 minutes | 900 | Stock market data (volatile) |
| 1 hour | 3600 | Exchange rates, static content |

## Performance Impact

### Before Caching
- Glossary: File read on every request (~5-10ms per request)
- Courses: Multiple file reads per request (~20-30ms per request)
- Stock prices: API call on every request (~200-500ms per request)
- Portfolio refresh: N API calls for N assets (potentially 5-10 seconds for large portfolios)

### After Caching
- Glossary: File read once per hour
- Courses: File reads once per hour
- Stock prices: API call once per 15 minutes per ticker
- Portfolio refresh: Uses cached quotes (15-minute cache), significantly faster on subsequent calls

## Future Improvements

### Short-term (Low Effort)
1. Add ETags for conditional requests
2. Implement cache warming on application startup
3. Add cache hit/miss metrics

### Medium-term (Medium Effort)
1. Migrate to Redis for distributed caching
2. Implement event-based cache invalidation
3. Add cache statistics endpoint for monitoring

### Long-term (High Effort)
1. Implement Incremental Static Regeneration (ISR) for Next.js pages
2. Add CDN caching layer (Cloudflare, Vercel Edge)
3. Implement GraphQL with DataLoader for batching and caching

## Cache Configuration Reference

```typescript
// Yahoo Finance (lib/api/yahoo-finance.ts)
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// Dollar API (app/api/market/dollar/route.ts)
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Glossary (app/api/glossary/route.ts)
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Courses (app/api/courses/route.ts)
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
```

## Development Notes

### Testing Cache Behavior
To test cache invalidation during development:
1. Set shorter cache durations (e.g., 30 seconds)
2. Add cache clear endpoints (auth-protected)
3. Use browser DevTools Network tab to verify Cache-Control headers

### Production Deployment
- Cache durations are optimized for production
- Consider environment-based cache durations for development
- Monitor cache hit rates and adjust durations as needed

## Related Files

- `src/lib/api/yahoo-finance.ts` - Yahoo Finance caching module
- `src/app/api/market/dollar/route.ts` - Dollar exchange rate caching
- `src/app/api/market/stock/[ticker]/route.ts` - Stock data endpoint
- `src/app/api/glossary/route.ts` - Glossary caching
- `src/app/api/courses/route.ts` - Courses caching
- `src/app/api/portfolio/refresh-prices/route.ts` - Portfolio price refresh (uses cache)
