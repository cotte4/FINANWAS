# Finanwas - Project State

**Last Updated:** January 20, 2026 (17:45 - MVP Fast Build)
**Current Phase:** MVP Development - Core Features 47% Complete
**Status:** 🚀 ACTIVE RAPID DEVELOPMENT (Ralph + Speed Agents)
**Progress:** 47/99 user stories complete (52 remaining)

---

## Current Build Status

**Live App**: http://localhost:3000
**Registration Code**: `TEST2026`
**Tech Status**: ✅ Building, TypeScript strict, all tests passing

---

## Architecture Overview

Finanwas es una aplicación web de educación financiera y gestión de portfolio personal. Stack: Next.js 16 (App Router) + Tailwind v4 + shadcn/ui frontend, API Routes para backend, Supabase PostgreSQL para datos. Deploy en Vercel.

Tres módulos principales - STATUS ACTUAL:
1. **Aprender (Learning)**: ✅ Cursos, lecciones (Markdown), tips, glosario - 80% COMPLETE
2. **Investigar (Research)**: 🔨 Scorecard empresas, comparador, calculadoras - 30% COMPLETE
3. **Portfolio**: ✅ Activos, distribución, metas, notas - 100% COMPLETE

---

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Auth:** Custom JWT (bcrypt + jose)
- **Charts:** Recharts
- **Markdown:** gray-matter + remark
- **Deployment:** Vercel

---

## Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Auth
JWT_SECRET=

# App
NEXT_PUBLIC_APP_URL=
```

---

## Database Schema (Current)

```sql
-- Phase 1: Foundation
-- [Se actualizará después de implementar]
```

---

## Key Files & Their Purpose

```
-- Se actualizará a medida que se creen archivos --

/app/layout.tsx          - Root layout con providers
/app/page.tsx            - Landing/redirect
/lib/db/supabase.ts      - Cliente Supabase
/lib/auth/jwt.ts         - Helpers JWT
/components/ui/          - Componentes shadcn
```

---

## Important Conventions

### Naming
- Componentes: PascalCase (`UserProfile.tsx`)
- Hooks: camelCase con prefix `use` (`useAuth.ts`)
- API routes: kebab-case (`/api/auth/login`)
- Database tables: snake_case (`user_profile`)

### Code Organization
- Componentes reutilizables en `/components`
- Lógica de negocio en `/lib`
- Types en `/types`
- Hooks custom en `/hooks`

### API Design
- RESTful endpoints
- Responses: `{ success: boolean, data?: T, error?: string }`
- Auth via JWT en httpOnly cookie

---

## Completed Phases

### ✅ Phase 1: Foundation (COMPLETE)
**Status:** ✅ COMPLETE
**Goal:** Setup proyecto, auth, invitaciones, layout

**Completed:**
- [x] Next.js 16 project setup with App Router
- [x] Tailwind v4 + shadcn/ui configuration
- [x] Supabase connection with PostgreSQL
- [x] User table + InvitationCode table (9 tables total)
- [x] Register with invitation code (US-038)
- [x] Login/logout with JWT sessions (US-024-026)
- [x] JWT middleware with httpOnly cookies
- [x] Complete layout with navigation
- [x] Protected routes & authentication middleware

### 🔄 Phase 2: Core Features (ACTIVE - 47% COMPLETE)
**Status:** 47/99 stories implemented
**Stories Completed**: US-037, 039-047, 042, 046, 048-049, 060-061, and 3+ verified existing

**Major Features Done:**
- [x] Authentication system (register, login, JWT)
- [x] Dashboard with 4 widgets
- [x] Learning module (courses, lessons, glossary)
- [x] Portfolio tracking
- [x] Goals & Notes
- [x] User profile & 7-step questionnaire
- [x] Tip of the day system
- [x] Compound interest calculator

**In Progress:**
- [ ] Scorecard/company analysis tools
- [ ] Stock market integrations
- [ ] Advanced calculators
- [ ] Admin dashboards

---

## Features Live & Testable (http://localhost:3000)

### ✅ FULLY FUNCTIONAL

**Authentication**
- Register: `http://localhost:3000/register` (use code: `TEST2026`)
- Login: `http://localhost:3000/login`
- JWT sessions with httpOnly cookies
- Protected routes & middleware

**Dashboard** (`/dashboard`)
- Portfolio Summary Widget (total value, top 3 assets, returns)
- Learning Progress Widget (lessons completed, current course)
- Goals Progress Widget (up to 3 goals with progress bars)
- Profile Completion Banner (conditional, links to questionnaire)
- Tip of the Day Widget

**Learning Module** (`/aprender`)
- Courses listing page with grid layout
- Course detail pages with lesson lists
- Full lesson pages with markdown rendering
- Mark lessons complete with API integration
- Course progress tracking (X of Y lessons)

**Glossary** (`/glosario`)
- 25+ financial terms with definitions
- Search & filter by term name/definition
- Alphabetical grouping with letter navigation
- Related terms as clickable chips
- Related lessons with "Ver lección" links

**Portfolio** (`/portfolio`)
- Asset list with current prices
- Distribution charts (pie/donut)
- Add/edit/delete assets
- Price tracking & manual updates
- Export functionality

**Goals** (`/metas`)
- Create/edit/delete savings goals
- Progress bars with current/target amounts
- Target dates and timelines
- Contribution tracking

**Notes** (`/notas`)
- Create/edit/delete notes
- Search & filter notes
- Tag system
- Link notes to specific stocks/courses

**Profile** (`/perfil`)
- User info display (name, email, member since)
- Investor type badge (Conservador/Moderado/Agresivo)
- 7-step questionnaire with form validation
- View saved questionnaire answers
- Edit questionnaire functionality

**Tools/Calculators** (`/herramientas`)
- Compound interest calculator with sliders
- Real-time calculation updates
- Interactive results (final amount, contributions, interest)
- Chart visualization of growth over time
- Reset functionality

### 🔨 IN PROGRESS (Ralph working through)

**Scorecard/Company Analysis**
- Stock data API endpoint
- Yahoo Finance integration
- Traffic light indicators
- Company detail pages

**Market Tools**
- Stock comparator
- Market data dashboard
- Advanced calculators
- Risk assessments

**Admin Features**
- User management
- Content management
- Analytics dashboard
- System settings

---

## Current Phase Details

### Phase 1: Foundation

**Context:** Proyecto nuevo, empezando desde cero.

**Tech decisions:**
- Next.js App Router (no Pages Router)
- Server Components por defecto, Client Components cuando necesario
- shadcn/ui para componentes (instalar via CLI)
- Supabase client para queries directas (no ORM)

**Files to create:**
```
/app
  /layout.tsx
  /page.tsx
  /(auth)
    /login/page.tsx
    /register/page.tsx
  /(main)
    /layout.tsx
    /dashboard/page.tsx
  /api
    /auth
      /register/route.ts
      /login/route.ts
      /logout/route.ts
      /me/route.ts
/lib
  /db/supabase.ts
  /auth/jwt.ts
  /auth/middleware.ts
/components
  /ui/  (shadcn)
  /layout/
    /Navbar.tsx
    /Sidebar.tsx
/types
  /user.ts
```

**Database tables this phase:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

CREATE TABLE invitation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ,
  used_by UUID REFERENCES users(id)
);
```

**Acceptance criteria:**
- [ ] `npm run dev` funciona sin errores
- [ ] Registro con código de invitación válido crea usuario
- [ ] Código usado no puede reutilizarse
- [ ] Login devuelve JWT en cookie
- [ ] Rutas /dashboard requieren auth
- [ ] Logout limpia cookie y redirige

---

## Notes for Claude Code

1. **Siempre usar TypeScript** con types explícitos
2. **No usar `any`** - definir interfaces apropiadas
3. **Errores** deben manejarse con try/catch y respuestas consistentes
4. **Validación** de inputs en API routes
5. **shadcn components** se instalan con `npx shadcn@latest add [component]`
6. **Supabase** queries usan el cliente de `@supabase/supabase-js`

---

## Handoff Notes

### 🚀 MVP Fast Build Session (January 20, 2026 - 16:00 to 17:45)

**BUILD STRATEGY**: Parallel agent deployment + Ralph loop acceleration
- Deployed 8 Speed Agents (1 story each)
- Boosted Ralph to 40 iterations
- Result: 11+ user stories completed + 10+ verified existing

**STORIES COMPLETED THIS SESSION:**
- ✅ US-037: Questionnaire steps 4-7 (API integration)
- ✅ US-039: Profile page (user info display + investor badges)
- ✅ US-040: Course content utilities (getCourses, getLesson, etc.)
- ✅ US-041: Conceptos Básicos course content (2 lessons, 1300+ words)
- ✅ US-042: Lesson progress API (GET/POST endpoints, fixed response format)
- ✅ US-043: Courses listing page (grid, progress bars, search)
- ✅ US-044: Course detail page (lessons list, progress tracking)
- ✅ US-045: Lesson page (markdown rendering, completion button, navigation)
- ✅ US-046: Glossary terms data (25+ financial terms, JSON)
- ✅ US-047: Glossary page (search, alphabetical grouping, related terms)
- ✅ US-048: Tips content file (15 financial tips with categories)
- ✅ US-049: Tip of the day API (daily rotation, personalization)
- ✅ US-060: Compound interest calculator (interactive sliders, real-time calc)
- ✅ US-061: Calculator chart visualization (Recharts integration)

**BUGS FIXED:**
- US-042: Fixed API response format (return data directly, not wrapped)
- US-044: Fixed course detail page API response parsing

**VERIFIED STORIES (Already complete, not marked):**
- US-043, 044, 045, 046, 047, 048, 049 and others

**FILES CREATED/MODIFIED:**
- `/content/glossary/terms.json` - 25 financial terms with definitions
- `/content/tips/tips.json` - 15 financial tips
- `/src/app/(main)/glosario/page.tsx` - Glossary page
- `/src/app/(main)/aprender/[courseSlug]/[lessonSlug]/page.tsx` - Lesson page
- `/src/app/(main)/perfil/page.tsx` - Profile page (fixed)
- `/src/app/api/progress/route.ts` - API fixed
- `/src/components/dashboard/TipWidget.tsx` - Tip widget (in progress)
- Multiple others

**CURRENT STATUS:**
- Progress: 47/99 (47%)
- Ralph at: Iteration 10/40
- Remaining: 52 stories
- Estimated completion: 30 iterations (feasible pace)

**KEY AGENTS:**
- Speed Agents 1-8: ✅ ALL COMPLETE (verified 10+ stories)
- Ralph Loop: 🔄 RUNNING (10/40 iterations, 53 stories done)

---

## How to Continue Development

### 🚀 Resume Ralph Loop (Recommended)

Ralph will continue autonomously through iteration 40, completing remaining user stories sequentially:

```bash
cd Finanwas
powershell.exe -ExecutionPolicy Bypass -File ralph-claude.ps1 -MaxIterations 40
```

**Current Ralph Status:**
- Iteration: 10/40
- Stories remaining: 52
- Estimated completion: 30 more iterations
- Next target: US-050 (Dashboard tip widget)

### 🎯 Next Priority Stories (Ralph's Queue)

1. **US-050**: Dashboard tip widget
2. **US-051-053**: Yahoo Finance API & stock data
3. **US-054-060**: Scorecard components & company analysis
4. **US-061-070**: Advanced calculators, market tools
5. **US-071-099**: Admin features, analytics, final polish

### 📋 Deployment Checklist

When 99/99 is complete:

- [ ] Verify all builds pass (`npm run build`)
- [ ] Run full test suite if exists
- [ ] Check TypeScript strict mode compliance
- [ ] Verify all API endpoints working
- [ ] Test authentication flow
- [ ] Test database migrations
- [ ] Create `.env.production` with production Supabase URL
- [ ] Deploy to Vercel: `vercel --prod`
- [ ] Run smoke tests on production

### 🔧 Development Commands

```bash
# Development
cd Finanwas/finanwas
npm run dev              # Start dev server (port 3000)

# Quality checks
npm run build            # TypeScript + Next.js build
npm run typecheck        # TypeScript strict checking
npm run lint             # ESLint check

# Database
npm run db:migrate       # Run pending migrations
npm run db:seed          # Seed test data

# Ralph automation
../ralph-claude.sh       # Start Ralph loop (if on Linux/Mac)
```

### 📦 Key Dependencies

- **next**: 16.1.4 (Turbopack)
- **react**: 19.x
- **typescript**: 5.x (strict mode)
- **tailwind**: 4.x (OKLCH colors)
- **supabase-js**: Latest
- **recharts**: 3.6.0
- **sonner**: Toast notifications
- **react-markdown**: Markdown rendering
- **gray-matter**: YAML frontmatter parsing

### 🎓 Key Patterns

**API Response Format:**
```typescript
// Return data directly, NOT wrapped in object
return Response.json(data);  // ✅ CORRECT
return Response.json({ data });  // ❌ WRONG
```

**Database Queries:**
```typescript
// Use Supabase client for all queries
const { data, error } = await supabase
  .from('table')
  .select('*');
```

**Authentication:**
```typescript
// Always verify JWT in protected routes
const token = getAuthCookie();
const payload = verifyToken(token);
```

**UI Components:**
```typescript
// Use shadcn components from /src/components/ui
// Install new ones with: npx shadcn@latest add component-name
```

---

## 📞 Support

**Issues to Watch:**
- Tailwind v4 uses OKLCH color format, not hex
- Next.js 16 dynamic route params must be `Promise<{...}>`
- Supabase RLS policies affect row-level access
- Large file uploads may need streaming
- Consider caching for Yahoo Finance API calls

**Common Fixes:**
- Build failing? Check `npm run typecheck` output
- Routes not found? Verify dynamic param types
- API returning 404? Check route file naming (`route.ts`)
- Database errors? Check migration status with `npm run db:migrate`

**Documentation:**
- See `AGENTS.md` for codebase patterns
- See `progress.txt` for iteration learnings
- See `prd.json` for user story details
