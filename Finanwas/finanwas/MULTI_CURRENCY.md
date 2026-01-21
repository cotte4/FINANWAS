# Multi-Currency Support

**Status**: âœ… Implemented
**Date**: 2026-01-21
**Feature**: Automatic currency conversion for portfolio aggregation

---

## Overview

Finanwas now supports multi-currency portfolios with automatic conversion to the user's preferred base currency. Users can hold assets in different currencies (USD, ARS, EUR, BRL, GBP, JPY, CAD, CHF, CNY, MXN) and see a unified portfolio summary in their preferred currency.

## Features

### 1. User Preferences
- **Preferred Currency Selection**: Users can choose their base currency from the profile page
- **10 Supported Currencies**: ARS, USD, EUR, BRL, GBP, JPY, CAD, CHF, CNY, MXN
- **Persistent Setting**: Preference is saved in the database and applies across all sessions

### 2. Automatic Conversion
- **Real-time Exchange Rates**: Fetched from exchangerate-api.com (free tier)
- **Server-side Caching**: Exchange rates cached for 1 hour to minimize API calls
- **Portfolio Aggregation**: All assets automatically converted to base currency for summary
- **Original Currency Preservation**: Individual assets maintain their original purchase currency

### 3. User Interface
- **Currency Selector**: Profile page has a visual currency selector with all supported currencies
- **Portfolio Summary**: Shows total value, invested amount, and gains/losses in preferred currency
- **Asset Details**: Individual assets display values in their original currency
- **Clear Labeling**: Currency symbols and codes displayed throughout

## Architecture

### Database Schema

```sql
-- Migration 012: Multi-Currency Support
ALTER TABLE user_profiles
ADD COLUMN preferred_currency VARCHAR(10) DEFAULT 'USD' NOT NULL;

CREATE INDEX idx_user_profiles_preferred_currency ON user_profiles(preferred_currency);
```

### Exchange Rate Service

**File**: `src/lib/services/exchange-rates.ts`

Key functions:
- `getExchangeRates()`: Fetches all exchange rates (USD base)
- `convertCurrency(amount, from, to)`: Converts between any two currencies
- `convertMultipleCurrencies(amounts, to)`: Batch conversion for portfolio aggregation
- `getExchangeRate(from, to)`: Gets rate between two currencies

**Caching Strategy**:
- In-memory cache with 1-hour TTL
- Automatic cache invalidation after expiration
- Fallback to original amounts if API fails

### API Endpoints

#### GET /api/market/exchange-rates
Returns all exchange rates or specific conversion.

**Query Parameters**:
- `from`: Source currency (optional)
- `to`: Target currency (optional)
- `amount`: Amount to convert (optional, defaults to 1)

**Examples**:
```bash
# Get all rates
GET /api/market/exchange-rates

# Get specific rate
GET /api/market/exchange-rates?from=USD&to=ARS

# Convert amount
GET /api/market/exchange-rates?from=EUR&to=USD&amount=100
```

**Response**:
```json
{
  "base": "USD",
  "rates": {
    "ARS": 850.50,
    "EUR": 0.92,
    "BRL": 5.15,
    ...
  },
  "timestamp": "2026-01-21T10:30:00Z"
}
```

#### Updated: GET /api/portfolio
Now includes preferred currency in summary.

**Response**:
```json
{
  "assets": [...],
  "summary": {
    "totalValue": 15000.50,
    "totalInvested": 12000.00,
    "totalGainLoss": 3000.50,
    "totalGainLossPercent": 25.0,
    "currency": "USD"
  }
}
```

#### Updated: PATCH /api/profile
Now supports updating preferred currency.

**Request Body**:
```json
{
  "preferred_currency": "EUR"
}
```

### Database Queries

**File**: `src/lib/db/queries/portfolio.ts`

Updated `getPortfolioSummary()`:
- Now accepts `baseCurrency` parameter
- Converts all asset values to base currency
- Returns summary with currency information

**File**: `src/lib/db/queries/user-preferences.ts` (new)
- `getUserPreferredCurrency(userId)`: Gets user's preferred currency
- `updateUserPreferredCurrency(userId, currency)`: Updates preference

## Usage

### For Users

1. **Set Preferred Currency**:
   - Go to Profile page
   - Scroll to "Moneda Preferida" section
   - Click on desired currency button
   - Portfolio summary updates automatically

2. **View Portfolio**:
   - Portfolio summary shows totals in preferred currency
   - Individual assets maintain original currency
   - Currency symbol and code displayed clearly

### For Developers

#### Convert Currency in Code

```typescript
import { convertCurrency } from '@/lib/services/exchange-rates';

// Convert 100 ARS to USD
const usdAmount = await convertCurrency(100, 'ARS', 'USD');

// Convert portfolio assets to user's preferred currency
import { convertMultipleCurrencies } from '@/lib/services/exchange-rates';

const amounts = [
  { amount: 1000, currency: 'USD' },
  { amount: 50000, currency: 'ARS' },
  { amount: 500, currency: 'EUR' }
];

const totalInUSD = await convertMultipleCurrencies(amounts, 'USD');
```

#### Get User's Preferred Currency

```typescript
import { getUserPreferredCurrency } from '@/lib/db/queries/user-preferences';

const currency = await getUserPreferredCurrency(userId);
// Returns: 'USD', 'ARS', 'EUR', etc.
```

## Supported Currencies

| Code | Name | Symbol | Region |
|------|------|--------|--------|
| ARS | Peso Argentino | $ | Argentina |
| USD | Dólar Estadounidense | US$ | United States |
| EUR | Euro | € | European Union |
| BRL | Real Brasileño | R$ | Brazil |
| GBP | Libra Esterlina | £ | United Kingdom |
| JPY | Yen Japonés | ¥ | Japan |
| CAD | Dólar Canadiense | CA$ | Canada |
| CHF | Franco Suizo | CHF | Switzerland |
| CNY | Yuan Chino | ¥ | China |
| MXN | Peso Mexicano | MX$ | Mexico |

## Performance Considerations

### Caching Strategy
- **Exchange Rates**: Cached for 1 hour server-side
- **HTTP Headers**: `Cache-Control: private, max-age=3600` for browser caching
- **Minimal API Calls**: Free tier supports 1500 requests/month (averaging ~50/day)

### API Rate Limits
- **Provider**: exchangerate-api.com
- **Free Tier**: 1500 requests/month
- **Expected Usage**: ~720 requests/month (24 requests/day with 1-hour cache)
- **Headroom**: 52% utilization, plenty of margin

### Fallback Strategy
If exchange rate API fails:
1. Return amounts in original currency
2. Log error for monitoring
3. Application continues to function
4. Users see original values without conversion

## Future Improvements

1. **Historical Exchange Rates**
   - Track historical rates for accurate performance calculation
   - Store rates in database for reliability

2. **Custom Exchange Rates**
   - Allow users to input custom rates (e.g., blue dollar in Argentina)
   - Override API rates with manual rates

3. **More Currencies**
   - Add more Latin American currencies (CLP, COP, UYU, etc.)
   - Add cryptocurrency support (BTC, ETH, USDT)

4. **Exchange Rate Charts**
   - Visualize currency trends over time
   - Show impact of currency fluctuations on portfolio

5. **Multi-Currency Assets**
   - Support assets priced in multiple currencies
   - Handle currency hedging scenarios

## Testing

### Manual Testing Checklist

- [x] Set preferred currency in profile
- [x] View portfolio summary in different currencies
- [x] Add assets in different currencies
- [x] Verify conversions are accurate
- [x] Test with exchange rate API down (fallback)
- [x] Verify caching works (check API call frequency)

### Test Cases

```typescript
// Test currency conversion
const result = await convertCurrency(100, 'USD', 'ARS');
expect(result).toBeGreaterThan(100); // ARS should be more than USD

// Test same currency
const same = await convertCurrency(100, 'USD', 'USD');
expect(same).toBe(100);

// Test portfolio aggregation
const summary = await getPortfolioSummary(userId, 'EUR');
expect(summary.currency).toBe('EUR');
expect(summary.totalValue).toBeGreaterThan(0);
```

## Migration Guide

### For Existing Users

No action required! The system automatically:
1. Sets default preferred currency to USD
2. Converts existing portfolios
3. Displays in USD until user changes preference

### For Existing Data

Run migration:
```sql
-- Run migration 012
psql -d finanwas < src/lib/db/migrations/012_multi_currency_support.sql
```

## Troubleshooting

### Issue: Exchange rates not updating

**Solution**: Clear the cache manually
```typescript
import { clearExchangeRateCache } from '@/lib/services/exchange-rates';
clearExchangeRateCache();
```

### Issue: Conversion seems wrong

**Check**:
1. Verify exchange rate API is responding
2. Check cache timestamp
3. Verify currency codes are correct (must be uppercase)

### Issue: API rate limit exceeded

**Solution**:
1. Increase cache duration (currently 1 hour)
2. Consider upgrading to paid tier
3. Implement database caching for rates

## References

- **Exchange Rate API**: https://exchangerate-api.com
- **Currency Codes**: ISO 4217 standard
- **Implementation**: Feature #2 from features_future.md

---

**Implementation Complete** âœ…
All multi-currency features are production-ready and fully tested.
