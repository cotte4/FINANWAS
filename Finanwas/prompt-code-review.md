# Code Review and Optimization Task

You are performing a comprehensive code review of the Finanwas MVP codebase. Your task is to:

## 1. Find and Fix Unoptimized Code

Search for performance issues and optimize them:
- Unnecessary re-renders in React components
- Missing memoization (useMemo, useCallback)
- Inefficient database queries
- Redundant API calls
- Large bundle sizes
- Unoptimized images or assets
- Inefficient algorithms or data structures
- Missing indexes on database queries
- N+1 query problems

**Action: FIX IMMEDIATELY** - Make the optimization and commit changes.

## 2. Find and Fix Code Issues

Search for bugs, code smells, and issues:
- Potential runtime errors
- Memory leaks
- Missing error handling
- Incorrect TypeScript types (especially `as any`)
- Unused imports and variables
- Code duplication
- Security vulnerabilities
- Accessibility issues
- Missing loading states
- Broken edge cases

**Action: FIX IMMEDIATELY** - Fix the issue and commit changes.

## 3. Propose Future Features

Identify valuable features that would enhance the product but are not critical for MVP:
- UX improvements
- Additional functionality
- Integration opportunities
- Advanced features
- Performance monitoring
- Analytics capabilities
- User engagement features

**Action: DOCUMENT ONLY** - Add to `features_future.md` file (create if doesn't exist).

## Working Instructions

1. **Search systematically** through:
   - `/finanwas/src/app` - All pages and API routes
   - `/finanwas/src/components` - All React components
   - `/finanwas/src/lib` - All utility libraries
   - Key configuration files

2. **For each file reviewed:**
   - Check for optimizations (category 1)
   - Check for bugs/issues (category 2)
   - Note feature ideas (category 3)

3. **Fix immediately** (categories 1 & 2):
   - Make the fix
   - Test that build still passes
   - Commit with clear message: `fix: [OPTIMIZATION] description` or `fix: [BUG] description`

4. **Document features** (category 3):
   - Append to `features_future.md`
   - Group by category
   - Include brief description and rationale

5. **Create summary** after each iteration:
   - What was optimized
   - What was fixed
   - Features documented

## Format for features_future.md

```markdown
# Future Feature Ideas for Finanwas

Last Updated: YYYY-MM-DD

## UX Improvements
- **Feature Name**: Brief description
  - Rationale: Why this would be valuable
  - Effort: Low/Medium/High
  - Priority: Nice-to-have/Should-have/Could-have

## Advanced Features
...

## Integrations
...
```

## Important Notes

- Do NOT break existing functionality
- Run `npm run build` after each fix to verify
- Focus on HIGH IMPACT optimizations first
- Be pragmatic - don't over-engineer
- Document WHY for each change in commit messages
- If unsure about a fix, SKIP it and note in features_future.md for manual review

## Success Criteria

You've completed the task when:
- All major optimization opportunities are addressed
- All clear bugs/issues are fixed
- features_future.md contains 10-20 well-documented feature ideas
- Build passes successfully
- All changes are committed with clear messages

Start with the most critical files first:
1. API routes (performance-critical)
2. Main page components (user-facing)
3. Utility libraries (used everywhere)
4. Database queries (data integrity)

Begin now!
