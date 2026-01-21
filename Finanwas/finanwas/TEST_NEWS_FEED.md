# News Feed Testing Guide

## Quick Test Checklist

### 1. Environment Setup Test

```bash
# Check if NEWS_API_KEY is configured
grep NEWS_API_KEY .env.local
```

Expected: Should show your API key (not empty)

### 2. Development Server Test

```bash
# Start the development server
npm run dev
```

Expected: Server starts without errors

### 3. Visual Test

1. Navigate to `http://localhost:3000/dashboard`
2. Scroll down to find "Noticias Financieras" widget
3. Check if widget loads without errors

**Expected Results**:

**Without API Key**:
- Widget shows with empty state
- Message: "No hay noticias disponibles en este momento."
- No errors in console

**With API Key**:
- Widget shows loading skeleton initially
- Tabs appear: "Mercado", "Crypto", "Economía"
- If user has portfolio assets with tickers, "Portfolio" tab appears
- News articles load with:
  - Title
  - Description
  - Source name
  - Time ago (e.g., "hace 2 horas")
  - Thumbnail image (if available)
  - External link icon

### 4. Functional Tests

#### Test 4.1: Portfolio News (requires assets with tickers)

1. Go to Portfolio page
2. Add an asset with a ticker (e.g., "AAPL", "TSLA", "GOOGL")
3. Return to Dashboard
4. Refresh page
5. Check if "Portfolio" tab appears in news widget
6. Click "Portfolio" tab
7. Verify news related to your stocks appears

Expected: News articles about the companies you own

#### Test 4.2: Market News

1. Click on "Mercado" tab
2. Verify Argentina business news appears
3. Click on an article
4. Verify it opens in a new tab

Expected: Argentina-focused business news

#### Test 4.3: Crypto News

1. Click on "Crypto" tab
2. Verify cryptocurrency news appears
3. Look for keywords like "Bitcoin", "Ethereum", "crypto"

Expected: Cryptocurrency-related news

#### Test 4.4: Economy News

1. Click on "Economía" tab
2. Verify general economic news appears
3. Look for keywords like "economía", "inversiones", "mercados"

Expected: Economic and investment news

#### Test 4.5: Cache Test

1. Load dashboard
2. Note the news articles
3. Refresh page immediately
4. Verify same articles appear (served from cache)
5. Wait 31 minutes
6. Refresh page
7. Verify new articles may appear (cache expired)

Expected: Cache works correctly, reduces API calls

#### Test 4.6: Error Handling Test

**Without API Key**:
1. Remove NEWS_API_KEY from .env.local
2. Restart dev server
3. Navigate to dashboard
4. Check news widget

Expected: Widget shows empty state gracefully, no crash

**With Invalid API Key**:
1. Set NEWS_API_KEY to an invalid value
2. Restart dev server
3. Navigate to dashboard
4. Check browser console

Expected: Error logged, widget shows error message

### 5. API Endpoint Tests

#### Test 5.1: Direct API Test

Open browser console and run:

```javascript
fetch('/api/news')
  .then(res => res.json())
  .then(data => console.log(data))
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "portfolio": [...],
    "market": [...],
    "crypto": [...],
    "economy": [...],
    "timestamp": "2026-01-21T..."
  }
}
```

#### Test 5.2: Authentication Test

```javascript
// In incognito/logged out
fetch('/api/news')
  .then(res => res.json())
  .then(data => console.log(data))
```

Expected: `{ "error": "No autenticado" }` with 401 status

### 6. Performance Tests

#### Test 6.1: Load Time

1. Open DevTools > Network tab
2. Navigate to dashboard
3. Find `/api/news` request
4. Check response time

Expected:
- First call: 1-3 seconds (API call)
- Cached calls: < 100ms (from cache)

#### Test 6.2: API Rate Limit

1. Clear cache: Restart server
2. Refresh dashboard 5 times quickly
3. Check if news still loads

Expected: Should use cache, not hit API 5 times

### 7. Mobile Responsiveness Test

1. Open DevTools
2. Toggle device emulation
3. Test on:
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1920px)

Expected:
- Tabs should be readable on mobile
- Cards should stack properly
- Images should scale correctly
- Text should not overflow

### 8. Edge Cases

#### Test 8.1: User with No Portfolio

1. Create/login as new user
2. Don't add any assets
3. Go to dashboard

Expected:
- No "Portfolio" tab
- Other tabs work normally

#### Test 8.2: User with Portfolio but No Tickers

1. Add assets without ticker symbols
2. Go to dashboard

Expected:
- No "Portfolio" tab (or empty portfolio tab)
- Other tabs work normally

#### Test 8.3: Network Failure

1. Open DevTools > Network
2. Set throttling to "Offline"
3. Refresh dashboard

Expected:
- Widget shows error state
- Error message displayed
- No crash

### 9. Console Log Tests

Check for these in browser console:

**Good Signs**:
- No errors
- No warnings (except unrelated ones)

**Warning Signs to Investigate**:
- `NEWS_API_KEY not configured` - Need to set API key
- `Error fetching news` - Check API key validity
- Network errors - Check internet connection

**Expected Warnings (OK to ignore)**:
- Next.js Fast Refresh warnings
- React DevTools warnings

### 10. Server Log Tests

Check terminal/server logs for:

**Good Signs**:
- No errors from `/api/news`
- No errors from `news-feed.ts`

**Acceptable Warnings**:
- `NEWS_API_KEY not configured` - If you haven't set it up yet

**Error Signs to Investigate**:
- Axios timeout errors - API might be down
- Rate limit errors - Free tier limit exceeded
- JSON parse errors - API response format changed

## Common Issues and Solutions

### Issue: "No hay noticias disponibles"

**Causes**:
1. NEWS_API_KEY not configured
2. API rate limit exceeded
3. Network error
4. Invalid API key

**Solutions**:
1. Add NEWS_API_KEY to .env.local
2. Wait for rate limit reset (daily)
3. Check internet connection
4. Verify API key at newsapi.org

### Issue: Widget not appearing

**Causes**:
1. Component not imported in dashboard
2. Build error
3. Import path incorrect

**Solutions**:
1. Check dashboard page has `<NewsFeedWidget />`
2. Check browser console for errors
3. Verify import path: `@/components/dashboard/NewsFeedWidget`

### Issue: Tabs not working

**Causes**:
1. Tabs component not found
2. Radix UI not installed
3. CSS not loaded

**Solutions**:
1. Verify `src/components/ui/tabs.tsx` exists
2. Check `package.json` has `@radix-ui/react-tabs`
3. Check Tailwind CSS is configured

### Issue: Images not loading

**Causes**:
1. News source doesn't provide images
2. CORS issues
3. Invalid image URLs

**Solutions**:
- This is normal, not all news has images
- Images have `onError` handler to hide broken images
- Some news sources have CORS restrictions

### Issue: TypeScript errors

**Causes**:
1. Missing type definitions
2. Import errors
3. Interface mismatches

**Solutions**:
1. Run `npm install` to ensure dependencies
2. Check imports match file structure
3. Verify NewsArticle interface matches service

### Issue: Cache not working

**Causes**:
1. Server restarted (in-memory cache cleared)
2. Cache duration too short
3. Different cache keys

**Solutions**:
- Normal after server restart
- In-memory cache clears on restart
- For persistent cache, use Redis in production

## Success Criteria

✅ All tests pass
✅ No console errors
✅ News loads within 3 seconds
✅ Cache reduces subsequent load times
✅ Mobile responsive
✅ All tabs work correctly
✅ Articles open in new tab
✅ Images display (when available)
✅ Error states handled gracefully
✅ Authentication required

## Next Steps After Testing

If all tests pass:
1. ✅ Feature is ready for use
2. ✅ Add NEWS_API_KEY to production environment
3. ✅ Consider upgrading NewsAPI plan for production
4. ✅ Monitor API usage in NewsAPI dashboard
5. ✅ Set up error alerts for production

If tests fail:
1. Check this troubleshooting guide
2. Review NEWS_FEED_SETUP.md
3. Check browser console for errors
4. Check server logs for errors
5. Verify API key is valid
