# PostHog Analytics Setup Guide

This document provides instructions for setting up PostHog analytics in the Finanwas application.

## Table of Contents

- [What is PostHog?](#what-is-posthog)
- [Setup Instructions](#setup-instructions)
- [Events Tracked](#events-tracked)
- [User Identification](#user-identification)
- [Privacy & GDPR Compliance](#privacy--gdpr-compliance)
- [Viewing Analytics](#viewing-analytics)

---

## What is PostHog?

PostHog is an open-source, privacy-friendly analytics platform that provides:

- **Event Tracking**: Track custom events throughout your application
- **User Identification**: Link events to specific users
- **Session Recording**: Watch how users interact with your app (with privacy controls)
- **Feature Flags**: A/B test features and gradual rollouts
- **Funnels & Cohorts**: Analyze user journeys and segments
- **Self-Hosting**: Can be self-hosted for complete data control
- **GDPR Compliant**: Built with privacy in mind

## Setup Instructions

### 1. Get PostHog API Key

**Option A: PostHog Cloud (Recommended for Quick Start)**
1. Sign up at [https://posthog.com](https://posthog.com)
2. Create a new project
3. Navigate to Project Settings → API Keys
4. Copy your Project API Key

**Option B: Self-Hosted PostHog**
1. Follow the [PostHog self-hosting guide](https://posthog.com/docs/self-host)
2. Deploy PostHog to your infrastructure
3. Get your API key from your PostHog instance

### 2. Configure Environment Variables

Add the following to your `.env` file:

```bash
# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com  # or your self-hosted URL
```

### 3. Verify Installation

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser's DevTools → Console
3. You should see PostHog debug messages (in development mode)
4. Navigate around the app - you should see pageview events being tracked

### 4. Check PostHog Dashboard

1. Log into your PostHog dashboard
2. Go to "Events" → "Live Events"
3. You should see events coming in as you use the app

---

## Events Tracked

### Authentication Events

| Event Name | Properties | Description |
|------------|-----------|-------------|
| `user_registered` | `method`, `has_invitation_code` | User completes registration |
| `user_logged_in` | `method` | User successfully logs in (password, 2fa-totp, or 2fa-backup) |
| `user_login_2fa_required` | `userId` | Login requires 2FA verification |
| `2fa_verification_failed` | `method`, `userId` | 2FA verification fails |

### Portfolio Events

| Event Name | Properties | Description |
|------------|-----------|-------------|
| `portfolio_viewed` | `asset_count`, `total_value`, `total_gain_loss`, `currency` | User views portfolio page |
| `asset_added` | `asset_type`, `ticker`, `currency`, `has_ticker` | User adds new asset |
| `asset_deleted` | `asset_type`, `ticker`, `currency` | User deletes asset |
| `prices_refreshed` | `asset_count`, `success` | User refreshes asset prices |
| `health_score_viewed` | `score`, `rating`, `diversification_score`, `risk_score`, `performance_score`, `best_practices_score` | User views portfolio health score |

### Learning Events

| Event Name | Properties | Description |
|------------|-----------|-------------|
| `lesson_started` | `course_slug`, `lesson_slug`, `lesson_title`, `duration_minutes` | User starts a lesson |
| `lesson_completed` | `course_slug`, `lesson_slug`, `time_spent_seconds`, `completion_rate`, `course_progress` | User completes a lesson |

### Export Events

| Event Name | Properties | Description |
|------------|-----------|-------------|
| `data_exported` | `export_type`, `asset_count` | User exports portfolio data |

---

## User Identification

Users are automatically identified when they log in:

```typescript
// On successful login
identifyUser(userId, {
  email: user.email,
  name: user.name,
});
```

User identity is reset on logout:

```typescript
// On logout
resetUser();
```

This allows PostHog to:
- Link all events to specific users
- Track user journeys across sessions
- Analyze user behavior over time
- Create user cohorts

---

## Privacy & GDPR Compliance

### Privacy Features Enabled

1. **Input Masking**: All input fields are automatically masked in session recordings
2. **Sensitive Data**: Elements with class `sensitive-data` are masked
3. **Manual Events Only**: Autocapture is disabled - only manually tracked events are recorded
4. **Self-Hosting Option**: PostHog can be self-hosted for complete data control

### GDPR Compliance

PostHog is GDPR compliant and provides:
- **Data Portability**: Users can export their data
- **Right to Erasure**: Users can request data deletion
- **Data Processing Agreement**: Available for enterprise customers
- **Cookie Consent**: Integrates with cookie consent tools

### What Data is Collected?

**User Properties:**
- User ID (from database)
- Email address
- Name

**Event Properties:**
- Event name (e.g., "asset_added")
- Event properties (e.g., asset_type, ticker)
- Timestamp
- Page URL
- User agent

**NOT Collected:**
- Passwords
- Form input values (masked)
- Sensitive financial data
- Payment information

---

## Viewing Analytics

### Admin Analytics Dashboard

Access the in-app analytics overview:
```
/admin/analytics
```

This page shows:
- Summary of tracked events
- Event categories
- Quick stats
- Link to full PostHog dashboard

### PostHog Dashboard

Access the full PostHog dashboard for advanced analytics:

1. Log into [https://app.posthog.com](https://app.posthog.com)
2. Select your project
3. Available features:
   - **Events**: View all tracked events
   - **Insights**: Create custom charts and graphs
   - **Funnels**: Analyze conversion flows
   - **Retention**: Track user retention over time
   - **Cohorts**: Create user segments
   - **Session Recordings**: Watch user sessions (with privacy controls)
   - **Feature Flags**: A/B test features

### Example Analytics Questions

PostHog can help answer questions like:

**User Behavior:**
- Which features are most used?
- Where do users drop off?
- What's the average time spent on lessons?

**Conversion Metrics:**
- What's the registration → onboarding completion rate?
- How many users add assets after registering?
- What percentage of users complete their first lesson?

**Feature Performance:**
- Is the health score feature being used?
- Are users refreshing prices regularly?
- Which export format is most popular?

**User Retention:**
- How many users return after 7 days?
- What's the weekly active user count?
- Which features correlate with retention?

---

## Troubleshooting

### Events Not Showing Up

1. **Check Console**: Look for PostHog errors in browser console
2. **Verify API Key**: Ensure `NEXT_PUBLIC_POSTHOG_KEY` is set correctly
3. **Check Network Tab**: Look for failed requests to PostHog
4. **Development Mode**: PostHog debug mode is enabled in development

### Common Issues

**"PostHog not initialized"**
- Ensure environment variables are set
- Check that PostHogProvider is in the layout
- Verify the API key is valid

**"Events not visible in dashboard"**
- Check that you're looking at the correct project
- Events may take a few seconds to appear
- Check the date range filter in PostHog

**"User identification not working"**
- Ensure `identifyUser()` is called after successful login
- Check that userId is being passed correctly
- Verify user properties are being set

---

## Additional Resources

- [PostHog Documentation](https://posthog.com/docs)
- [PostHog API Reference](https://posthog.com/docs/api)
- [PostHog Feature Flags](https://posthog.com/docs/feature-flags)
- [PostHog Session Recording](https://posthog.com/docs/session-replay)
- [PostHog Self-Hosting](https://posthog.com/docs/self-host)

---

## Support

For PostHog-specific questions:
- [PostHog Community Slack](https://posthog.com/slack)
- [PostHog GitHub](https://github.com/PostHog/posthog)

For Finanwas analytics questions:
- Contact the development team
- Check `/admin/analytics` for event documentation
