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

### âœ… **Multi-Currency Support with Auto-Conversion** - COMPLETED
**Completed**: 2026-01-21
**Implementation Notes**: Comprehensive multi-currency support implemented with automatic conversion to user's preferred base currency. Created exchange rate service using exchangerate-api.com (free tier) with 1-hour server-side caching. Added preferred_currency field to user_profiles table (migration 012). Built currency conversion utilities supporting 10 major currencies (ARS, USD, EUR, BRL, GBP, JPY, CAD, CHF, CNY, MXN). Updated portfolio summary calculations to convert all assets to base currency using convertMultipleCurrencies(). Added currency preference UI to profile page with visual currency selector. Updated portfolio page to display values in preferred currency with proper symbols. Created API endpoint /api/market/exchange-rates for rate queries. Comprehensive MULTI_CURRENCY.md documentation included. All assets maintain original purchase currency while portfolio summary shows unified view in preferred currency.

- **Description**: Automatic currency conversion for portfolio summary
- **Rationale**: Users have assets in USD, ARS, EUR - need unified view
- **Implementation**: Exchange rate API integration with caching, base currency preference in profile, automatic portfolio conversion
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

### ✅ **Database Query Optimization** - COMPLETED
**Completed**: 2026-01-21
**Implementation Notes**: Comprehensive database index optimization implemented. Created migration 010 with 20+ new indexes including composite indexes for common query patterns (user_id + created_at), partial indexes for filtered queries (active goals, unused codes), and ordering indexes for frequently sorted data. Added README documentation for migrations. Indexes optimize portfolio queries, goal tracking, lesson progress, notes filtering, and analytics queries.

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

### âœ… **Image Optimization & CDN** - COMPLETED
**Completed**: 2026-01-21
**Implementation Notes**: Comprehensive image optimization configured in Next.js. Updated next.config.ts with AVIF/WebP format support, responsive image sizes (8 device sizes, 8 icon sizes), 1-year cache TTL for static assets, and gzip/brotli compression. Created placeholder PWA icon generation script (generates SVG icons for 192x192, 512x512, 180x180, and 1200x630 OG image). Added IMAGE_OPTIMIZATION.md documentation covering Next.js Image component best practices, CDN integration guides (Vercel/Cloudflare), Core Web Vitals optimization, and PWA icon requirements. Created npm script `generate-icons` for easy placeholder generation. Application is now CDN-ready with optimal image delivery.

- **Description**: Optimize assets and serve via CDN
- **Rationale**: Faster page loads globally
- **Implementation**: Next.js Image optimization configured + CDN-ready + placeholder icon generation
- **Effort**: Low
- **Priority**: Nice-to-have

### âœ… **API Response Caching** - COMPLETED
**Completed**: 2026-01-21
**Implementation Notes**: Comprehensive API response caching implemented across all major endpoints. Fixed portfolio refresh to use cached Yahoo Finance module (15-min cache) instead of direct API calls. Added server-side in-memory caching to glossary (1-hour, file read optimization), courses (1-hour, file read optimization), dollar exchange rates (1-hour). Added HTTP Cache-Control headers to all cached endpoints for browser-side caching (public for static content, private for user-specific data). Created CACHING.md documentation detailing the complete caching strategy, cache durations, and future improvements.

- **Description**: Cache expensive API calls (Yahoo Finance, market data)
- **Rationale**: Reduce API costs and improve response times
- **Implementation**: Server-side in-memory caching + HTTP Cache-Control headers
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

### ✅ **Error Tracking & Monitoring** - COMPLETED
**Completed**: 2026-01-21
**Implementation Notes**: Comprehensive self-hosted error tracking and monitoring system implemented. Created database-backed error logging with error_logs table storing errors from client, server, and API sources. Built error logging utilities for both server-side (logger.ts with logError, logApiError, logServerError functions) and client-side (client-logger.ts with global error handlers). Implemented POST /api/monitoring/log endpoint for client errors and GET/PATCH /api/admin/errors for admin dashboard. Created full-featured admin error monitoring dashboard at /admin/errores with statistics, filtering by level/source/resolved status, error details with stack traces, and resolution tracking. Added ErrorTrackingProvider to root layout for automatic global error capture. Created comprehensive ERROR_TRACKING.md documentation covering architecture, usage, API reference, and best practices. System is production-ready, privacy-compliant, and requires zero external dependencies.

- **Description**: Automatic error reporting and performance monitoring
- **Rationale**: Proactively catch and fix bugs
- **Implementation**: Self-hosted database-backed error tracking with admin dashboard (no external service)
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

### âœ… **Data Export (GDPR Compliance)** - COMPLETED
**Completed**: 2026-01-21
**Implementation Notes**: Comprehensive GDPR-compliant data export feature implemented. Created exportUserData() function that aggregates all user data from 9 database tables (users, profiles, portfolio_assets, savings_goals, savings_contributions, lesson_progress, tip_views, notes, invitation_codes). Built GET /api/user/export-data endpoint that returns downloadable JSON file with complete user data. Added "Data & Privacy" section to profile page with one-click export button, loading states, and privacy information. Export includes metadata (version, export date) and follows privacy regulations (GDPR, CCPA). Users can download their complete data archive at any time.

- **Description**: Allow users to export all their data
- **Rationale**: GDPR/privacy law compliance
- **Implementation**: Complete JSON export from all 9 user data tables with download UI
- **Effort**: Low
- **Priority**: Should-have

---

## Technical Debt & Code Quality

### ✅ **Add React Error Boundaries** - COMPLETED
**Completed**: 2026-01-21
**Implementation Notes**: Comprehensive error handling system implemented using Next.js 13+ App Router conventions. Created multi-layered error boundaries: root error boundary (error.tsx) for app-wide errors, main section error boundary for authenticated routes, global-error.tsx for critical failures, custom 404 not-found page with helpful navigation, and loading.tsx for better UX during transitions. Error boundaries include retry functionality, user-friendly Spanish messages, development-only error details, and proper styling with existing UI components.

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

### ✅ **Remove Supabase `as any` Type Assertions** - COMPLETED
**Completed**: 2026-01-21
**Implementation Notes**: Removed all unsafe `as any` type assertions from the codebase and improved TypeScript type safety. Updated `src/types/database.ts` to include all 11 database tables with proper Row/Insert/Update type definitions including the new error_logs table. Updated `src/lib/db/supabase.ts` to create a typed Supabase client using `createSupabaseClient<Database>()`. Systematically removed `as any` assertions from API routes (auth/register, auth/login, profile), page components (portfolio, perfil, investigar/comparar), and ensured all Supabase queries are now fully type-safe. Application code now has complete type safety without unsafe type assertions, improving code maintainability and catching potential errors at compile time.

- **Description**: Properly type Supabase queries
- **Rationale**: Better type safety
- **Implementation**: Updated database types and removed all `as any` assertions from application code
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
