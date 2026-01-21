# Ralph Agent - User Analytics Dashboard with PostHog

## Objective
Implement comprehensive user analytics tracking using PostHog (open-source, self-hostable) to understand user behavior, track feature engagement, and make data-driven product decisions.

## Context
Currently, we have no visibility into how users interact with the app. We need analytics to answer questions like:
- Which features are most used?
- Where do users drop off?
- What's the conversion rate for onboarding?
- How engaged are users with learning content?

## Requirements

### Why PostHog?
- ✅ Open-source (can self-host)
- ✅ Free tier (generous limits)
- ✅ Privacy-friendly (GDPR compliant)
- ✅ Feature flags included
- ✅ Session recording
- ✅ Funnels and cohort analysis
- ✅ No data sent to third parties (self-hosted option)

### Phase 1: Setup PostHog

#### Install PostHog
```bash
npm install posthog-js posthog-node
```

#### Create PostHog Provider
File: `src/lib/analytics/posthog.ts`

```typescript
import posthog from 'posthog-js'

export function initPostHog() {
  if (typeof window !== 'undefined') {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') posthog.debug()
      },
      capture_pageviews: false, // We'll do this manually
      capture_pageleave: true,
      autocapture: false, // Manual event tracking for better control
    })
  }
}

export { posthog }
```

#### PostHog Provider Component
File: `src/components/providers/PostHogProvider.tsx`

```typescript
'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { initPostHog, posthog } from '@/lib/analytics/posthog'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    initPostHog()
  }, [])

  // Track pageviews
  useEffect(() => {
    if (pathname) {
      posthog.capture('$pageview', {
        $current_url: window.location.href,
      })
    }
  }, [pathname, searchParams])

  return <>{children}</>
}
```

### Phase 2: Event Tracking

#### Core Events to Track

**Authentication Events**:
```typescript
// User registered
posthog.capture('user_registered', {
  method: 'email',
  has_invitation_code: true
})

// User logged in
posthog.capture('user_logged_in', {
  method: '2fa' | 'password'
})
```

**Portfolio Events**:
```typescript
// Asset added
posthog.capture('asset_added', {
  asset_type: 'Acción',
  ticker: 'AAPL',
  currency: 'USD'
})

// Prices refreshed
posthog.capture('prices_refreshed', {
  asset_count: 10,
  success_count: 9,
  failed_count: 1
})

// Health score viewed
posthog.capture('health_score_viewed', {
  score: 75,
  rating: 'Muy Bueno'
})

// Performance chart viewed
posthog.capture('performance_chart_viewed', {
  time_period: '1M'
})
```

**Goals Events**:
```typescript
// Goal created
posthog.capture('goal_created', {
  target_amount: 10000,
  deadline: '2025-12-31'
})

// Contribution added
posthog.capture('contribution_added', {
  amount: 500,
  goal_progress: 45
})
```

**Learning Events**:
```typescript
// Lesson started
posthog.capture('lesson_started', {
  course_slug: 'inversiones-101',
  lesson_slug: 'que-son-las-acciones'
})

// Lesson completed
posthog.capture('lesson_completed', {
  course_slug: 'inversiones-101',
  time_spent_seconds: 420,
  completion_rate: 100
})
```

**Export Events**:
```typescript
// Data exported
posthog.capture('data_exported', {
  export_type: 'GDPR' | 'CSV',
  data_size_kb: 125
})
```

### Phase 3: User Identification

Identify users after login:
```typescript
// After successful login
posthog.identify(userId, {
  email: user.email,
  name: user.name,
  role: user.role,
  created_at: user.created_at,
  risk_tolerance: userProfile.risk_tolerance,
  preferred_currency: userProfile.preferred_currency
})
```

Reset on logout:
```typescript
// On logout
posthog.reset()
```

### Phase 4: Integration Points

#### Add tracking to existing components

**Portfolio Page** (`src/app/(main)/portfolio/page.tsx`):
```typescript
import { posthog } from '@/lib/analytics/posthog'

// Track page view
useEffect(() => {
  posthog.capture('portfolio_viewed', {
    asset_count: assets.length,
    total_value: summary.totalValue
  })
}, [])

// Track refresh
const handleRefreshPrices = async () => {
  const result = await refreshPrices()
  posthog.capture('prices_refreshed', {
    success_count: result.updated,
    failed_count: result.failed
  })
}
```

**Add Asset Modal** (`src/components/portfolio/AddAssetModal.tsx`):
```typescript
const handleSubmit = async (data) => {
  await createAsset(data)

  posthog.capture('asset_added', {
    asset_type: data.type,
    ticker: data.ticker,
    currency: data.currency,
    has_ticker: !!data.ticker
  })
}
```

**Health Score Card** (`src/components/portfolio/HealthScoreCard.tsx`):
```typescript
useEffect(() => {
  if (healthScore) {
    posthog.capture('health_score_viewed', {
      score: healthScore.totalScore,
      rating: healthScore.rating,
      diversification_score: healthScore.breakdown.diversification.score,
      risk_score: healthScore.breakdown.riskManagement.score
    })
  }
}, [healthScore])
```

### Phase 5: Admin Analytics Dashboard

Create admin page to view analytics insights:

File: `src/app/admin/analytics/page.tsx`

```typescript
'use client'

import { Card } from '@/components/ui/card'

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics Dashboard</h1>

      {/* Embed PostHog dashboard */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">User Insights</h2>
        <p className="text-muted-foreground mb-4">
          View detailed analytics in your PostHog dashboard:
        </p>
        <a
          href={process.env.NEXT_PUBLIC_POSTHOG_HOST}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Open PostHog Dashboard →
        </a>
      </Card>

      {/* Key metrics (can fetch from PostHog API) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Active Users (7d)</h3>
          <p className="text-3xl font-bold mt-2">1,234</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Portfolio Views</h3>
          <p className="text-3xl font-bold mt-2">5,678</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Assets Created</h3>
          <p className="text-3xl font-bold mt-2">890</p>
        </Card>
      </div>
    </div>
  )
}
```

### Phase 6: Key Funnels to Track

#### Onboarding Funnel
```
1. Registration page viewed
2. User registered
3. Onboarding started
4. Questionnaire completed
5. First asset added
6. Portfolio viewed
```

#### Engagement Funnel
```
1. Dashboard viewed
2. Portfolio viewed
3. Asset added OR Price refreshed
4. Returned next day
5. Returned next week
```

#### Learning Funnel
```
1. Aprender page viewed
2. Course clicked
3. First lesson started
4. First lesson completed
5. Second lesson started
6. Course completed
```

### Phase 7: Privacy Compliance

#### Cookie Consent
Create simple cookie banner:

File: `src/components/CookieConsent.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('analytics_consent')
    if (!consent) {
      setShowBanner(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('analytics_consent', 'true')
    setShowBanner(false)
    // Initialize PostHog
    initPostHog()
  }

  const handleDecline = () => {
    localStorage.setItem('analytics_consent', 'false')
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Card className="p-4 shadow-lg">
        <h3 className="font-semibold mb-2">Cookies y Analytics</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Usamos cookies para mejorar tu experiencia y analizar el uso de la app. Tus datos nunca se comparten con terceros.
        </p>
        <div className="flex gap-2">
          <Button onClick={handleAccept} size="sm">Aceptar</Button>
          <Button onClick={handleDecline} variant="outline" size="sm">Rechazar</Button>
        </div>
      </Card>
    </div>
  )
}
```

## Environment Variables

Add to `.env.local`:
```env
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
# Or for self-hosted: https://your-posthog-instance.com
```

## Success Criteria
✅ PostHog installed and configured
✅ Event tracking on all major actions
✅ User identification after login
✅ Pageview tracking automatic
✅ Cookie consent banner
✅ Admin analytics page created
✅ Privacy policy updated
✅ Key funnels defined
✅ Documentation created (USER_ANALYTICS.md)

## Implementation Strategy

### Iteration 1: Setup
1. Install PostHog packages
2. Create PostHog provider and init function
3. Add to root layout
4. Test basic pageview tracking

### Iteration 2: Event Tracking
1. Add tracking to auth routes
2. Add tracking to portfolio actions
3. Add tracking to goals
4. Add tracking to learning

### Iteration 3: User Identification
1. Identify users on login
2. Set user properties
3. Reset on logout
4. Test user tracking

### Iteration 4: Admin Dashboard
1. Create admin analytics page
2. Embed PostHog dashboard link
3. Show key metrics (optional)

### Iteration 5: Privacy & Compliance
1. Create cookie consent banner
2. Respect user consent
3. Update privacy policy
4. Test consent flow
5. Create documentation

## Code Quality Standards
- Follow existing patterns
- Use TypeScript properly
- Privacy-first approach
- Performance optimization (async tracking)
- No blocking of user experience

## Constraints
- Do NOT track sensitive data (passwords, tokens, financial details)
- Do NOT block app if PostHog fails
- Do NOT send data without consent
- Use existing UI components
- Follow Next.js patterns
- Maintain Spanish language

## Testing Checklist
- [ ] Events fire correctly
- [ ] User identification works
- [ ] Pageviews tracked
- [ ] No errors in console
- [ ] PostHog dashboard shows data
- [ ] Cookie consent works
- [ ] App works if PostHog fails

## Commit Message Format
```
feat: Add user analytics with PostHog

- Install posthog-js and posthog-node packages
- Create PostHog provider with pageview tracking
- Implement event tracking for auth, portfolio, goals, learning
- Add user identification on login/logout
- Track key user actions (asset added, prices refreshed, etc.)
- Create cookie consent banner for privacy compliance
- Add admin analytics dashboard page
- Define key funnels (onboarding, engagement, learning)
- Create USER_ANALYTICS.md documentation
- Privacy-first implementation (no sensitive data tracked)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

**Important**: Analytics should be invisible to users and never slow down the app. All tracking should be async and fail gracefully if PostHog is unavailable.
