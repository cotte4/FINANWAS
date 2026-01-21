# Ralph Agent - Create Investigar Landing Page

## Objective
Create a polished, professional landing page for the `/investigar` route that serves as a hub for the stock research tools.

## Context
The app currently has two investigar sub-features:
1. `/investigar/scorecard` - Analyze individual stocks with detailed metrics
2. `/investigar/comparar` - Compare multiple stocks side-by-side

The navigation menu links to `/investigar` but no page exists there, causing a 404 error.

## Requirements

### Page Location
Create: `finanwas/src/app/(main)/investigar/page.tsx`

### Design Guidelines
1. **Match existing design system** - Use components from `@/components/ui/`
2. **Consistent layout** - Follow patterns from other main pages (portfolio, metas, notas)
3. **Professional polish** - High-quality UX, helpful descriptions, clear CTAs
4. **Responsive design** - Works on mobile and desktop
5. **Icons** - Use lucide-react icons (Search, LineChart, BarChart3, TrendingUp, etc.)

### Page Structure

**Hero Section:**
- Page title: "Investigar Empresas"
- Subtitle explaining the research tools available
- Professional introduction to fundamental analysis

**Tool Cards (2 main cards):**

1. **Scorecard Card**
   - Icon: LineChart or ClipboardCheck
   - Title: "Scorecard de Acciones"
   - Description: Explain what scorecard analysis does (analyze individual stocks with detailed financial metrics, ratings, etc.)
   - CTA Button: "Analizar Acción" → `/investigar/scorecard`
   - Visual indicator (icon, badge, or accent color)

2. **Comparar Card**
   - Icon: BarChart3 or ArrowLeftRight
   - Title: "Comparar Acciones"
   - Description: Explain comparison tool (compare multiple stocks side-by-side on key metrics)
   - CTA Button: "Comparar Acciones" → `/investigar/comparar`
   - Visual indicator

**Optional Enhancement Sections:**
- "¿Qué es el análisis fundamental?" info section
- Quick tips for using the tools
- Popular ticker suggestions (AAPL, MSFT, GOOGL, TSLA, etc.)

### Technical Requirements
1. **Server Component** - Use Next.js App Router server component pattern
2. **Authentication** - Already protected by (main) layout
3. **SEO** - Add proper metadata export
4. **TypeScript** - Fully typed
5. **Accessibility** - Proper semantic HTML, aria labels

### Design Inspiration
Look at these existing pages for consistency:
- `finanwas/src/app/(main)/portfolio/page.tsx` - Layout patterns
- `finanwas/src/app/(main)/metas/page.tsx` - Card grid patterns
- `finanwas/src/app/(main)/notas/page.tsx` - Hero section patterns

### Styling
- Use Tailwind CSS classes
- Card hover effects
- Smooth transitions
- Gradient accents (matching app theme)
- Consistent spacing (gap-4, gap-6, p-6, etc.)

### Content Tone
- Professional but approachable
- Educational (help users understand what tools do)
- Action-oriented CTAs
- Spanish language (matching the rest of the app)

## Success Criteria
✅ Page renders without errors at `/investigar`
✅ Both tool cards clearly explain their purpose
✅ CTAs navigate to correct routes
✅ Design matches existing app aesthetic
✅ Responsive on mobile and desktop
✅ No console errors or warnings
✅ Professional, polished appearance

## Constraints
- Do NOT modify scorecard or comparar pages
- Do NOT change navigation components
- Only create the new landing page
- Use existing UI components where possible
- Follow Next.js 15+ App Router patterns

## Iteration Instructions
1. **First iteration:** Create the base page with structure
2. **Second iteration:** Polish design, add enhancements
3. **Third iteration:** Final review, test responsiveness
4. **Stop when:** Page is complete and polished (max 5 iterations)

## Commit Message Format
When done, create a commit:
```
feat: Add investigar landing page

- Create hub page for stock research tools
- Add scorecard and comparar tool cards
- Implement responsive layout
- Add SEO metadata

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

**Important:** Build this to full capacity with attention to detail. This is a user-facing feature that should feel professional and polished.
