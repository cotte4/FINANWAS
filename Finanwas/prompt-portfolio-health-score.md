# Ralph Agent - Portfolio Health Score

## Objective
Implement an algorithmic portfolio health score (0-100) that evaluates portfolio quality based on diversification, risk metrics, and investment best practices.

## Context
Users need a simple, at-a-glance metric to understand if their portfolio is healthy. A score from 0-100 provides immediate feedback on portfolio quality, with specific recommendations for improvement.

## Requirements

### Score Components (Weighted Algorithm)

The health score should be calculated from multiple factors:

#### 1. Diversification Score (Weight: 35%)
- **Asset Count**: Penalty if < 5 assets, bonus if 10-20 assets
- **Sector Diversity**: Number of different sectors (Technology, Finance, etc.)
- **Asset Type Diversity**: Stocks, ETFs, Bonds, etc.
- **Concentration Risk**: No single asset should be > 30% of portfolio

**Calculation**:
```typescript
diversificationScore = (
  (assetCountScore * 0.4) +
  (sectorDiversityScore * 0.3) +
  (assetTypeDiversityScore * 0.2) +
  (concentrationScore * 0.1)
) * 35
```

#### 2. Risk Management Score (Weight: 30%)
- **Volatility Exposure**: Based on asset volatility (beta if available)
- **Risk Tolerance Alignment**: Matches user's stated risk tolerance from profile
- **Stop Loss Coverage**: Percentage of assets with protective limits (future)

**Calculation**:
```typescript
riskScore = (
  (volatilityScore * 0.5) +
  (riskAlignmentScore * 0.5)
) * 30
```

#### 3. Performance Score (Weight: 20%)
- **Positive Returns**: Percentage of assets with gains
- **Total Return**: Overall portfolio performance (if historical data available)
- **Income Generation**: Dividend yield coverage

**Calculation**:
```typescript
performanceScore = (
  (positiveReturnsRatio * 0.4) +
  (totalReturnScore * 0.3) +
  (dividendYieldScore * 0.3)
) * 20
```

#### 4. Best Practices Score (Weight: 15%)
- **Emergency Fund**: User has "Efectivo" asset representing emergency fund
- **Regular Contributions**: Recent goal contributions or asset purchases
- **Rebalancing**: Portfolio matches target allocation (if user set targets)

**Calculation**:
```typescript
bestPracticesScore = (
  (emergencyFundScore * 0.4) +
  (contributionScore * 0.3) +
  (rebalancingScore * 0.3)
) * 15
```

### Total Score Formula
```typescript
healthScore = Math.round(
  diversificationScore +
  riskScore +
  performanceScore +
  bestPracticesScore
)
// Result: 0-100
```

### Score Ranges & Interpretation

| Score | Rating | Color | Description |
|-------|--------|-------|-------------|
| 90-100 | Excelente | Green | Portfolio muy saludable con excelente diversificación |
| 75-89 | Muy Bueno | Light Green | Portfolio bien diversificado con gestión de riesgo sólida |
| 60-74 | Bueno | Yellow | Portfolio razonable con algunas áreas de mejora |
| 40-59 | Regular | Orange | Portfolio con problemas de diversificación o riesgo |
| 0-39 | Necesita Mejoras | Red | Portfolio con problemas significativos |

## Implementation Steps

### Iteration 1: Core Algorithm

File: `src/lib/services/portfolio-health.ts`

Create health score calculation functions:
```typescript
export interface HealthScoreResult {
  totalScore: number
  rating: string
  color: string
  breakdown: {
    diversification: { score: number; details: any }
    riskManagement: { score: number; details: any }
    performance: { score: number; details: any }
    bestPractices: { score: number; details: any }
  }
  recommendations: string[]
}

export function calculatePortfolioHealthScore(
  assets: Asset[],
  userProfile: UserProfile,
  performanceData?: PerformanceData
): HealthScoreResult
```

**Sub-functions**:
- `calculateDiversificationScore(assets)`
- `calculateRiskScore(assets, userProfile)`
- `calculatePerformanceScore(assets, performanceData)`
- `calculateBestPracticesScore(assets, userProfile)`
- `generateRecommendations(breakdown)` - AI-like recommendations based on weaknesses

### Iteration 2: API Endpoint

File: `src/app/api/portfolio/health-score/route.ts`

```typescript
export async function GET(request: Request) {
  // 1. Authenticate user
  // 2. Get user assets
  // 3. Get user profile (risk tolerance, etc.)
  // 4. Get performance data (if available)
  // 5. Calculate health score
  // 6. Return result with breakdown and recommendations
}
```

### Iteration 3: UI Component

File: `src/components/portfolio/HealthScoreCard.tsx`

**Design**:
- Large circular progress indicator showing score (0-100)
- Color-coded based on score range
- Rating label ("Excelente", "Muy Bueno", etc.)
- Expandable breakdown showing 4 component scores
- List of actionable recommendations
- "Ver Detalles" button to expand details

**Features**:
- Animated score counter (counts up from 0 to actual score)
- Tooltips explaining each component
- Responsive design (mobile + desktop)
- Empty state (if no assets)

### Iteration 4: Integration

**Add to Portfolio Page**:
File: `src/app/(main)/portfolio/page.tsx`

Position: Top of page, above portfolio summary cards

**Add to Dashboard**:
File: `src/app/(main)/dashboard/page.tsx`

Position: In widget grid alongside other metrics

### Iteration 5: Recommendations Engine

File: `src/lib/services/recommendations.ts`

Generate specific actionable recommendations:

**Examples**:
- "Considerá agregar más activos para mejorar la diversificación (actual: 3, recomendado: 10+)"
- "Tu portfolio está muy concentrado en tecnología (60%). Diversificá en otros sectores."
- "Agregá un fondo de emergencia en efectivo (recomendado: 3-6 meses de gastos)"
- "El 45% de tu portfolio está en una sola acción (AAPL). Reducí la concentración."
- "Ningún activo genera dividendos. Considerá agregar activos con ingresos pasivos."
- "Tu perfil indica baja tolerancia al riesgo, pero el 80% está en acciones volátiles."

### Iteration 6: Historical Tracking (Optional)

Store health score history to track improvements over time:

```sql
CREATE TABLE portfolio_health_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  score INTEGER NOT NULL,
  breakdown JSONB NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);
```

Chart showing score evolution over time.

## Success Criteria
✅ Health score algorithm implemented with all 4 components
✅ Score calculation is accurate and consistent
✅ API endpoint returns correct data
✅ HealthScoreCard component displays score beautifully
✅ Breakdown shows all 4 component scores
✅ Recommendations are specific and actionable
✅ Integrated into portfolio page
✅ Responsive design works on mobile
✅ Empty state handled gracefully
✅ Documentation created (PORTFOLIO_HEALTH_SCORE.md)

## Technical Specifications

### Score Calculation Precision
- Use floating point during calculation
- Round final score to integer (0-100)
- Store breakdown scores with 2 decimal precision

### Caching
- Cache health score for 1 hour (recalculate if assets change)
- Invalidate cache when assets are added/edited/deleted

### Performance
- Score calculation should be fast (< 100ms)
- Avoid N+1 queries
- Use single database query to get all needed data

### Data Requirements
Minimum data needed:
- User assets (required)
- User profile with risk_tolerance (optional, defaults to "medium")
- Performance data (optional, affects performance score only)

## Code Quality Standards
- Follow existing patterns
- Use TypeScript properly
- Add proper error handling
- Comprehensive unit tests for algorithm
- Responsive design
- Accessible components (ARIA labels)

## Constraints
- Do NOT require external APIs
- Do NOT break existing portfolio functionality
- Use existing UI components
- Follow Next.js patterns
- Maintain Spanish language

## Testing Scenarios

Test with various portfolios:
1. **Empty Portfolio**: Score 0, show helpful onboarding message
2. **Single Asset**: Low diversification score (30-40)
3. **Well-Diversified** (10+ assets, multiple sectors): High score (80-90)
4. **Concentrated** (80% in one stock): Low concentration score
5. **No Emergency Fund**: Lower best practices score
6. **High Risk + Conservative Profile**: Low risk alignment score

## Commit Message Format
```
feat: Add portfolio health score with algorithmic rating

- Implement health score algorithm with 4 weighted components
- Calculate diversification score (asset count, sectors, concentration)
- Calculate risk management score (volatility, risk tolerance alignment)
- Calculate performance score (positive returns, dividend yield)
- Calculate best practices score (emergency fund, contributions)
- Create GET /api/portfolio/health-score endpoint
- Build HealthScoreCard component with circular progress indicator
- Generate actionable recommendations based on score breakdown
- Add score breakdown with expandable details
- Integrate into portfolio page and dashboard
- Create PORTFOLIO_HEALTH_SCORE.md documentation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

**Important**: The algorithm should be transparent and explainable. Users should understand why they got their score and what they can do to improve it. Focus on actionable recommendations.
