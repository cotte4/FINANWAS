# Ralph Agent - Fix Comparar Empresas Functionality

## Objective
Fix the "comparar empresas" (compare companies) feature that shows "error al cargar datos" (error loading data).

## Problem Analysis

### Root Causes Identified
1. **Same API Endpoint Issues as Search Empresa**
   - Uses `/api/market/stock/{ticker}` endpoint
   - May have path inconsistency with centralized client
   - Authentication issues possible

2. **Error Handling Not Specific Enough**
   - Generic "error al cargar datos" message
   - User doesn't know if it's auth, network, or invalid ticker
   - Need more descriptive error messages

3. **No Retry Logic**
   - Single network failure causes complete failure
   - Should retry transient failures

4. **Multiple API Calls**
   - Comparar makes multiple parallel API calls (up to 3 companies)
   - If one fails, entire comparison might fail
   - Need graceful degradation (show partial results)

### Affected Files
- `src/app/(main)/investigar/comparar/page.tsx` - Main comparison page
- `src/app/api/market/stock/[ticker]/route.ts` - API endpoint

## Requirements

### 1. Fix API Endpoint Issues
- Ensure endpoint path is correct and consistent
- Verify authentication works
- Test with multiple ticker calls in parallel

### 2. Improve Error Handling
Add specific error messages for:
- **401 Unauthorized**: "No estás autenticado. Por favor, iniciá sesión nuevamente."
- **404 Not Found**: "No encontramos la empresa '{ticker}'. Verificá el símbolo."
- **500 Server Error**: "Error al obtener datos de {ticker}. Intentá de nuevo."
- **Network Error**: "Error de conexión. Verificá tu internet."
- **Timeout**: "La solicitud tardó demasiado. Intentá de nuevo."

### 3. Implement Graceful Degradation
- If 1 of 3 companies fails, still show the other 2
- Mark failed company with error indicator
- Allow user to retry just the failed company
- Don't block entire comparison due to one failure

### 4. Add Retry Logic
- Automatically retry failed requests (up to 2 retries)
- Show retry indicator to user
- Exponential backoff for retries

### 5. Better Loading States
- Show which companies are loading
- Show which companies succeeded/failed
- Skeleton loaders for individual company cards
- Progress indicator (e.g., "Cargando 2 de 3 empresas...")

## Implementation Steps

### Step 1: Review Current Implementation
File: `src/app/(main)/investigar/comparar/page.tsx`

Current code structure:
- Line 74: Direct fetch to API
- Line 78: Generic error handling
- Stores companies in state array
- Displays in table/card format

### Step 2: Improve Error Handling
```typescript
// Example improved error handling
try {
  const response = await fetch(`/api/market/stock/${ticker}`)

  if (!response.ok) {
    switch (response.status) {
      case 401:
        throw new Error('No estás autenticado. Iniciá sesión nuevamente.')
      case 404:
        throw new Error(`No encontramos la empresa '${ticker}'.`)
      case 500:
        throw new Error('Error del servidor. Intentá de nuevo.')
      default:
        throw new Error('Error al cargar datos. Intentá de nuevo.')
    }
  }

  const data = await response.json()
  return { success: true, data, ticker }
} catch (error) {
  if (error instanceof TypeError) {
    // Network error
    return {
      success: false,
      error: 'Error de conexión. Verificá tu internet.',
      ticker
    }
  }
  return { success: false, error: error.message, ticker }
}
```

### Step 3: Implement Graceful Degradation
```typescript
// Load companies with partial success handling
const loadCompanies = async (tickers: string[]) => {
  const results = await Promise.allSettled(
    tickers.map(ticker => fetchStockData(ticker))
  )

  const successful = results
    .filter(r => r.status === 'fulfilled' && r.value.success)
    .map(r => r.value.data)

  const failed = results
    .filter(r => r.status === 'rejected' || !r.value.success)
    .map((r, i) => ({ ticker: tickers[i], error: r.reason || r.value.error }))

  // Show successful companies even if some failed
  setCompanies(successful)

  // Show errors for failed companies
  failed.forEach(f => {
    toast.error(`${f.ticker}: ${f.error}`)
  })
}
```

### Step 4: Add Retry Logic
```typescript
// Retry helper with exponential backoff
async function fetchWithRetry(url: string, maxRetries = 2) {
  let lastError

  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await fetch(url)
      if (response.ok) return response

      // Don't retry 4xx errors (client errors)
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`HTTP ${response.status}`)
      }

      lastError = new Error(`HTTP ${response.status}`)
    } catch (error) {
      lastError = error
    }

    // Wait before retry (exponential backoff)
    if (i < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
    }
  }

  throw lastError
}
```

### Step 5: Better UI for Errors
- Show error icon next to failed company in list
- Allow "Reintentar" button for individual companies
- Show loading spinner for each company separately
- Display partial comparison even with failures

### Step 6: Test Thoroughly
1. **Happy path**: Add 3 valid tickers (AAPL, MSFT, GOOGL)
2. **Invalid ticker**: Add 1 invalid + 2 valid (should show 2)
3. **Authentication**: Test when not logged in
4. **Network failure**: Test with slow/offline connection
5. **Mixed results**: Add valid + invalid tickers together
6. **Timeout**: Test with very slow API

## Success Criteria
✅ Comparison works with all valid tickers
✅ Graceful degradation: shows partial results if some fail
✅ Specific error messages for different failure types
✅ Retry logic handles transient failures
✅ Loading states show progress for each company
✅ No console errors during operation
✅ Error messages in Spanish are user-friendly
✅ Users can retry individual failed companies

## Error Scenarios to Handle

| Scenario | Expected Behavior |
|----------|------------------|
| All 3 tickers valid | Shows all 3 in comparison |
| 1 invalid, 2 valid | Shows 2, error toast for invalid |
| All 3 invalid | Shows error, no comparison |
| Network timeout | Shows retry option, helpful message |
| Not authenticated | Redirects to login or shows auth error |
| API rate limit | Shows "Too many requests" message |

## Code Quality Standards
- Follow existing patterns in the codebase
- Use TypeScript properly
- Add proper error handling with try/catch
- Use existing UI components
- Maintain responsive design
- Add helpful comments
- Test all edge cases

## Constraints
- Do NOT modify Yahoo Finance integration
- Do NOT change database schema
- Do NOT break existing functionality
- Use existing UI components from `@/components/ui/`
- Follow Next.js App Router patterns
- Maintain Spanish language

## Commit Message Format
```
fix: Resolve comparar empresas data loading errors

- Improve error handling with specific messages
- Implement graceful degradation for partial failures
- Add retry logic with exponential backoff
- Better loading states for individual companies
- Allow retrying failed companies individually

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

**Important**: This is a critical user-facing feature. Ensure robust error handling and graceful degradation.
