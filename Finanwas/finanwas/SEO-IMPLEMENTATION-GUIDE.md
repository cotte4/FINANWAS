# SEO & Metadata Implementation Guide for Finanwas

This guide explains how to use the SEO and metadata infrastructure that has been set up for Finanwas.

## Overview

The following has been implemented:

1. **Root Layout** (`src/app/layout.tsx`) - Global SEO metadata
2. **Analytics Library** (`src/lib/analytics.ts`) - Google Analytics wrapper
3. **Metadata Utilities** (`src/lib/metadata.ts`) - Reusable metadata functions
4. **Dynamic Sitemap** (`src/app/sitemap.ts`) - Auto-generated sitemap
5. **Public Assets** - PWA manifest, robots.txt, and placeholders for icons
6. **Auth Pages** - Enhanced metadata for login/register

## How to Use

### 1. Adding Metadata to Static Pages

For any new page, import the metadata helper and generate appropriate metadata:

```typescript
// src/app/dashboard/page.tsx
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata';

// Generate metadata for the dashboard page
export const metadata: Metadata = generatePageMetadata('dashboard');

export default function DashboardPage() {
  // Your component code
}
```

### 2. Adding Metadata to Dynamic Course Pages

For dynamic routes like courses and lessons:

```typescript
// src/app/aprender/[courseId]/page.tsx
import type { Metadata } from 'next';
import { generateCourseMetadata, generateCourseStructuredData, StructuredData } from '@/lib/metadata';

// Generate metadata dynamically
export async function generateMetadata({ params }: { params: { courseId: string } }): Promise<Metadata> {
  // Fetch course from database
  const course = await getCourseById(params.courseId);

  return generateCourseMetadata(
    course.id,
    course.name,
    course.description,
    course.category
  );
}

export default function CoursePage({ params }: { params: { courseId: string } }) {
  const course = getCourseById(params.courseId);

  // Add structured data for SEO
  const structuredData = generateCourseStructuredData(
    course.id,
    course.name,
    course.description,
    course.category
  );

  return (
    <>
      <StructuredData data={structuredData} />
      {/* Your course content */}
    </>
  );
}
```

### 3. Adding Metadata to Lesson Pages

```typescript
// src/app/aprender/[courseId]/[lessonId]/page.tsx
import type { Metadata } from 'next';
import { generateLessonMetadata } from '@/lib/metadata';

export async function generateMetadata({
  params
}: {
  params: { courseId: string; lessonId: string }
}): Promise<Metadata> {
  const course = await getCourseById(params.courseId);
  const lesson = await getLessonById(params.lessonId);

  return generateLessonMetadata(
    params.courseId,
    course.name,
    params.lessonId,
    lesson.name,
    lesson.description
  );
}
```

### 4. Using Analytics Events

Import the analytics library and track user actions:

```typescript
'use client';

import { analytics } from '@/lib/analytics';

export default function CourseComponent() {
  const handleCourseStart = () => {
    // Track when user starts a course
    analytics.trackCourseStart('course-123', 'Inversiones Básicas', 'inversiones');
  };

  const handleLessonComplete = () => {
    // Track lesson completion
    analytics.trackLessonComplete(
      'course-123',
      'lesson-456',
      'Introducción al Mercado de Valores',
      25 // 25% course progress
    );
  };

  const handleGoalCreate = () => {
    // Track goal creation
    analytics.trackGoalCreate('ahorro-emergencia', 50000);
  };

  return (
    <div>
      <button onClick={handleCourseStart}>Comenzar Curso</button>
      <button onClick={handleLessonComplete}>Completar Lección</button>
      <button onClick={handleGoalCreate}>Crear Meta</button>
    </div>
  );
}
```

### 5. Setting up Google Analytics

1. Create a Google Analytics 4 property at [analytics.google.com](https://analytics.google.com)
2. Get your Measurement ID (format: G-XXXXXXXXXX)
3. Add to your `.env.local` file:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

4. Initialize analytics in your root layout (optional, for client-side tracking):

```typescript
// src/app/layout.tsx
'use client';

import { useEffect } from 'react';
import { initGA } from '@/lib/analytics';

export default function RootLayout({ children }) {
  useEffect(() => {
    initGA();
  }, []);

  return (
    <html lang="es-AR">
      <body>{children}</body>
    </html>
  );
}
```

### 6. Adding Icons and Images

Replace the placeholder files in `/public/` with actual assets:

- `/public/favicon.ico` - 16x16, 32x32, 48x48 favicon
- `/public/icon.png` - 192x192 PWA icon
- `/public/icon-512.png` - 512x512 PWA icon
- `/public/apple-icon.png` - 180x180 iOS icon
- `/public/og-image.png` - 1200x630 Open Graph image

See `/public/ICONS-README.md` for detailed specifications.

### 7. Updating the Sitemap

The sitemap is auto-generated at `/sitemap.xml`. To include dynamic courses and lessons:

1. Open `src/app/sitemap.ts`
2. Replace the TODO sections with actual database queries:

```typescript
async function getDynamicCourseRoutes() {
  const courses = await prisma.course.findMany({
    select: { slug: true, updatedAt: true }
  });

  return courses.map(course => ({
    url: `/aprender/${course.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
}
```

### 8. Verifying Google Search Console

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add your property (finanwas.com)
3. Choose HTML tag verification method
4. Copy the verification code
5. Update `src/app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  // ... other metadata
  verification: {
    google: 'your-actual-verification-code-here',
  },
};
```

## Testing

### Test Metadata Locally

1. Run `npm run dev`
2. Open any page
3. View page source (Ctrl+U or Cmd+U)
4. Check for:
   - `<title>` tags
   - `<meta name="description">` tags
   - Open Graph `<meta property="og:...">` tags
   - Twitter Card `<meta name="twitter:...">` tags
   - JSON-LD structured data `<script type="application/ld+json">`

### Test Sitemap

Visit `http://localhost:3000/sitemap.xml` to see the generated sitemap.

### Test Robots.txt

Visit `http://localhost:3000/robots.txt` to see the robots file.

### Test PWA Manifest

Visit `http://localhost:3000/manifest.json` to see the PWA manifest.

## SEO Tools & Validation

Use these tools to validate your SEO implementation:

1. **Rich Results Test**: https://search.google.com/test/rich-results
2. **Open Graph Debugger**: https://www.opengraph.xyz/
3. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
4. **Lighthouse (Chrome DevTools)**: Run audits for SEO, Performance, Accessibility
5. **Google Search Console**: Monitor search performance and indexing

## Analytics Events Reference

Here's a quick reference of available analytics events:

### Authentication
- `trackSignup(method)` - User signs up
- `trackLogin(method)` - User logs in
- `trackLogout()` - User logs out

### Education
- `trackCourseStart(courseId, courseName, category)` - User starts course
- `trackLessonComplete(courseId, lessonId, lessonName, progress)` - User completes lesson
- `trackCourseComplete(courseId, courseName, timeSpent)` - User completes course
- `trackAssessment(assessmentId, score, passed)` - User completes quiz

### Portfolio
- `trackPortfolioAddAsset(assetType, symbol)` - User adds asset
- `trackPortfolioRemoveAsset(assetType, symbol)` - User removes asset
- `trackPortfolioView()` - User views portfolio

### Goals
- `trackGoalCreate(goalType, targetAmount)` - User creates goal
- `trackGoalComplete(goalType, timeToComplete)` - User completes goal
- `trackGoalProgress(goalId, progressPercentage)` - User updates goal progress

### Tools & Research
- `trackToolUsage(toolName, action)` - User uses a tool
- `trackSearch(query, resultsCount)` - User searches

### Content
- `trackNoteCreate(noteType)` - User creates note
- `trackShare(contentType, method)` - User shares content

### Engagement
- `trackTimeOnPage(pageName, timeSeconds)` - Track time spent
- `trackCTAClick(ctaName, location)` - User clicks CTA

### Errors & Support
- `trackError(errorMessage, errorLocation)` - Error occurs
- `trackHelpRequest(helpTopic)` - User requests help

## Best Practices

1. **Always use Spanish (es-AR)** - All metadata should be in Spanish for the Argentina market
2. **Keep descriptions concise** - Meta descriptions should be 150-160 characters
3. **Use relevant keywords** - But avoid keyword stuffing
4. **Update lastModified** - Keep sitemap dates current
5. **Test on mobile** - Ensure metadata renders well on mobile devices
6. **Track key actions** - Focus on events that indicate user success
7. **Monitor Core Web Vitals** - Use Lighthouse to track performance
8. **Update structured data** - Keep JSON-LD up to date with course content

## Next Steps

1. ✅ Set up Google Analytics account
2. ✅ Add GA Measurement ID to environment variables
3. ✅ Create and add icon assets to `/public/`
4. ✅ Create Open Graph image (`og-image.png`)
5. ✅ Verify with Google Search Console
6. ✅ Update sitemap with dynamic routes (when database is ready)
7. ✅ Test metadata on all pages
8. ✅ Submit sitemap to Google Search Console
9. ✅ Set up analytics dashboard to monitor key metrics
10. ✅ Implement event tracking across the application

## Additional Resources

- [Next.js Metadata Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Google Analytics 4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [Schema.org Course Documentation](https://schema.org/Course)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
