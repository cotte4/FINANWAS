# Dividend Tracking System

## Overview

The Dividend Tracking feature allows users to record, monitor, and analyze dividend payments received from their portfolio assets. This is particularly valuable for income-focused investors who rely on dividend income for cash flow or reinvestment.

## Features

### 1. Dividend Payment Recording
- **Manual Entry**: Users can manually record dividend payments received from their assets
- **Payment Types**:
  - **Cash**: Standard cash dividend payments
  - **Stock**: Stock dividends (additional shares)
  - **DRIP**: Dividend Reinvestment Plan (automatic reinvestment)
- **Detailed Information**:
  - Payment date
  - Amount per share
  - Total amount received
  - Currency
  - Shares received (for stock dividends/DRIP)
  - Withholding tax
  - Reinvestment status
  - Notes

### 2. Dividend Summary Statistics
- **Total Historical Dividends**: All-time dividend income
- **Year-to-Date (YTD)**: Dividends received in the current year
- **Last Year**: Dividends received in the previous year
- **Total Reinvested**: Amount of dividends that were reinvested
- **Average per Payment**: Mean dividend payment amount
- **Total Withholding Tax**: Tax withheld at source

### 3. Dividend Analytics
- **By Asset**: View total dividends received from each asset
- **By Month**: Monthly dividend income breakdown
- **Payment Count**: Number of dividend payments per asset
- **Last Payment Date**: Most recent dividend payment for each asset

### 4. Asset Integration
- Dividend yield tracking per asset
- Dividend frequency (quarterly, monthly, annual, semi-annual)
- Next expected dividend date
- Last dividend amount per share

## Database Schema

### Table: `dividend_payments`

Stores individual dividend payment records.

```sql
CREATE TABLE dividend_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES portfolio_assets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL,
  amount_per_share DECIMAL(20, 6) NOT NULL,
  total_amount DECIMAL(20, 2) NOT NULL,
  currency TEXT NOT NULL,
  payment_type TEXT NOT NULL DEFAULT 'cash',  -- cash, stock, drip
  shares_received DECIMAL(20, 8),  -- For stock dividends or DRIP
  reinvested BOOLEAN DEFAULT false,
  withholding_tax DECIMAL(20, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Extended: `portfolio_assets`

Added dividend-related fields to the portfolio_assets table:

```sql
ALTER TABLE portfolio_assets
  ADD COLUMN dividend_yield DECIMAL(5, 2),  -- Annual dividend yield %
  ADD COLUMN dividend_frequency TEXT,  -- quarterly, monthly, annual, semi-annual
  ADD COLUMN next_dividend_date DATE,  -- Expected next dividend payment
  ADD COLUMN last_dividend_amount DECIMAL(20, 6);  -- Last dividend per share
```

## API Endpoints

### `GET /api/dividends`
Get all dividend payments for the authenticated user.

**Query Parameters:**
- `summary` (boolean, optional): Include summary statistics
- `currency` (string, optional): Base currency for summary (default: USD)

**Response:**
```json
{
  "dividends": [...],
  "summary": {
    "totalDividends": 1250.00,
    "totalDividendsYTD": 450.00,
    "totalDividendsLastYear": 500.00,
    "totalWithholdingTax": 125.00,
    "averageDividendPerPayment": 62.50,
    "currency": "USD",
    "dividendsByAsset": {...},
    "dividendsByMonth": {...},
    "totalReinvested": 200.00
  }
}
```

### `POST /api/dividends`
Create a new dividend payment record.

**Request Body:**
```json
{
  "asset_id": "uuid",
  "payment_date": "2024-03-15",
  "amount_per_share": 0.50,
  "total_amount": 50.00,
  "currency": "USD",
  "payment_type": "cash",
  "shares_received": null,
  "reinvested": false,
  "withholding_tax": 5.00,
  "notes": "Q1 2024 dividend"
}
```

**Response:**
```json
{
  "dividend": {
    "id": "uuid",
    "asset_id": "uuid",
    "user_id": "uuid",
    "payment_date": "2024-03-15",
    "amount_per_share": 0.50,
    "total_amount": 50.00,
    "currency": "USD",
    "payment_type": "cash",
    "shares_received": null,
    "reinvested": false,
    "withholding_tax": 5.00,
    "notes": "Q1 2024 dividend",
    "created_at": "2024-03-15T10:00:00Z",
    "updated_at": "2024-03-15T10:00:00Z"
  }
}
```

### `GET /api/dividends/:id`
Get a specific dividend payment.

### `PATCH /api/dividends/:id`
Update a dividend payment.

### `DELETE /api/dividends/:id`
Delete a dividend payment.

## Usage Guide

### Recording a Dividend Payment

1. Navigate to your Portfolio page
2. The "Dividend Tracking" section will appear below your asset list (if you have assets)
3. Click "Registrar Dividendo" (Register Dividend)
4. Fill in the dividend information:
   - **Select Asset**: Choose which asset paid the dividend
   - **Payment Date**: When the dividend was paid
   - **Dividend per Share**: Amount paid per share (auto-calculates total)
   - **Total Received**: Total dividend amount (auto-filled based on shares owned)
   - **Currency**: Automatically set to asset's currency
   - **Payment Type**: Cash, Stock, or DRIP
   - **Withholding Tax** (optional): Tax withheld at source
   - **Reinvested**: Check if dividend was automatically reinvested
   - **Notes** (optional): Additional information
5. Click "Guardar Dividendo" (Save Dividend)

### Viewing Dividend Summary

The dividend summary displays:
- **Total Histórico**: All-time dividend income
- **Este Año**: Dividends received in the current year
- **Año Anterior**: Dividends received last year
- **Reinvertido**: Total amount reinvested

### Recent Dividends List

Shows the 10 most recent dividend payments with:
- Asset name/ticker
- Payment type (Cash, Stock, DRIP)
- Reinvestment status
- Payment date
- Amount per share
- Total amount
- Withholding tax (if any)
- Delete button

### Dividends by Asset

Groups dividends by asset showing:
- Asset name/ticker
- Total dividend payments count
- Last payment date
- Total amount received from that asset

## Best Practices

### 1. Accurate Record Keeping
- Record dividends as soon as they're received
- Include withholding tax information for accurate tax reporting
- Add notes for context (e.g., "Special one-time dividend", "Q1 2024 regular dividend")

### 2. Currency Management
- Dividends are recorded in the asset's original currency
- Summary statistics convert to your preferred base currency
- This allows accurate tracking across multi-currency portfolios

### 3. Reinvestment Tracking
- Mark dividends as "reinvested" for dividends automatically used to purchase more shares
- For DRIP (Dividend Reinvestment Plans), record the number of shares received
- This helps track how your position grows through dividend reinvestment

### 4. Tax Planning
- Track withholding tax for foreign dividends
- Use the total withholding tax statistic for tax reporting
- Export dividend data for tax preparation (future feature)

### 5. Income Analysis
- Monitor YTD dividends to track income progress
- Compare current year to last year for growth trends
- View dividends by asset to identify top income producers

## Future Enhancements

### Planned Features
1. **Automatic Dividend Detection**
   - Integration with market data APIs to detect upcoming dividends
   - Notifications for expected dividend payments
   - Auto-fill dividend amounts based on historical data

2. **Dividend Forecasting**
   - Projected annual dividend income based on holdings
   - Dividend growth rate tracking
   - Forward dividend yield calculations

3. **Tax Optimization**
   - Dividend tax calculator
   - Foreign tax credit tracking
   - Tax-efficient dividend withdrawal strategies

4. **Advanced Analytics**
   - Dividend growth charts over time
   - Yield on cost calculations
   - Dividend payout ratio monitoring
   - Dividend sustainability metrics

5. **Portfolio Optimization**
   - Dividend diversification analysis
   - Income stability metrics
   - Comparison to dividend benchmarks

6. **Data Export**
   - CSV export for dividend history
   - Tax-ready dividend reports
   - Integration with tax software

## Technical Architecture

### Database Layer
- `src/lib/db/migrations/014_dividend_tracking.sql` - Schema migration
- `src/lib/db/queries/dividends.ts` - Database queries and utilities

### API Layer
- `src/app/api/dividends/route.ts` - List and create dividends
- `src/app/api/dividends/[id]/route.ts` - Get, update, delete individual dividend

### Type Definitions
- `src/types/database.ts` - DividendPayment interface and Database types

### UI Components
- `src/components/portfolio/DividendTracker.tsx` - Main dividend tracking component
- `src/components/portfolio/AddDividendModal.tsx` - Dividend entry form

### Integration Points
- Portfolio page (`src/app/(main)/portfolio/page.tsx`)
- Appears below asset list when user has assets
- Uses baseCurrency from user preferences for summary calculations

## Security Considerations

### Authorization
- All dividend operations require authentication
- Dividends are scoped to user_id
- Users can only access/modify their own dividend records
- Asset ownership verified before creating dividend records

### Data Validation
- Amount validations (must be non-negative)
- Date validations
- Currency code validations (3-character ISO codes)
- Asset existence verification

### Privacy
- Dividend data is private to each user
- No sharing or comparison features (yet)
- All queries filtered by user_id

## Performance Optimization

### Database Indexes
- `idx_dividend_payments_asset_id` - Fast asset dividend lookups
- `idx_dividend_payments_user_id` - Fast user dividend queries
- `idx_dividend_payments_payment_date` - Chronological sorting
- `idx_dividend_payments_user_date` - Combined user + date queries
- `idx_dividend_payments_user_asset_date` - Composite index for complex queries

### Caching Opportunities
- Dividend summaries could be cached (currently calculated on-demand)
- Asset dividend totals could be materialized
- Monthly aggregations could be pre-computed

## Troubleshooting

### Common Issues

**Q: My dividend total doesn't match the calculation**
- A: Check if withholding tax is included. The total_amount should be the net amount received, while amount_per_share * quantity gives the gross amount before tax.

**Q: I can't see the dividend tracking section**
- A: Dividend tracking only appears when you have assets in your portfolio. Add an asset first.

**Q: Currency doesn't match my asset**
- A: The currency is automatically set to match the asset's currency and updates when you select a different asset.

**Q: How do I handle fractional shares from DRIP?**
- A: Use the "Shares Received" field for stock/DRIP payments. It supports up to 8 decimal places for accurate fractional share tracking.

## Support

For issues, questions, or feature requests related to dividend tracking, please open an issue on the repository.
