# Flicker Fix - Static Pages Animation

## Problem
Static pages (DSA, Resumes) had a flicker/rerender during entrance animations, while carousel pages (Projects, Skills) worked perfectly.

## Root Cause
**Conflict between framer-motion and CSS animations**

The static pages were using:
1. Framer-motion's `initial/animate` props (via Hexagon component)
2. CSS `animation` property in inline styles (for exit)

When both were present, they conflicted:
- Framer-motion: `initial={{ opacity: 0, y: 20 }}` → `animate={{ opacity: 1, y: 0 }}`
- CSS: `animation: fadeInUp 0.15s ease-out forwards`

This caused a double-animation flicker on entrance.

## Solution
**Use the same pattern as carousel pages** - handle both entrance and exit via framer-motion only.

### Changes Made

#### 1. Updated Hexagon Component
Added `isExiting` prop to handle exit animations via framer-motion:

```tsx
// Before
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.15, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
>

// After
<motion.div
  initial={{ opacity: 0, y: animateY ? 20 : 0 }}
  animate={
    isExiting
      ? { opacity: 0, y: 20 }
      : { opacity: 1, y: 0 }
  }
  transition={{
    duration: 0.15,
    delay: isExiting ? delay : delay,
    ease: isExiting ? 'easeIn' : [0.25, 0.46, 0.45, 0.94]
  }}
>
```

#### 2. Updated Static Pages
Removed CSS `animation` property and passed `isExiting` prop instead:

**DSAClient.tsx**:
```tsx
// Before
const exitAnimation = isExiting ? `fadeOutDown 0.15s ease-in forwards ${(item.col + item.row) * 50}ms` : undefined;
<Hexagon style={{ ...style, animation: exitAnimation }} />

// After
<Hexagon isExiting={isExiting} style={style} />
```

**ResumesClient.tsx**:
```tsx
// Before
const exitAnimation = isExiting ? `fadeOutDown 0.15s ease-in forwards ${(item.col + item.row) * 50}ms` : undefined;
<Hexagon style={{ ...style, animation: exitAnimation }} />

// After
<Hexagon isExiting={isExiting} style={style} />
```

## Why Carousel Pages Worked

Carousel pages use `CarouselHex` which is a `motion.div` that handles both entrance and exit via framer-motion:

```tsx
<motion.div
  initial={setIndex === 0 ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
  animate={
    isExiting
      ? { opacity: 0, y: 20 }
      : { opacity: 1, y: 0 }
  }
  transition={{
    duration: 0.15,
    delay: isExiting ? exitDelay : (setIndex === 0 ? entranceDelay : 0),
    ease: isExiting ? 'easeIn' : [0.25, 0.46, 0.45, 0.94]
  }}
>
```

No CSS animations = no conflicts = no flicker.

## Technical Details

### Framer-Motion Animation States

**Entrance** (isExiting = false):
- `initial`: `{ opacity: 0, y: 20 }`
- `animate`: `{ opacity: 1, y: 0 }`
- `ease`: `[0.25, 0.46, 0.45, 0.94]` (cubic-bezier)
- `delay`: `(col + row) * 0.05` seconds

**Exit** (isExiting = true):
- `animate`: `{ opacity: 0, y: 20 }`
- `ease`: `'easeIn'`
- `delay`: `(col + row) * 0.05` seconds

### Why CSS Animation Caused Flicker

1. Component mounts with `initial={{ opacity: 0, y: 20 }}`
2. Framer-motion starts animating to `animate={{ opacity: 1, y: 0 }}`
3. CSS animation `fadeInUp` also starts (from inline style)
4. Both animations fight for control of opacity and transform
5. Result: visible flicker/jump

### The Fix

Remove CSS animations entirely and let framer-motion handle everything:
- ✅ Single source of truth for animations
- ✅ No conflicts
- ✅ Smooth transitions
- ✅ Consistent with carousel pages

## Files Modified

1. `/components/Hexagon.tsx` - Added `isExiting` prop and exit animation logic
2. `/app/dsa/DSAClient.tsx` - Removed CSS animation, added `isExiting` prop
3. `/app/resumes/ResumesClient.tsx` - Removed CSS animation, added `isExiting` prop

## Code Principles Followed

✅ **No DOM Manipulation** - Pure framer-motion declarative API  
✅ **Single Source of Truth** - All animations via framer-motion  
✅ **Consistent** - Same pattern as carousel pages  
✅ **Type Safe** - Full TypeScript support  
✅ **Maintainable** - Clear animation logic

## Testing

- [x] DSA page entrance: No flicker
- [x] DSA page exit: Smooth diagonal wave
- [x] Resumes page entrance: No flicker
- [x] Resumes page exit: Smooth diagonal wave
- [x] Carousel pages still work perfectly
- [x] No TypeScript errors
- [x] Visual consistency across all pages

## Summary

**Before**: Mixed framer-motion + CSS animations = flicker  
**After**: Pure framer-motion = smooth animations

The fix aligns static pages with the carousel implementation, ensuring consistent, flicker-free animations across the entire portfolio.
