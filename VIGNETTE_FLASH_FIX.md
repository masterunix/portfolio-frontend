# Vignette Flash Fix

## Problem
When switching between pages, the background had a slight "boost" in color for a couple of frames, as if a layer of fade was removed.

### Root Cause
The **vignette overlay** was defined inside each page component (`<div className="vignette" />`). During Next.js page transitions:
1. Old page unmounts → vignette disappears
2. Brief moment with no vignette → background appears brighter
3. New page mounts → vignette reappears

This caused a visible flash/brightness boost during transitions.

## Solution
Moved the vignette overlay to the **root layout** (`app/layout.tsx`) so it persists across all page transitions.

## Changes Made

### 1. Added Vignette to Root Layout
**File**: `/app/layout.tsx`

```typescript
// Before
<body className="min-h-full bg-black relative">
  <ShaderBackground />
  <div className="relative z-10">
    {children}
  </div>
</body>

// After
<body className="min-h-full bg-black relative">
  <ShaderBackground />
  {/* Vignette overlay - persists across all pages to prevent flash */}
  <div className="vignette" />
  <div className="relative z-10">
    {children}
  </div>
</body>
```

### 2. Removed Vignette from All Pages
Removed `<div className="vignette" />` from:
- ✅ `/app/HomeClient.tsx`
- ✅ `/app/projects/ProjectsClient.tsx`
- ✅ `/app/skills/SkillsClient.tsx`
- ✅ `/app/dsa/DSAClient.tsx`
- ✅ `/app/resumes/ResumesClient.tsx`

## Technical Details

### Vignette CSS (unchanged)
The vignette overlay uses two pseudo-elements:

```css
.vignette::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at center,
      transparent 40%,
      rgba(0, 0, 0, 0.6) 100%);
  z-index: 1;
}

.vignette::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 30vh;
  pointer-events: none;
  background: linear-gradient(to bottom,
      rgba(0, 0, 0, 0.92) 0%,
      rgba(0, 0, 0, 0) 100%);
  z-index: 1;
}
```

### Z-Index Layering
```
1. ShaderBackground (z-index: 0, implicit)
2. Vignette overlay (z-index: 1, via ::before and ::after)
3. Page content (z-index: 10, via relative z-10)
```

### Why This Works
- **Root layout persists**: Never unmounts during page transitions
- **Vignette stays mounted**: No flash during transitions
- **Consistent darkening**: All pages have the same vignette effect
- **No performance impact**: Single vignette instead of per-page

## Benefits

✅ **No flash**: Vignette persists across all page transitions  
✅ **Consistent**: Same darkening effect on all pages  
✅ **Performance**: Single vignette element instead of per-page  
✅ **Cleaner code**: DRY principle - defined once in layout  
✅ **Better UX**: Smooth transitions without visual artifacts

## Testing

- [x] Home → Projects: No flash
- [x] Projects → Skills: No flash
- [x] Skills → DSA: No flash
- [x] DSA → Resumes: No flash
- [x] Any page → Home: No flash
- [x] Vignette visible on all pages
- [x] No TypeScript errors

## Files Modified

- `/app/layout.tsx` - Added vignette overlay
- `/app/HomeClient.tsx` - Removed vignette
- `/app/projects/ProjectsClient.tsx` - Removed vignette
- `/app/skills/SkillsClient.tsx` - Removed vignette
- `/app/dsa/DSAClient.tsx` - Removed vignette
- `/app/resumes/ResumesClient.tsx` - Removed vignette

## Code Principles Followed

✅ **DRY (Don't Repeat Yourself)** - Single vignette definition  
✅ **Separation of Concerns** - Layout handles persistent UI  
✅ **Performance** - Fewer DOM elements, no remounting  
✅ **Maintainability** - One place to update vignette styling
