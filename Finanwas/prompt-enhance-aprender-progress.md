# Ralph Agent - Enhance Aprender Progress Tracking

## Objective
Enhance the learning progress tracking system in the "aprender" section with time tracking, assessments, and advanced analytics.

## Current State Analysis

### What Exists Now
**Database**: `lesson_progress` table
- Fields: `completed` (boolean), `completed_at` (timestamp)
- Tracks: Only completion status (yes/no)

**UI Components**:
- Course overview page shows progress bars
- Lesson page shows completion button
- Dashboard widget shows completed count

**API Endpoints**:
- `GET /api/progress` - Get all user progress
- `POST /api/progress` - Mark lesson complete
- `GET /api/courses` - List courses
- `GET /api/courses/[slug]/lessons/[slug]` - Get lesson

### What's Missing
1. **Time Tracking**: No tracking of time spent on lessons
2. **Start Tracking**: No record of when user started a lesson
3. **View Count**: No tracking of revisits
4. **Assessments**: No quiz/test functionality
5. **User Ratings**: No lesson feedback system
6. **Streaks**: No gamification (daily streak tracking)
7. **Reading Progress**: No within-lesson progress (0-100%)
8. **Achievements**: No milestones or badges

## Requirements

### Phase 1: Time Tracking (Priority: HIGH)

#### Database Changes
Extend `lesson_progress` table with new fields:
```sql
ALTER TABLE lesson_progress
ADD COLUMN started_at TIMESTAMPTZ,
ADD COLUMN time_spent_seconds INTEGER DEFAULT 0,
ADD COLUMN last_accessed_at TIMESTAMPTZ,
ADD COLUMN view_count INTEGER DEFAULT 1,
ADD COLUMN progress_percentage INTEGER DEFAULT 0;
```

#### Create Migration
File: `src/lib/db/migrations/015_enhance_lesson_progress.sql`

#### Update Types
File: `src/types/database.ts`
```typescript
export interface LessonProgress {
  id: string
  user_id: string
  course_slug: string
  lesson_slug: string
  completed: boolean
  completed_at: string | null
  started_at: string | null        // NEW
  time_spent_seconds: number       // NEW
  last_accessed_at: string | null  // NEW
  view_count: number                // NEW
  progress_percentage: number       // NEW
}
```

#### Update Query Functions
File: `src/lib/db/queries/progress.ts`

Add new functions:
- `startLesson(userId, courseSlug, lessonSlug)` - Record lesson start
- `updateTimeSpent(userId, courseSlug, lessonSlug, seconds)` - Add time
- `updateReadingProgress(userId, courseSlug, lessonSlug, percentage)` - Track scroll
- `getLearningStats(userId)` - Get aggregate stats (total time, streak, etc.)

#### Frontend Changes
File: `src/app/(main)/aprender/[courseSlug]/[lessonSlug]/page.tsx`

Add:
1. Timer that tracks time spent (updates every 30 seconds)
2. Scroll tracking for reading progress
3. Auto-save progress on page unload
4. Display "Time spent: X minutes" indicator
5. Show reading progress bar

Example implementation:
```typescript
'use client'

export default function LessonPage() {
  const [timeSpent, setTimeSpent] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)

  // Track time
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1) // Increment every second
    }, 1000)

    // Save time every 30 seconds
    const saveTimer = setInterval(() => {
      saveTimeSpent(timeSpent)
    }, 30000)

    return () => {
      clearInterval(timer)
      clearInterval(saveTimer)
      saveTimeSpent(timeSpent) // Save on unmount
    }
  }, [timeSpent])

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      setScrollProgress(Math.min(100, Math.max(0, scrolled)))
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Display: "Tiempo invertido: 5 minutos"
  // Display: Progress bar showing scrollProgress
}
```

#### API Endpoints
Create new endpoints:
- `POST /api/progress/start` - Log lesson start
- `PATCH /api/progress/time` - Update time spent
- `PATCH /api/progress/reading` - Update reading progress
- `GET /api/progress/stats` - Get learning statistics

### Phase 2: Learning Statistics Dashboard (Priority: MEDIUM)

#### Create Stats Component
File: `src/components/learning/LearningStats.tsx`

Display:
- Total learning time (hours:minutes)
- Lessons completed this week
- Current learning streak (days)
- Average time per lesson
- Most studied course
- Progress chart (lessons over time)

#### Add to Aprender Overview
File: `src/app/(main)/aprender/page.tsx`

Add LearningStats component at top of page.

#### Backend Stats Calculation
Add `getLearningStats()` function:
```typescript
export async function getLearningStats(userId: string) {
  // Calculate:
  // - Total time spent (sum of time_spent_seconds)
  // - Lessons completed (count where completed = true)
  // - Current streak (consecutive days with completions)
  // - Average time per lesson
  // - Most studied course (group by course_slug, count)
  // - Weekly progress (lessons completed in last 7 days)
}
```

### Phase 3: Gamification (Priority: LOW)

#### Streak Tracking
Create `learning_streaks` table:
```sql
CREATE TABLE learning_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_completion_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Achievements/Milestones
Create `learning_achievements` table:
```sql
CREATE TABLE learning_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  achievement_type TEXT NOT NULL, -- 'first_lesson', 'course_complete', 'streak_7', etc.
  course_slug TEXT,
  achieved_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Achievement Types
- `first_lesson` - Completed first lesson
- `course_25` - Completed 25% of a course
- `course_50` - Completed 50% of a course
- `course_complete` - Completed entire course
- `streak_3` - 3-day learning streak
- `streak_7` - 7-day streak
- `streak_30` - 30-day streak
- `speed_reader` - Completed lesson in under 5 minutes
- `thorough_learner` - Spent over 30 minutes on a lesson

## Implementation Strategy

### Iteration 1: Database + Types
1. Create migration 015
2. Update database types
3. Run migration (user will need to apply it)

### Iteration 2: Backend Functions
1. Update `progress.ts` with new query functions
2. Create new API endpoints
3. Test with Postman/curl

### Iteration 3: Frontend Time Tracking
1. Add timer to lesson page
2. Add scroll progress tracking
3. Auto-save to API every 30 seconds
4. Display time spent indicator

### Iteration 4: Statistics Dashboard
1. Create LearningStats component
2. Add to aprender overview page
3. Style with charts (use recharts or similar)

### Iteration 5: Polish + Testing
1. Test all tracking features
2. Verify no performance issues
3. Add loading states
4. Handle errors gracefully

## Success Criteria
✅ Database migration created and documented
✅ TypeScript types updated
✅ Time tracking works on lesson pages
✅ Time is saved every 30 seconds
✅ Reading progress tracked with scroll
✅ Stats dashboard shows learning metrics
✅ No performance degradation
✅ Mobile-responsive design
✅ Error handling for offline/network issues
✅ Comprehensive documentation added

## Technical Specifications

### Time Tracking Precision
- Update every 30 seconds (not every second to reduce API calls)
- Save on page unload/navigation
- Handle browser tab switching (pause timer when inactive)
- Use `document.visibilityState` API

### Reading Progress Algorithm
```typescript
const scrollPercentage = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
const clampedProgress = Math.min(100, Math.max(0, scrollPercentage))
```

### Streak Calculation Logic
```typescript
function calculateStreak(completionDates: Date[]): number {
  // Sort dates descending
  // Check if each date is consecutive
  // Break on first non-consecutive day
  // Return streak count
}
```

## Code Quality Standards
- Follow existing patterns
- Use TypeScript properly
- Add proper error handling
- Responsive design
- Accessible components
- Performance optimization (debounce saves)
- Comprehensive comments

## Constraints
- Do NOT break existing progress tracking
- Do NOT remove current completion functionality
- Do NOT change course/lesson structure
- Use existing UI components
- Follow Next.js patterns
- Maintain Spanish language

## Documentation
Create `LEARNING_PROGRESS_TRACKING.md` with:
- Overview of tracking features
- API endpoint reference
- Database schema documentation
- Frontend implementation guide
- Future enhancement ideas

## Commit Message Format
```
feat: Enhance aprender progress tracking with time and analytics

- Add time tracking to lesson pages
- Implement scroll-based reading progress
- Create learning statistics dashboard
- Add database fields for tracking metadata
- New API endpoints for progress updates
- Display time spent and streak indicators

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

**Important**: Focus on Phase 1 (time tracking) first. Ensure it works perfectly before moving to advanced features.
