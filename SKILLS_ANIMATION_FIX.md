# Skills Page Animation Fix

## Problem
The Skills/Experience page had different animations than the Live Projects page because it used **dynamic columns** based on the number of career skills, while Projects used **fixed 14 columns**.

### Issues:
- Different animation timing (diagonal wave delays)
- Different exit animation duration
- Inconsistent visual experience between pages

## Solution
Changed Skills page to use **fixed 14 columns** (same as Projects) for consistent animations.

## Changes Made

### 1. Fixed Column Count
```typescript
// Before
const GRID_CONFIG = {
  rows: 3,
  gap: 20
};

// After
const GRID_CONFIG = {
  rows: 3,
  cols: 14, // Fixed columns like Projects page
  gap: 20
};
```

### 2. Removed Dynamic Column Calculation
```typescript
// Before
const cols = Math.max(careerSkills.length, 1);
const layout = useMemo(() => {
  if (typeof window === 'undefined') return null;
  return computeHexLayout(window.innerWidth, window.innerHeight, { ...GRID_CONFIG, cols });
}, [mounted, cols]);

// After
const layout = useMemo(() => {
  if (typeof window === 'undefined') return null;
  return computeHexLayout(window.innerWidth, window.innerHeight, GRID_CONFIG);
}, [mounted]);
```

### 3. Fixed Grid Item Generation
```typescript
// Before
for (let col = 0; col < cols; col++) {
  // ...
}

// After
for (let col = 0; col < GRID_CONFIG.cols; col++) {
  // ...
}
```

### 4. Fixed Exit Animation Timing
```typescript
// Before
const maxDelay = (cols + GRID_CONFIG.rows) * 50;

// After
const maxDelay = (GRID_CONFIG.cols + GRID_CONFIG.rows) * 50;
```

## Result

Both pages now have:
- ✅ **Same grid structure**: 3 rows × 14 columns
- ✅ **Same entrance animation**: Diagonal wave with `(col + row) * 0.05s` delay
- ✅ **Same exit animation**: Diagonal wave with `(col + row) * 0.05s` delay
- ✅ **Same timing**: Exit completes in `(14 + 3) * 50ms = 850ms`
- ✅ **Consistent visual experience**: Both pages feel identical

## Technical Details

### Grid Layout
- **Rows**: 3 (top tech, middle career/projects, bottom tech)
- **Columns**: 14 (fixed)
- **Sets**: 3 (for infinite scroll wrapping)
- **Total hexagons**: 3 × 3 × 14 = 126 per page

### Animation Timing
- **Entrance delay**: `(col + row) * 0.05s` (0s to 0.85s diagonal wave)
- **Exit delay**: `(col + row) * 0.05s` (0s to 0.85s diagonal wave)
- **Duration**: 0.15s per hexagon
- **Total exit time**: 850ms + 150ms + 200ms buffer = 1200ms

### Data Wrapping
Career skills and tech skills wrap around to fill all 14 columns:
```typescript
// Middle row - career skills wrap
data = careerSkills[col % careerSkills.length];

// Top/bottom rows - tech skills wrap
data = topTech[col % topTech.length];
data = bottomTech[col % bottomTech.length];
```

## Files Modified
- `/app/skills/SkillsClient.tsx` - Fixed to use 14 columns like Projects

## Testing
- [x] Skills page entrance animation matches Projects
- [x] Skills page exit animation matches Projects
- [x] Diagonal wave timing is identical
- [x] No TypeScript errors
- [x] Career skills wrap correctly across 14 columns
- [x] Tech skills wrap correctly across 14 columns
