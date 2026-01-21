# Ralph Agent - Portfolio Performance Charts

## Objective
Implement historical portfolio performance tracking with interactive charts to visualize value over time.

## Context
Users currently see only their current portfolio snapshot. They cannot track how their portfolio value has changed over time, making it difficult to measure investment performance and visualize growth trends.

## Requirements

### Phase 1: Database Schema (Priority: HIGH)

#### Create price_history Table
File: `src/lib/db/migrations/016_portfolio_performance_tracking.sql`

```sql
CREATE TABLE portfolio_performance_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  total_value DECIMAL(20, 2) NOT NULL,
  total_cost DECIMAL(20, 2) NOT NULL,
  total_gain_loss DECIMAL(20, 2) NOT NULL,
  gain_loss_percentage DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ARS',
  asset_breakdown JSONB, -- Optional: breakdown by asset
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_snapshot_date UNIQUE (user_id, snapshot_date)
);

CREATE INDEX idx_portfolio_snapshots_user_date ON portfolio_performance_snapshots(user_id, snapshot_date DESC);
CREATE INDEX idx_portfolio_snapshots_date ON portfolio_performance_snapshots(snapshot_date);

COMMENT ON TABLE portfolio_performance_snapshots IS 'Daily portfolio value snapshots for performance tracking';
```

**Alternative Simpler Approach** (if you want to start small):
- Store historical prices in `portfolio_assets` table
- Add `price_snapshots JSONB` column to store array of {date, price} objects
- Calculate portfolio value on-the-fly from historical prices

**Recommended**: Use dedicated snapshots table for scalability.

### Phase 2: Data Collection (Priority: HIGH)

#### Automatic Snapshot Creation
Create background job or API endpoint to capture daily snapshots.

**Option A: Manual Trigger** (start with this)
- Add button "Capturar Snapshot" in portfolio page (admin/testing only)
- API endpoint: `POST /api/portfolio/snapshot`
- Calculates current total value and stores snapshot

**Option B: Automated Daily** (future enhancement)
- Cron job or scheduled function
- Runs daily at market close
- Automatically captures snapshot for all users

**Implementation**:
File: `src/app/api/portfolio/snapshot/route.ts`

```typescript
export async function POST(request: Request) {
  // 1. Authenticate user
  // 2. Get all user assets
  // 3. Calculate current total value (use existing portfolio summary logic)
  // 4. Calculate total cost basis
  // 5. Calculate gain/loss
  // 6. Store snapshot in database
  // 7. Return success
}
```

### Phase 3: Query Functions (Priority: HIGH)

File: `src/lib/db/queries/performance.ts`

Create functions:
- `getPortfolioSnapshots(userId, startDate?, endDate?)` - Get historical snapshots
- `createPortfolioSnapshot(userId)` - Manually create snapshot
- `getPerformanceStats(userId, period)` - Get performance metrics (1D, 1W, 1M, 3M, 1Y, YTD, All)
- `getAssetPerformance(userId, assetId, period)` - Individual asset performance

### Phase 4: Frontend Charts (Priority: HIGH)

#### Install Chart Library
```bash
npm install recharts
```

**Why Recharts?**
- React-first, declarative
- Great documentation
- Responsive by default
- Already used in many Next.js projects

#### Create Performance Chart Component
File: `src/components/portfolio/PerformanceChart.tsx`

**Features**:
- Line chart showing portfolio value over time
- Time period selector (1M, 3M, 6M, 1Y, YTD, All)
- Gain/loss indicator with color (green for positive, red for negative)
- Tooltip showing date, value, gain/loss
- Responsive design (mobile + desktop)
- Loading and empty states

**Chart Types** (implement in order):
1. **Line Chart** - Portfolio value over time (primary)
2. **Area Chart** - Filled area showing growth
3. **Gain/Loss Chart** - Show gains vs losses over time

#### Add to Portfolio Page
File: `src/app/(main)/portfolio/page.tsx`

Add PerformanceChart component at top of portfolio page, above assets table.

### Phase 5: Performance Metrics (Priority: MEDIUM)

#### Create Stats Cards
Display key metrics:
- **Total Return**: `$5,234 (+15.2%)`
- **1 Month**: `+2.3%`
- **3 Months**: `+8.7%`
- **1 Year**: `+15.2%`
- **YTD**: `+12.1%`
- **Best Day**: `+5.1% (2026-01-15)`
- **Worst Day**: `-3.2% (2025-12-20)`

File: `src/components/portfolio/PerformanceMetrics.tsx`

### Phase 6: Export & Analysis (Priority: LOW)

**Features**:
- Export performance data to CSV
- Download chart as PNG
- Compare with benchmark (optional)

## Implementation Strategy

### Iteration 1: Database + Manual Snapshot
1. Create migration 016
2. Update database types
3. Create POST /api/portfolio/snapshot endpoint
4. Test creating manual snapshot
5. Verify data in database

### Iteration 2: Query Functions
1. Create performance.ts query functions
2. Create GET /api/portfolio/performance endpoint
3. Test retrieving snapshot data

### Iteration 3: Basic Chart
1. Install recharts
2. Create PerformanceChart component (basic line chart)
3. Add to portfolio page
4. Display sample data or real data if snapshots exist
5. Add time period selector

### Iteration 4: Polish & Metrics
1. Add performance metrics cards
2. Improve chart styling
3. Add tooltips and interactions
4. Empty state (no snapshots yet)
5. Loading states

### Iteration 5: Testing & Documentation
1. Test with various data ranges
2. Test edge cases (no data, single snapshot, etc.)
3. Create PORTFOLIO_PERFORMANCE.md documentation
4. Update features_future.md

## Success Criteria
✅ Database migration created and schema valid
✅ Manual snapshot creation works via API
✅ Query functions return correct data
✅ Recharts installed and working
✅ Line chart displays portfolio value over time
✅ Time period selector changes data range
✅ Performance metrics show accurate calculations
✅ Responsive design works on mobile
✅ Empty state when no snapshots exist
✅ Loading states during data fetch
✅ Documentation created

## Technical Specifications

### Snapshot Frequency
**Start**: Manual snapshots only
**Future**: Daily automatic snapshots

### Data Retention
- Keep all snapshots (no deletion policy initially)
- Archive old snapshots after 2 years (future)

### Performance Calculation
```typescript
// Total return
const totalReturn = ((currentValue - totalCost) / totalCost) * 100

// Period return
const periodReturn = ((endValue - startValue) / startValue) * 100
```

### Chart Configuration
```typescript
{
  responsive: true,
  aspectRatio: 16/9, // Desktop
  aspectRatio: 4/3,  // Mobile
  colors: {
    positive: '#10b981', // green
    negative: '#ef4444', // red
    neutral: '#6366f1',  // primary
  }
}
```

## Code Quality Standards
- Follow existing patterns
- Use TypeScript properly
- Add proper error handling
- Responsive design
- Accessible charts (ARIA labels)
- Performance optimization (lazy loading, memoization)

## Constraints
- Do NOT break existing portfolio functionality
- Do NOT modify portfolio summary calculations
- Use existing UI components
- Follow Next.js patterns
- Maintain Spanish language

## Future Enhancements (Post-MVP)
- Benchmark comparison (vs S&P 500, Merval, etc.)
- Asset-level performance charts
- Sector allocation over time
- Dividend income chart
- Automated daily snapshots
- Performance notifications

## Commit Message Format
```
feat: Add portfolio performance charts with historical tracking

- Create portfolio_performance_snapshots table (migration 016)
- Implement manual snapshot creation API endpoint
- Add performance query functions (getSnapshots, getPerformanceStats)
- Install recharts library for data visualization
- Create PerformanceChart component with line chart
- Add time period selector (1M, 3M, 6M, 1Y, YTD, All)
- Display performance metrics cards (total return, period returns)
- Add responsive design for mobile and desktop
- Include empty states and loading indicators
- Create PORTFOLIO_PERFORMANCE.md documentation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

**Important**: Focus on getting a basic working version first (Iterations 1-3), then polish. The key is to have users capture snapshots and visualize them, even if manually triggered initially.
