# Future Feature Ideas for Finanwas

Last Updated: 2026-01-20

Based on comprehensive code review of iteration 1/15.

---

## UX Improvements

### **Real-time Price Updates via WebSocket**
- **Description**: Replace manual refresh with automatic price updates
- **Rationale**: Users currently need to click "Refresh Prices" button. Auto-updates would provide better UX
- **Implementation**: WebSocket connection to Yahoo Finance or dedicated price service
- **Effort**: High
- **Priority**: Should-have

### **Portfolio Performance Charts**
- **Description**: Historical performance tracking with interactive charts
- **Rationale**: Users can see value over time, not just current snapshot
- **Implementation**: Add price_history table, use Chart.js/Recharts for visualization
- **Effort**: Medium
- **Priority**: Should-have

### ✅ **Dark Mode Support** - COMPLETED
**Completed**: 2026-01-21
**Implementation Notes**: Added dark mode toggle with system preference detection using next-themes. Dark mode CSS variables were already defined in globals.css. Implemented ThemeProvider wrapping the app, created theme-toggle component with light/dark/system cycle, and added toggle to both desktop UserMenu and mobile header dropdown. All layout components updated with dark mode classes (dark:bg-*, dark:border-*, etc.). Toggle available in user profile menu on both mobile and desktop.

- **Description**: System-wide dark theme toggle
- **Rationale**: Better user experience for night-time usage
- **Implementation**: Tailwind dark mode with localStorage persistence
- **Effort**: Low
- **Priority**: Nice-to-have

### **Mobile-First Improvements**
- **Description**: Enhanced mobile gestures (swipe to delete, pull to refresh)
- **Rationale**: Mobile is likely primary usage platform for many users
- **Implementation**: React gestures library + mobile-optimized layouts
- **Effort**: Medium
- **Priority**: Should-have

---

## Advanced Features

### **Multi-Currency Support with Auto-Conversion**
- **Description**: Automatic currency conversion for portfolio summary
- **Rationale**: Users have assets in USD, ARS, EUR - need unified view
- **Implementation**: Integrate exchange rate API, add base currency preference
- **Effort**: Medium
- **Priority**: Should-have

### **Goal Progress Notifications**
- **Description**: Email/push notifications when goals reach milestones (25%, 50%, 75%, 100%)
- **Rationale**: Keeps users engaged and motivated
- **Implementation**: Background job + notification service
- **Effort**: High
- **Priority**: Nice-to-have

### **Portfolio Rebalancing Suggestions**
- **Description**: AI-powered recommendations to maintain target asset allocation
- **Rationale**: Helps users maintain diversified portfolio
- **Implementation**: Algorithm to compare current vs target allocation
- **Effort**: High
- **Priority**: Could-have

### **Tax Loss Harvesting Tool**
- **Description**: Identify assets with losses for tax optimization
- **Rationale**: Valuable for end-of-year tax planning
- **Implementation**: Calculate realized/unrealized gains, suggest tax strategies
- **Effort**: High
- **Priority**: Could-have

### **Dividend Tracking**
- **Description**: Track dividend payments and reinvestment
- **Rationale**: Important for income-focused investors
- **Implementation**: Extend portfolio_assets with dividend fields
- **Effort**: Medium
- **Priority**: Should-have

---

## Integrations

### **Brokerage Account Integration**
- **Description**: Import portfolio data directly from brokerages (Balanz, Bull Market, etc.)
- **Rationale**: Reduce manual data entry
- **Implementation**: OAuth integrations with broker APIs
- **Effort**: Very High
- **Priority**: Could-have

### **Bank Account Sync**
- **Description**: Connect bank accounts for automatic goal contribution tracking
- **Rationale**: Automated tracking vs manual entry
- **Implementation**: Plaid/Mercado Pago API integration
- **Effort**: High
- **Priority**: Could-have

### **WhatsApp Notifications**
- **Description**: Send portfolio alerts via WhatsApp
- **Rationale**: Higher engagement than email in LATAM markets
- **Implementation**: Twilio WhatsApp Business API
- **Effort**: Medium
- **Priority**: Nice-to-have

### **Google Sheets Export/Import**
- **Description**: Sync portfolio data with Google Sheets
- **Rationale**: Power users want spreadsheet flexibility
- **Implementation**: Google Sheets API integration
- **Effort**: Medium
- **Priority**: Nice-to-have

---

## Performance Enhancements

### **Database Query Optimization**
- **Description**: Add indexes on frequently queried fields (user_id, created_at, ticker)
- **Rationale**: Faster page loads as data grows
- **Implementation**: Supabase migration with indexes
- **Effort**: Low
- **Priority**: Should-have

### **Implement Redis for Rate Limiting**
- **Description**: Replace in-memory rate limiter with Redis
- **Rationale**: Current in-memory solution won't scale across multiple instances
- **Implementation**: Redis integration with Upstash/Redis Cloud
- **Effort**: Medium
- **Priority**: Should-have (for production scale)

### **Image Optimization & CDN**
- **Description**: Optimize assets and serve via CDN
- **Rationale**: Faster page loads globally
- **Implementation**: Next.js Image optimization + Cloudflare CDN
- **Effort**: Low
- **Priority**: Nice-to-have

### **API Response Caching**
- **Description**: Cache expensive API calls (Yahoo Finance, market data)
- **Rationale**: Reduce API costs and improve response times
- **Implementation**: Already partially done - extend to more endpoints
- **Effort**: Low
- **Priority**: Should-have

---

## Analytics & Monitoring

### **User Analytics Dashboard**
- **Description**: Track user engagement, popular features, conversion funnels
- **Rationale**: Data-driven product decisions
- **Implementation**: Integrate Mixpanel/PostHog
- **Effort**: Medium
- **Priority**: Should-have

### **Error Tracking & Monitoring**
- **Description**: Automatic error reporting and performance monitoring
- **Rationale**: Proactively catch and fix bugs
- **Implementation**: Sentry/LogRocket integration
- **Effort**: Low
- **Priority**: Should-have

### **A/B Testing Framework**
- **Description**: Test different features/UI with user segments
- **Rationale**: Optimize conversion and engagement
- **Implementation**: Feature flag system (LaunchDarkly/Optimizely)
- **Effort**: Medium
- **Priority**: Nice-to-have

---

## User Engagement

### **Gamification System**
- **Description**: Badges, streaks, levels for completing lessons and reaching goals
- **Rationale**: Increases user retention and engagement
- **Implementation**: Achievement system with rewards
- **Effort**: High
- **Priority**: Nice-to-have

### **Social Features**
- **Description**: Share achievements, compare anonymized performance with peers
- **Rationale**: Social proof drives engagement
- **Implementation**: Social graph + privacy-safe comparison metrics
- **Effort**: High
- **Priority**: Could-have

### **Financial News Feed**
- **Description**: Personalized news based on user's portfolio holdings
- **Rationale**: Keep users informed about their investments
- **Implementation**: News API integration filtered by tickers
- **Effort**: Medium
- **Priority**: Nice-to-have

### **Community Forum**
- **Description**: User discussion forum for financial questions
- **Rationale**: Build community, increase retention
- **Implementation**: Discourse or custom forum
- **Effort**: High
- **Priority**: Could-have

---

## Security & Compliance

### **Two-Factor Authentication (2FA)**
- **Description**: Add 2FA for account security
- **Rationale**: Protect user financial data
- **Implementation**: TOTP with QR codes (authenticator apps)
- **Effort**: Medium
- **Priority**: Should-have

### **Audit Log**
- **Description**: Track all user actions for security auditing
- **Rationale**: Security and compliance requirements
- **Implementation**: Event logging system
- **Effort**: Medium
- **Priority**: Should-have

### **Data Export (GDPR Compliance)**
- **Description**: Allow users to export all their data
- **Rationale**: GDPR/privacy law compliance
- **Implementation**: JSON export of all user data
- **Effort**: Low
- **Priority**: Should-have

---

## Technical Debt & Code Quality

### **Add React Error Boundaries**
- **Description**: Graceful error handling for component failures
- **Rationale**: Prevent full app crashes from component errors
- **Implementation**: Error boundary components at route level
- **Effort**: Low
- **Priority**: Should-have

### **E2E Testing Suite**
- **Description**: End-to-end tests for critical user flows
- **Rationale**: Catch regressions before production
- **Implementation**: Playwright/Cypress tests
- **Effort**: High
- **Priority**: Should-have

### **Storybook for Component Library**
- **Description**: Visual component documentation
- **Rationale**: Easier component development and reuse
- **Implementation**: Storybook setup with existing components
- **Effort**: Medium
- **Priority**: Nice-to-have

### **Remove Supabase `as any` Type Assertions**
- **Description**: Properly type Supabase queries
- **Rationale**: Better type safety
- **Implementation**: Generate proper types from Supabase schema
- **Effort**: Low
- **Priority**: Nice-to-have

---

## Data & Insights

### **Portfolio Health Score**
- **Description**: Algorithmic score (0-100) based on diversification, risk, performance
- **Rationale**: Simple metric for portfolio quality
- **Implementation**: Scoring algorithm with weighted factors
- **Effort**: Medium
- **Priority**: Should-have

### **Investment Recommendations**
- **Description**: AI-powered investment suggestions based on profile and goals
- **Rationale**: Help users make better investment decisions
- **Implementation**: ML model or rules-based recommendation engine
- **Effort**: Very High
- **Priority**: Could-have

### **Scenario Planning Tool**
- **Description**: "What if" scenarios (market crash, bull market, inflation)
- **Rationale**: Help users understand risk exposure
- **Implementation**: Monte Carlo simulations
- **Effort**: High
- **Priority**: Nice-to-have
