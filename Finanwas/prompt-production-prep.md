# Production Preparation Task - Remove Mock Data & Ensure Empty States

You are preparing the Finanwas MVP for production deployment. Your task is to ensure the app properly handles real users with no data.

## Mission: Zero Mock Data, Perfect Empty States

A new user registering today should see:
- ✅ A clean, empty dashboard with helpful prompts
- ✅ "No data yet" messages with clear CTAs
- ✅ NO placeholder/mock data
- ✅ NO "TODO: Connect to API" comments in production code
- ❌ NO fake portfolio assets
- ❌ NO sample goals or notes
- ❌ NO hardcoded example data

## Systematic Review & Fix

### 1. Find and Remove ALL Mock Data

Search for:
- Hardcoded sample data arrays
- Placeholder content in components
- Mock API responses
- Example/demo data
- TODO comments about connecting real data
- Commented-out real implementations

**Action: REMOVE IMMEDIATELY** and replace with proper empty state handling.

### 2. Implement Proper Empty States

For each data-dependent component, ensure:

**Dashboard Widgets:**
- Portfolio widget: "No assets yet. Add your first investment →"
- Goals widget: "No goals set. Create your first goal →"
- Learning widget: "Start learning. Browse courses →"
- Tips widget: Should work (tips are static content)

**Main Pages:**
- `/portfolio`: Empty state with "Add Asset" CTA
- `/metas`: Empty state with "Create Goal" CTA
- `/notas`: Empty state with "Write Note" CTA
- `/aprender`: Should show courses even when progress is empty

**Components:**
- All tables: Empty state with icon + message + action button
- All charts: Show placeholder or hide when no data
- All stats: Show "—" or "0" instead of errors

### 3. Verify Data Initialization

Check that new user accounts get:
```typescript
// ✅ Good - Empty states
user_profiles: { user_id, country, questionnaire_completed: false, ... all else null }
portfolio_assets: [] (empty array)
savings_goals: [] (empty array)
notes: [] (empty array)
lesson_progress: [] (empty array)

// ❌ Bad - Mock data
portfolio_assets: [{ ticker: "AAPL", name: "Apple Inc", ... }] // NO!
```

### 4. Remove Development TODOs

Search for TODO/FIXME comments that indicate:
- Features not yet implemented
- Placeholder data being used
- APIs not yet connected
- Mock responses

**Action:** Either implement the feature properly OR remove the TODO if it's already done.

### 5. Validate Empty State UX

For each empty state, ensure:
- **Clear message**: What's missing? ("No goals yet")
- **Visual element**: Icon or illustration
- **Call to action**: What can the user do? ("Create your first goal")
- **Proper styling**: Not an error state, just empty
- **Responsive**: Works on mobile

## Files to Check Systematically

### Priority 1 - Dashboard & Widgets (CRITICAL)
- `/app/(main)/dashboard/page.tsx`
- `/components/dashboard/PortfolioWidget.tsx`
- `/components/dashboard/GoalsWidget.tsx`
- `/components/dashboard/LearningWidget.tsx`
- `/components/dashboard/TipWidget.tsx`

### Priority 2 - Main Pages
- `/app/(main)/portfolio/page.tsx`
- `/app/(main)/metas/page.tsx`
- `/app/(main)/notas/page.tsx`
- `/app/(main)/aprender/page.tsx`
- `/app/(main)/glosario/page.tsx`

### Priority 3 - API Routes
- All `/api/*` routes - ensure no mock responses
- Check for hardcoded data in responses
- Verify proper empty array returns

### Priority 4 - Database Initialization
- `/api/auth/register/route.ts` - check what gets created
- Any seed data or migration files
- Profile creation logic

### Priority 5 - Content Files
- `/content/courses/*` - ensure real content
- `/content/tips/*` - ensure real tips
- `/content/glossary/*` - ensure real terms

## Commit Strategy

Group related changes:
```bash
# Example commits
fix: [PROD-PREP] Remove mock data from dashboard widgets
fix: [PROD-PREP] Add proper empty states to portfolio/goals/notes pages
fix: [PROD-PREP] Clean up TODO comments and implement missing features
fix: [PROD-PREP] Ensure new users start with empty data
```

## Success Criteria

The app is production-ready when:
- ✅ A brand new user sees ZERO mock data
- ✅ Every page handles empty state gracefully
- ✅ No TODOs about "connect later" in production code
- ✅ All CTAs from empty states work correctly
- ✅ Build passes with no warnings about missing data
- ✅ Manual test: Register new user → should see helpful empty states everywhere

## Testing Checklist

After changes, manually verify:
1. Create new test user account
2. Check dashboard - should see empty widgets with helpful CTAs
3. Visit /portfolio - should see "Add your first asset"
4. Visit /metas - should see "Create your first goal"
5. Visit /notas - should see "Write your first note"
6. Visit /aprender - should see courses (content is static)
7. No console errors about missing data
8. All empty state CTAs navigate to correct pages

## Important Notes

- Do NOT remove content that should exist (courses, tips, glossary)
- Do NOT break existing functionality
- Focus on USER-generated data being empty by default
- Keep static content (educational material) intact
- Run build after each change
- Test in browser if needed

Start with Priority 1 (Dashboard) as it's the first thing users see!
