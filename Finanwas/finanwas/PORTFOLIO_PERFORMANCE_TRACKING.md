# Portfolio Performance Tracking - Implementation Guide

## Overview
This document describes the Portfolio Performance Tracking feature, which allows users to track their portfolio value over time through snapshots and visualize performance with interactive charts.

## Features Implemented

### 1. Database Schema
- **Table**: `portfolio_performance_snapshots`
- **Location**: `src/lib/db/migrations/016_portfolio_performance_tracking.sql`
- **Purpose**: Stores daily portfolio value snapshots

**Schema**:
```sql
CREATE TABLE portfolio_performance_snapshots (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  snapshot_date DATE UNIQUE per user,
  total_value DECIMAL(20, 2),
  total_cost DECIMAL(20, 2),
  total_gain_loss DECIMAL(20, 2),
  gain_loss_percentage DECIMAL(10, 2),
  currency TEXT,
  asset_breakdown JSONB,
  created_at TIMESTAMPTZ
);
```

### 2. Service Layer
- **File**: `src/lib/services/portfolio-performance.ts`
- **Functions**:
  - `createPortfolioSnapshot()` - Captures current portfolio state
  - `getPortfolioSnapshots()` - Retrieves historical snapshots
  - `getLatestSnapshot()` - Gets most recent snapshot
  - `getPerformanceChartData()` - Formats data for charts
  - `cleanupOldSnapshots()` - Manages retention

### 3. API Endpoints

#### POST /api/portfolio/snapshot
Creates a new portfolio snapshot.

**Request** (optional):
```json
{
  "date": "2024-01-15"  // Optional, defaults to today
}
```

**Response**:
```json
{
  "snapshot": {
    "id": "uuid",
    "user_id": "uuid",
    "snapshot_date": "2024-01-15",
    "total_value": 15000.00,
    "total_cost": 12000.00,
    "total_gain_loss": 3000.00,
    "gain_loss_percentage": 25.00,
    "currency": "ARS",
    "asset_breakdown": {...},
    "created_at": "2024-01-15T10:30:00Z"
  },
  "message": "Snapshot creado exitosamente"
}
```

#### GET /api/portfolio/performance
Retrieves historical performance data.

**Query Parameters**:
- `period`: '1M' | '3M' | '6M' | '1Y' | 'ALL' (default: 'ALL')

**Response**:
```json
{
  "period": "ALL",
  "data": [
    {
      "date": "2024-01-15",
      "value": 15000.00,
      "cost": 12000.00,
      "gainLoss": 3000.00,
      "gainLossPercentage": 25.00
    }
  ],
  "latestSnapshot": {...},
  "hasData": true
}
```

### 4. Frontend Components

#### PortfolioPerformanceChart
- **File**: `src/components/portfolio/PortfolioPerformanceChart.tsx`
- **Features**:
  - Interactive line chart showing portfolio value vs. invested capital
  - Time period selector (1M, 3M, 6M, 1Y, ALL)
  - "Capturar Snapshot" button for manual snapshots
  - Performance statistics cards
  - Empty state with call-to-action
  - Mobile responsive design

**Usage**:
```tsx
<PortfolioPerformanceChart
  baseCurrency="ARS"
  onSnapshotCreated={() => console.log('Snapshot created!')}
/>
```

### 5. Integration
The chart is integrated into the Portfolio page at `src/app/(main)/portfolio/page.tsx`.

## How to Use

### 1. Run the Migration
Apply the database migration to create the snapshots table:
```bash
# Using your database migration tool
psql -d your_database -f src/lib/db/migrations/016_portfolio_performance_tracking.sql
```

Or if using Supabase:
```bash
# Run migration via Supabase CLI or dashboard
```

### 2. Capture Snapshots
Users can capture snapshots in two ways:

**Manual** (via UI):
1. Navigate to Portfolio page
2. Scroll to "Rendimiento Histórico" section
3. Click "Capturar Snapshot" button

**Programmatic** (via API):
```typescript
const response = await fetch('/api/portfolio/snapshot', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ date: '2024-01-15' }) // Optional
});
```

### 3. View Performance
The chart automatically loads when the Portfolio page is accessed and displays:
- Line chart of portfolio value over time
- Capital invested baseline
- Performance metrics (total return, max/min values, snapshot count)
- Interactive time period selection

## Data Flow

```
User Portfolio Assets
       ↓
getPortfolioSummary()
       ↓
createPortfolioSnapshot()
       ↓
portfolio_performance_snapshots table
       ↓
getPerformanceChartData()
       ↓
PortfolioPerformanceChart component
       ↓
User sees interactive chart
```

## Future Enhancements

### Phase 2: Automated Snapshots
- Daily cron job to capture snapshots automatically
- Email notifications with performance summaries
- Configurable snapshot frequency

**Implementation approach**:
```typescript
// Create API route: /api/cron/portfolio-snapshots
export async function GET(request: NextRequest) {
  // Verify cron secret
  if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get all active users
  const users = await getActiveUsers();

  // Create snapshot for each user
  for (const user of users) {
    await createPortfolioSnapshot(user.id, user.preferred_currency);
  }

  return NextResponse.json({ success: true, count: users.length });
}
```

**Vercel Cron** (vercel.json):
```json
{
  "crons": [
    {
      "path": "/api/cron/portfolio-snapshots",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### Phase 3: Advanced Analytics
- Asset-level performance tracking
- Sector/type performance comparison
- Return distribution histograms
- Sharpe ratio and volatility metrics
- Benchmark comparisons (e.g., S&P 500, MERVAL)

### Phase 4: Exports and Reports
- PDF performance reports
- CSV export of historical data
- Email digest of monthly performance

## Testing

### Manual Testing Checklist
- [ ] Create a snapshot via UI
- [ ] Verify snapshot appears in database
- [ ] View chart with different time periods
- [ ] Create multiple snapshots over different dates
- [ ] Verify chart displays correctly with multiple data points
- [ ] Test empty state (no snapshots)
- [ ] Test mobile responsive design
- [ ] Verify performance stats calculations

### API Testing
```bash
# Create snapshot
curl -X POST http://localhost:3000/api/portfolio/snapshot \
  -H "Cookie: auth-token=YOUR_TOKEN"

# Get performance data
curl http://localhost:3000/api/portfolio/performance?period=1M \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

## Troubleshooting

### Issue: Snapshot not appearing in chart
**Solution**: Check that:
1. Snapshot was created successfully (check database)
2. User ID matches authenticated user
3. Chart is fetching with correct period parameter

### Issue: Chart shows "No data available"
**Solution**:
1. Create at least one snapshot
2. Verify API endpoint returns `hasData: true`
3. Check browser console for fetch errors

### Issue: Performance calculations incorrect
**Solution**:
1. Verify `getPortfolioSummary()` returns accurate values
2. Check currency conversion is working
3. Ensure asset prices are up to date

## Technical Notes

### Currency Handling
- All snapshots are stored in user's preferred currency
- Currency conversion happens during snapshot creation
- Charts display values in the snapshot currency

### Performance Optimization
- Snapshots are indexed by (user_id, snapshot_date) for fast queries
- Chart data is pre-calculated during snapshot creation
- Frontend caches performance data per period

### Data Retention
- Default retention: 365 days
- Use `cleanupOldSnapshots()` to manage old data
- Consider archiving instead of deleting for long-term analysis

## Security Considerations

1. **Authentication**: All endpoints require valid auth token
2. **Authorization**: Users can only access their own snapshots
3. **Input Validation**: Date inputs are validated
4. **SQL Injection**: Using parameterized queries via Supabase client
5. **Rate Limiting**: Consider adding rate limits to snapshot creation

## Performance Metrics

Expected performance:
- Snapshot creation: < 500ms
- Chart data fetch: < 300ms (for 365 data points)
- Chart rendering: < 200ms

## License
Part of the Finanwas application.
