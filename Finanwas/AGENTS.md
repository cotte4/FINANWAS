# Agent Patterns and Learnings

This file contains reusable patterns discovered during the development of Finanwas MVP.

## Project Structure Patterns

### Working Directory
- All `npm` commands must be run from the `/finanwas` directory
- The project root contains both the Next.js app and project metadata (PRD, progress log)

### File Paths
- Use absolute paths when creating/modifying files
- Next.js project structure:
  - `/finanwas/src/app` - App Router pages
  - `/finanwas/src/lib` - Server-side utilities (db, auth, api, utils)
  - `/finanwas/src/components` - React components (ui, layout, forms, charts)
  - `/finanwas/src/types` - TypeScript type definitions
  - `/content` - Static content (courses, tips, glossary)

## Technology Stack

### Next.js 16.1.4
- Using Turbopack (latest as of 2026-01-20)
- App Router with src directory
- TypeScript with strict mode
- Tailwind v4 (config in globals.css, not tailwind.config.ts)

### Authentication
- JWT tokens using `jose` library (recommended for Next.js)
- Password hashing using `bcryptjs` with 10 salt rounds
- HttpOnly cookies for token storage

### Database
- Supabase client for database access
- SQL migrations in `/finanwas/src/lib/db/migrations/`
- TypeScript interfaces with Row, Insert, and Update types

## Code Patterns

### Database Type Definitions
All database table interfaces follow this pattern:

```typescript
export interface TableNameRow {
  id: string;
  // ... all columns with their types
}

export interface TableNameInsert {
  // Omit id, created_at, and other auto-generated fields
}

export interface TableNameUpdate {
  // All fields optional except id (which cannot be changed)
}
```

### Authentication Helpers
Location: `/finanwas/src/lib/auth/`

- `jwt.ts` - JWT signing and verification (7-day expiry, HS256 algorithm)
- `password.ts` - Password hashing and verification (bcrypt, 10 rounds)
- Future: `cookies.ts` - Cookie management for auth tokens

### JSDoc Comments
All exported functions should include JSDoc comments for IDE documentation:

```typescript
/**
 * Brief description of what the function does
 * @param paramName - Description of parameter
 * @returns Description of return value
 */
export async function functionName(paramName: Type): Promise<ReturnType> {
  // implementation
}
```

## Database Migration Patterns

### Naming Convention
- Sequential numbering: `001_`, `002_`, `003_`, etc.
- Descriptive names: `create_users_table.sql`, `create_invitation_codes_table.sql`

### Migration Structure
```sql
-- Table comments for documentation
COMMENT ON TABLE table_name IS 'Description of table purpose';

-- Always include:
-- 1. Primary key (uuid with gen_random_uuid())
-- 2. Foreign keys with ON DELETE CASCADE or SET NULL
-- 3. Indexes on frequently queried columns
-- 4. Check constraints for data validation
-- 5. Default values for timestamps (now())

-- Example:
CREATE TABLE example (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT positive_amount CHECK (amount > 0)
);

CREATE INDEX idx_example_user_id ON example(user_id);
```

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `JWT_SECRET` - Secret for JWT signing/verification
- `NEXT_PUBLIC_APP_URL` - Application URL

## Build and Quality Checks

### Before Committing
1. Run `npm run build` from `/finanwas` directory
2. Ensure no TypeScript errors
3. Verify acceptance criteria are met
4. Update PRD to mark story as `passes: true`
5. Append progress to `progress.txt`

### Commit Message Format
```
feat: [Story ID] - [Story Title]

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

## Common Issues and Solutions

### Multiple Lockfiles Warning
- Warning appears due to lockfile at root level
- Safe to ignore or set `turbopack.root` in next.config.js
- Does not affect functionality

### Tailwind v4 Configuration
- Do NOT use `tailwind.config.ts`
- All configuration goes in `globals.css` using `@theme` directive
- Colors must be in OKLCH format, not hex
- Example: `#10B981` → `oklch(0.62 0.18 165)`

### shadcn/ui Components
- Use `sonner` instead of deprecated `toast` component
- Install with: `npx shadcn@latest add component-name`
- Components are in `/finanwas/src/components/ui/`

### Next.js 16 Dynamic Route Params
- Dynamic route params must be typed as `Promise<{...}>` and awaited
- Pattern for API routes: `{ params }: { params: Promise<{ id: string }> }`
- Always await params: `const { id } = await params;`
- This applies to all dynamic routes: `[id]`, `[slug]`, `[ticker]`, etc.
- Example:
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseSlug: string }> }
) {
  const { courseSlug } = await params;
  // ... rest of handler
}
```

## Next Steps for Future Agents

When implementing the next user story:
1. Read PRD to identify highest priority incomplete story
2. Create todo list with implementation steps
3. Implement following established patterns
4. Run quality checks (build, typecheck)
5. Update PRD and progress.txt
6. Commit with standardized message
7. Update this file with any new patterns discovered
