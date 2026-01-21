# Ralph Agent - Mobile-First Improvements

## Objective
Enhance mobile user experience with gesture support (swipe to delete, pull to refresh) and mobile-optimized layouts for better usability on smartphones and tablets.

## Context
Mobile is likely the primary usage platform for many users. Currently, the app works on mobile but lacks native mobile gestures and optimizations that users expect from modern mobile apps.

## Requirements

### Phase 1: Swipe to Delete Gestures

#### Target Components
1. **Portfolio Assets** - Swipe to delete assets
2. **Goals** - Swipe to delete goals
3. **Notes** - Swipe to delete notes
4. **Dividend Payments** - Swipe to delete dividends

#### Implementation
Install gesture library:
```bash
npm install react-swipeable
```

**Example**: Portfolio Asset Swipe to Delete
File: `src/components/portfolio/AssetCard.tsx` (or create if doesn't exist)

```typescript
'use client'

import { useSwipeable } from 'react-swipeable'
import { useState } from 'react'
import { Trash2Icon } from 'lucide-react'

export function SwipeableAssetCard({ asset, onDelete }) {
  const [offset, setOffset] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      // Only allow left swipe (negative delta)
      if (eventData.deltaX < 0) {
        setOffset(Math.max(eventData.deltaX, -100)) // Max 100px
      }
    },
    onSwipedLeft: () => {
      // If swiped more than 50px, show delete button
      if (offset < -50) {
        setOffset(-100)
      } else {
        setOffset(0)
      }
    },
    onSwipedRight: () => {
      setOffset(0) // Reset on right swipe
    },
    trackMouse: false, // Only touch, not mouse
    trackTouch: true,
  })

  const handleDelete = async () => {
    setIsDeleting(true)
    await onDelete(asset.id)
  }

  return (
    <div className="relative overflow-hidden">
      {/* Delete button (revealed by swipe) */}
      <div
        className="absolute right-0 top-0 bottom-0 w-24 bg-destructive flex items-center justify-center"
        style={{
          transform: `translateX(${offset + 100}px)`,
          transition: isDeleting ? 'none' : 'transform 0.2s'
        }}
      >
        <button
          onClick={handleDelete}
          className="text-destructive-foreground p-4"
          disabled={isDeleting}
        >
          <Trash2Icon className="size-6" />
        </button>
      </div>

      {/* Asset card content */}
      <div
        {...handlers}
        className="relative bg-card border rounded-lg p-4"
        style={{
          transform: `translateX(${offset}px)`,
          transition: isDeleting ? 'transform 0.3s, opacity 0.3s' : 'transform 0.2s',
          opacity: isDeleting ? 0 : 1
        }}
      >
        {/* Asset card content */}
        <div className="flex justify-between">
          <div>
            <h3 className="font-medium">{asset.name}</h3>
            <p className="text-sm text-muted-foreground">{asset.ticker}</p>
          </div>
          <div className="text-right">
            <p className="font-medium">${asset.currentValue}</p>
            <p className={`text-sm ${asset.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {asset.gainLoss >= 0 ? '+' : ''}{asset.gainLossPercentage}%
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### Phase 2: Pull to Refresh

#### Target Pages
1. **Portfolio** - Refresh prices and data
2. **Dashboard** - Refresh all widgets
3. **Goals** - Refresh goal progress
4. **Notes** - Refresh notes list

#### Implementation
Install pull-to-refresh library:
```bash
npm install react-simple-pull-to-refresh
```

**Example**: Portfolio Pull to Refresh
File: `src/app/(main)/portfolio/page.tsx`

```typescript
'use client'

import PullToRefresh from 'react-simple-pull-to-refresh'

export default function PortfolioPage() {
  const [data, setData] = useState(null)

  const handleRefresh = async () => {
    // Refresh portfolio data
    await fetchPortfolio()
    // Optionally refresh prices
    await refreshPrices()
  }

  return (
    <PullToRefresh
      onRefresh={handleRefresh}
      pullingContent={<div className="text-center py-4">↓ Soltá para actualizar</div>}
      refreshingContent={<div className="text-center py-4">Actualizando...</div>}
    >
      <div className="space-y-6">
        {/* Portfolio content */}
      </div>
    </PullToRefresh>
  )
}
```

### Phase 3: Mobile-Optimized Layouts

#### Bottom Navigation Bar (Optional)
For better mobile navigation, add bottom tab bar (like Instagram, Twitter apps)

File: `src/components/layout/MobileBottomNav.tsx`

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  WalletIcon,
  TargetIcon,
  BookOpenIcon,
  UserIcon
} from 'lucide-react'

export function MobileBottomNav() {
  const pathname = usePathname()

  const links = [
    { href: '/dashboard', icon: HomeIcon, label: 'Inicio' },
    { href: '/portfolio', icon: WalletIcon, label: 'Portfolio' },
    { href: '/metas', icon: TargetIcon, label: 'Metas' },
    { href: '/aprender', icon: BookOpenIcon, label: 'Aprender' },
    { href: '/perfil', icon: UserIcon, label: 'Perfil' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t md:hidden z-50">
      <div className="flex justify-around items-center h-16">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname.startsWith(link.href)

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className="size-5 mb-1" />
              <span className="text-xs">{link.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
```

#### Large Touch Targets
Ensure all interactive elements are at least 44x44px for easy tapping.

**Update Button Components**:
```typescript
// Minimum height for mobile buttons
className="min-h-[44px] min-w-[44px]"
```

#### Improved Mobile Tables
Convert tables to cards on mobile for better readability.

**Example**: Portfolio Assets Table
```typescript
// Desktop: Table view
// Mobile: Card view

{isMobile ? (
  <div className="space-y-4">
    {assets.map(asset => (
      <AssetCard key={asset.id} asset={asset} />
    ))}
  </div>
) : (
  <Table>
    {/* Table view */}
  </Table>
)}
```

### Phase 4: Mobile Performance Optimizations

#### Lazy Loading Images
Use Next.js Image component with lazy loading:
```typescript
<Image
  src={imageSrc}
  alt={alt}
  width={width}
  height={height}
  loading="lazy"
  placeholder="blur"
/>
```

#### Reduce Initial Bundle Size
Code-split heavy components:
```typescript
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <Skeleton className="h-64" />,
  ssr: false // Don't render on server for mobile
})
```

#### Touch-Friendly Forms
- Larger input fields on mobile
- Proper input types (tel, email, number)
- Autofocus on first field
- Show numeric keyboard for numbers

```typescript
<Input
  type="tel"
  inputMode="numeric"
  pattern="[0-9]*"
  className="text-lg h-12" // Larger on mobile
/>
```

## Success Criteria
✅ Swipe to delete works on assets, goals, notes, dividends
✅ Pull to refresh works on portfolio, dashboard, goals
✅ Bottom navigation bar (optional but nice)
✅ All touch targets are 44x44px minimum
✅ Tables convert to cards on mobile
✅ Forms are touch-friendly
✅ No horizontal scrolling on any page
✅ Fast load times on mobile (< 3s)
✅ Gestures feel smooth and responsive
✅ Documentation created

## Implementation Strategy

### Iteration 1: Swipe to Delete
1. Install react-swipeable
2. Create SwipeableAssetCard component
3. Add to portfolio assets
4. Test swipe gestures
5. Add haptic feedback (if supported)

### Iteration 2: Pull to Refresh
1. Install react-simple-pull-to-refresh
2. Add to portfolio page
3. Add to dashboard page
4. Test refresh functionality
5. Add loading indicators

### Iteration 3: Mobile Layout Optimizations
1. Create MobileBottomNav component
2. Add to main layout
3. Convert tables to cards on mobile
4. Increase touch target sizes
5. Test on various screen sizes

### Iteration 4: Polish & Performance
1. Add lazy loading
2. Code-split heavy components
3. Optimize forms for mobile
4. Test on real mobile devices
5. Create documentation

## Code Quality Standards
- Follow existing patterns
- Use TypeScript properly
- Add proper error handling
- Smooth animations (60fps)
- Accessible gestures (alternative actions available)
- Performance optimization

## Constraints
- Do NOT break desktop experience
- Do NOT require external paid services
- Use existing UI components
- Follow Next.js patterns
- Maintain Spanish language

## Testing Checklist
Test on various screen sizes:
- [ ] iPhone SE (375px)
- [ ] iPhone 12/13/14 (390px)
- [ ] iPhone Pro Max (428px)
- [ ] iPad (768px)
- [ ] Android phones (various sizes)

Test gestures:
- [ ] Swipe to delete works smoothly
- [ ] Pull to refresh triggers correctly
- [ ] No accidental swipes
- [ ] Can still scroll normally

## Commit Message Format
```
feat: Add mobile-first improvements with gestures

- Install react-swipeable and react-simple-pull-to-refresh
- Implement swipe-to-delete for assets, goals, notes, dividends
- Add pull-to-refresh to portfolio, dashboard, goals pages
- Create MobileBottomNav component (optional navigation)
- Convert tables to cards on mobile screens
- Increase touch target sizes to 44x44px minimum
- Add mobile-optimized forms with proper input types
- Implement lazy loading for better mobile performance
- Create MOBILE_IMPROVEMENTS.md documentation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

**Important**: Focus on making gestures feel native and smooth. Test on real mobile devices, not just browser dev tools. Mobile users should feel the app is built specifically for them.
