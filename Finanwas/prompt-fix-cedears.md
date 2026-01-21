# Ralph Agent - Fix CEDEARS Not Appearing in Asset Type Dropdown

## Objective
Fix the bug where CEDEARS don't appear as an option when adding a new asset to the portfolio.

## Problem Analysis

### Root Cause
**File**: `src/components/portfolio/AddAssetModal.tsx`

**Issue**: Component uses a **hardcoded local `ASSET_TYPES` array** (lines 30-37) instead of importing from the centralized constants file.

**Consequences**:
- Local array has only 6 asset types
- Missing: CEDEAR, Fondo Común, ON (Obligación Negociable), Plazo Fijo
- Creates code duplication and inconsistency
- Value casing mismatch: local uses lowercase ("accion") vs centralized uses proper case ("Acción")

### Current State

**Local Array** (AddAssetModal.tsx lines 30-37):
```typescript
const ASSET_TYPES = [
  { value: "accion", label: "Acción" },
  { value: "etf", label: "ETF" },
  { value: "bono", label: "Bono" },
  { value: "crypto", label: "Crypto" },
  { value: "efectivo", label: "Efectivo" },
  { value: "otro", label: "Otro" },
]
```

**Centralized Constants** (src/lib/constants/asset-types.ts):
```typescript
export const ASSET_TYPES = [
  { value: 'Acción', label: 'Acción' },
  { value: 'ETF', label: 'ETF' },
  { value: 'Bono', label: 'Bono' },
  { value: 'Crypto', label: 'Criptomoneda' },
  { value: 'Efectivo', label: 'Efectivo' },
  { value: 'Fondo Común', label: 'Fondo Común de Inversión' },
  { value: 'Cedear', label: 'CEDEAR' },          // MISSING in modal
  { value: 'ON', label: 'Obligación Negociable' }, // MISSING
  { value: 'Plazo Fijo', label: 'Plazo Fijo' },   // MISSING
  { value: 'Otro', label: 'Otro' },
]
```

### Impact
- **User frustration**: Can't add CEDEAR assets
- **Data inconsistency**: Assets in DB might have different type values
- **Maintainability**: Two places to update when adding new asset types

## Requirements

### 1. Fix AddAssetModal Component
**File**: `src/components/portfolio/AddAssetModal.tsx`

**Changes**:
1. Remove local `ASSET_TYPES` array (lines 30-37)
2. Import from centralized constants
3. Update any type references to use imported constant

**Before**:
```typescript
const ASSET_TYPES = [
  { value: "accion", label: "Acción" },
  // ... hardcoded array
]
```

**After**:
```typescript
import { ASSET_TYPES } from '@/lib/constants/asset-types'
```

### 2. Verify Other Components
Check if any other components use hardcoded asset types:
- `EditAssetModal.tsx` - Likely has same issue
- Any asset display components
- Filter/search components

Update all to use centralized constants.

### 3. Database Consistency Check
**File**: `src/lib/db/migrations/006_create_portfolio_assets_table.sql`

Verify that:
- Database allows all asset type values
- No ENUM constraints that would reject new types
- Comment documents all supported types

Update comment if needed:
```sql
type TEXT NOT NULL, -- Asset type: Acción, ETF, Bono, Crypto, Efectivo, Fondo Común, Cedear, ON, Plazo Fijo, Otro
```

### 4. API Validation (Optional Enhancement)
**File**: `src/app/api/portfolio/route.ts`

Consider adding validation to ensure only valid asset types:
```typescript
import { ASSET_TYPES } from '@/lib/constants/asset-types'

const validTypes = ASSET_TYPES.map(t => t.value)
if (!validTypes.includes(type)) {
  return NextResponse.json(
    { error: 'Tipo de activo inválido' },
    { status: 400 }
  )
}
```

### 5. Type Safety Improvements
**File**: `src/lib/constants/asset-types.ts`

Ensure proper TypeScript types are exported:
```typescript
export type AssetType = typeof ASSET_TYPES[number]['value']

// Helper function to get label from value
export function getAssetTypeLabel(value: AssetType): string {
  return ASSET_TYPES.find(t => t.value === value)?.label ?? value
}
```

## Implementation Steps

### Step 1: Update AddAssetModal
1. Open `src/components/portfolio/AddAssetModal.tsx`
2. Remove lines 30-37 (local ASSET_TYPES array)
3. Add import at top: `import { ASSET_TYPES } from '@/lib/constants/asset-types'`
4. Verify dropdown still works
5. Test that all 10 asset types now appear

### Step 2: Check EditAssetModal
1. Open `src/components/portfolio/EditAssetModal.tsx`
2. Check if it has hardcoded asset types
3. If yes, apply same fix as AddAssetModal
4. Test editing assets with different types

### Step 3: Search for Other Occurrences
```bash
# Search for hardcoded asset type arrays
grep -r "accion.*label.*Acción" src/
grep -r "const ASSET_TYPES" src/
```

Fix any other hardcoded instances.

### Step 4: Test Thoroughly
1. **Add new CEDEAR asset**:
   - Click "Agregar Activo"
   - Select "CEDEAR" from type dropdown
   - Fill in ticker (e.g., "AAPL.BA"), quantity, price
   - Save
   - Verify it appears in portfolio

2. **Add other new types**:
   - Test "Fondo Común"
   - Test "ON"
   - Test "Plazo Fijo"

3. **Edit existing assets**:
   - Verify all types appear in edit modal
   - Change asset type and save
   - Verify change persists

4. **Verify no regressions**:
   - Existing asset types still work (Acción, ETF, Bono, etc.)
   - No console errors
   - No TypeScript errors

### Step 5: Verify Database
1. Check database for existing assets
2. Verify type column values are consistent
3. Update any assets with old lowercase values if needed

### Step 6: Optional - Add API Validation
1. Update POST /api/portfolio to validate asset type
2. Update PATCH /api/portfolio/[id] to validate type
3. Return helpful error if invalid type provided

## Success Criteria
✅ CEDEAR appears in asset type dropdown
✅ All 10 asset types are selectable
✅ Can successfully create CEDEAR asset
✅ Can create Fondo Común, ON, Plazo Fijo assets
✅ No hardcoded asset types remain in components
✅ EditAssetModal also uses centralized constants
✅ No TypeScript errors
✅ No console errors
✅ Database accepts all asset types
✅ Existing assets still work correctly

## Testing Checklist

| Test Case | Expected Result |
|-----------|----------------|
| Open AddAssetModal | See all 10 asset types |
| Select CEDEAR | Dropdown shows "CEDEAR" |
| Create CEDEAR asset | Asset saved successfully |
| Open EditAssetModal | See all 10 asset types |
| Change asset type | Update saves successfully |
| Filter by CEDEAR | Shows only CEDEAR assets |
| Existing assets | Still display correctly |

## Code Quality Standards
- Remove code duplication
- Use centralized constants
- Follow TypeScript best practices
- Add helpful comments
- Maintain existing functionality
- No breaking changes

## Constraints
- Do NOT change database schema (not needed)
- Do NOT modify asset-types.ts structure (it's correct)
- Do NOT break existing assets in database
- Use existing UI components
- Follow Next.js patterns
- Maintain Spanish language

## Related Files

| File | Purpose | Action Needed |
|------|---------|---------------|
| `components/portfolio/AddAssetModal.tsx` | Add asset form | ✅ Remove hardcoded array, import from constants |
| `components/portfolio/EditAssetModal.tsx` | Edit asset form | ⚠️ Check and fix if needed |
| `lib/constants/asset-types.ts` | Centralized types | ✅ Already correct, use this |
| `app/api/portfolio/route.ts` | Create asset API | 🔄 Optionally add validation |
| `lib/db/migrations/006_*.sql` | Database schema | 🔄 Optionally update comment |

## Documentation
Create or update `ASSET_TYPES.md` explaining:
- Available asset types
- How to add new asset types
- Where types are defined
- Why centralized constants are important

## Commit Message Format
```
fix: Add missing CEDEAR and other asset types to portfolio dropdown

- Remove hardcoded ASSET_TYPES from AddAssetModal
- Import from centralized lib/constants/asset-types.ts
- Fix EditAssetModal to use centralized constants
- Add missing types: CEDEAR, Fondo Común, ON, Plazo Fijo
- Remove code duplication between components
- Add API validation for asset types

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

**Important**: This is a simple but critical bug fix. The solution is straightforward - remove duplication and use the centralized constant that already exists.
