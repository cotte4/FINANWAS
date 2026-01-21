# Ralph Agent - Fix Search Empresa Functionality

## Objective
Fix the "buscar empresa" (search company) feature in the investigar section that is currently not working.

## Problem Analysis

### Root Causes Identified
1. **API Endpoint Path Mismatch** (PRIMARY ISSUE)
   - Frontend pages call: `/api/market/stock/{ticker}` (singular)
   - Centralized API client uses: `/api/market/stocks/{ticker}` (plural with 's')
   - This inconsistency causes requests to fail

2. **Direct fetch() Calls Instead of Centralized Client**
   - `investigar/scorecard/page.tsx` line 80 uses `fetch()` directly
   - `investigar/comparar/page.tsx` line 74 uses `fetch()` directly
   - Should use centralized client from `/lib/api/client.ts` for consistency

3. **Potential Authentication Issues**
   - API endpoint requires JWT token from cookies
   - Need to verify authentication is working correctly

### Affected Files
- `src/app/(main)/investigar/scorecard/page.tsx` - Line 80 (direct fetch)
- `src/app/(main)/investigar/comparar/page.tsx` - Line 74 (direct fetch)
- `src/lib/api/client.ts` - Line 395 (references `/api/market/stocks/`)
- `src/app/api/market/stock/[ticker]/route.ts` - API endpoint implementation

## Requirements

### 1. Fix API Endpoint Path Consistency
**Choose ONE consistent path** and update all references:
- **Option A**: Use `/api/market/stock/{ticker}` (singular) everywhere
- **Option B**: Use `/api/market/stocks/{ticker}` (plural) everywhere

**Recommended**: Option A (singular) since the endpoint file is already named `stock/[ticker]/route.ts`

### 2. Update Frontend Pages
- Update `scorecard/page.tsx` to use consistent endpoint
- Update `comparar/page.tsx` to use consistent endpoint
- Consider using centralized API client instead of direct fetch for better error handling

### 3. Verify Authentication
- Ensure JWT token is properly passed in requests
- Add better error messages for authentication failures
- Test with authenticated and unauthenticated users

### 4. Improve Error Handling
- Add specific error messages for:
  - Authentication failures (401)
  - Ticker not found (404)
  - Yahoo Finance API errors (500)
  - Network timeouts
- Display user-friendly Spanish error messages

### 5. Add Loading States
- Ensure loading indicators show during API calls
- Disable buttons/inputs while loading
- Show spinner or skeleton UI

## Implementation Steps

### Step 1: Fix Endpoint Path
1. Review current endpoint: `src/app/api/market/stock/[ticker]/route.ts`
2. Decide on consistent naming (recommend singular: `stock`)
3. Update centralized client (`src/lib/api/client.ts` line 395) to use `/api/market/stock/`
4. Verify all references use the same path

### Step 2: Update Scorecard Page
File: `src/app/(main)/investigar/scorecard/page.tsx`

Current code (line 80):
```typescript
const response = await fetch(`/api/market/stock/${ticker}`)
```

Improvements:
- Verify path is correct
- Add proper error handling for different status codes
- Consider using centralized client for consistency
- Add retry logic for network failures
- Display specific error messages

### Step 3: Update Comparar Page
File: `src/app/(main)/investigar/comparar/page.tsx`

Current code (line 74):
```typescript
const response = await fetch(`/api/market/stock/${ticker}`)
```

Same improvements as scorecard page.

### Step 4: Test Thoroughly
1. Test with valid tickers (AAPL, MSFT, GOOGL)
2. Test with invalid tickers (should show 404 error)
3. Test with unauthenticated user (should show 401 or redirect)
4. Test network timeout scenarios
5. Test Yahoo Finance API failures

## Success Criteria
✅ API endpoint path is consistent across all files
✅ Scorecard search works with valid tickers
✅ Comparar search works with valid tickers
✅ Authentication errors show user-friendly messages
✅ Invalid tickers show appropriate error messages
✅ Loading states display correctly
✅ No console errors during normal operation
✅ Error handling works for all failure scenarios

## Technical Details

### Current API Endpoint Behavior
File: `src/app/api/market/stock/[ticker]/route.ts`

**Authentication**: Requires JWT token from cookies
**Returns**: Combined quote + stats from Yahoo Finance
**Response format**:
```json
{
  "quote": { "ticker": "AAPL", "price": 150.5, ... },
  "stats": { "peRatio": 28.5, "pbRatio": 35.2, ... }
}
```

**Error responses**:
- 400: Missing ticker parameter
- 401: Not authenticated
- 404: Ticker not found
- 500: Yahoo Finance API error

### Yahoo Finance Integration
Uses `src/lib/api/yahoo-finance.ts`:
- `getQuote(ticker)` - Gets current price and change
- `getKeyStats(ticker)` - Gets financial metrics
- Implements 15-minute caching
- Returns null if ticker doesn't exist

## Code Quality Standards
- Follow existing patterns in the codebase
- Use TypeScript properly (no `any` types)
- Add proper error handling with try/catch
- Use existing UI components for error states
- Maintain responsive design
- Add comments for complex logic
- Test edge cases

## Constraints
- Do NOT modify Yahoo Finance integration
- Do NOT change database schema
- Do NOT break existing functionality
- Use existing UI components from `@/components/ui/`
- Follow Next.js 15+ App Router patterns
- Maintain Spanish language for user-facing text

## Commit Message Format
```
fix: Resolve search empresa functionality in investigar

- Fix API endpoint path inconsistency (stock vs stocks)
- Update scorecard and comparar pages to use correct endpoint
- Improve error handling with user-friendly messages
- Add better loading states
- Test with valid and invalid tickers

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

**Important**: This is a critical user-facing bug. Test thoroughly before considering complete.
