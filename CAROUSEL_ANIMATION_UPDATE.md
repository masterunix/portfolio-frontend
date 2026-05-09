# Carousel Animation Update

## Overview
Updated the carousel animations in Live Projects and Skills/Experience pages to match the DSA Stats animation pattern using **pure framer-motion** - no DOM manipulation, no CSS keyframes.

## Problem Identified
The previous implementation violated code principles:
- ❌ Used `useAnimationFrame` with `ref.current.style.left` (DOM manipulation)
- ❌ Mixed CSS keyframes with framer-motion (inconsistent approach)
- ❌ Different pattern from DSA Stats (which uses pure framer-motion)

## Solution
Rewrote `CarouselHex` to match `Hexagon.tsx` pattern exactly:
- ✅ Pure framer-motion declarative API
- ✅ No DOM manipulation
- ✅ Consistent with DSA Stats implementation
- ✅ Uses `useTransform` for carousel scrolling

## Changes Made

### CarouselHex.tsx
**Before:** Mixed `useAnimationFrame` (DOM manipulation) with CSS animations.

**After:** Pure framer-motion implementation matching DSA Stats:

1. **Entrance Phase** (First set only)
   - Uses `motion.div` with `initial={{ opacity: 0, y: 20 }}`
   - Delay: `(col + row) * 0.05` seconds
   - Duration: 0.15s
   - Easing: `[0.25, 0.46, 0.45, 0.94]` (cubic-bezier)

2. **Active Phase** (Carousel scrolling)
   - Uses `useTransform` to map `carouselOffset` to X position
   - Declarative wrapping calculation
   - No DOM manipulation - framer-motion handles updates

3. **Exit Phase**
   - Uses `animate={{ opacity: 0, y: 20 }}`
   - Delay: `(col + row) * 0.05` seconds
   - Duration: 0.15s
   - Easing: `'easeIn'`

## Key Implementation Details

### Declarative Position Transform
```typescript
const x = useTransform(carouselOffset, (offset) => {
  const rawX = baseX - offset;
  let wrappedX = ((rawX % totalWidth) + totalWidth) % totalWidth;
  return wrappedX - hexSpacing;
});
```
- No refs, no DOM manipulation
- Pure functional transformation
- Framer-motion handles the updates

### Framer-Motion Animation States
```typescript
<motion.div
  initial={setIndex === 0 ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
  animate={isExiting ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
  transition={{
    duration: 0.15,
    delay: isExiting ? exitDelay : (setIndex === 0 ? entranceDelay : 0),
    ease: isExiting ? 'easeIn' : [0.25, 0.46, 0.45, 0.94]
  }}
  style={{ left: x, top: y, width, height }}
>
```
- Entrance: Only first set animates in
- Exit: All sets animate out
- Diagonal wave: `(col + row) * 0.05` delay

### Comparison with DSA Stats (Hexagon.tsx)
Both now use the **exact same pattern**:
- `motion.div` with `initial/animate/transition`
- Diagonal wave delays
- Same easing curves
- No DOM manipulation

## Benefits

1. **Code Consistency**: Matches DSA Stats implementation exactly
2. **No DOM Manipulation**: Pure React/framer-motion declarative API
3. **Better Performance**: Framer-motion optimizes updates internally
4. **Maintainability**: Single animation approach across codebase
5. **Type Safety**: Full TypeScript support throughout

## Testing Checklist

- [x] Entrance animation shows diagonal wave pattern (like DSA)
- [x] Carousel scrolls smoothly using useTransform
- [x] Exit animation shows diagonal wave pattern (like DSA)
- [x] No DOM manipulation violations
- [x] TypeScript compiles without errors
- [x] Works in both Projects and Skills pages

## Files Modified

- `/components/CarouselHex.tsx` - Rewritten to use pure framer-motion

## Files Using This Component

- `/app/projects/ProjectsClient.tsx` - Live Projects page
- `/app/skills/SkillsClient.tsx` - Skills/Experience page

## Code Principles Followed

✅ **No DOM Manipulation** - Uses framer-motion's declarative API  
✅ **Declarative** - All animations via motion.div props  
✅ **Consistent** - Matches Hexagon.tsx pattern exactly  
✅ **Type Safe** - Full TypeScript support  
✅ **Performance** - Framer-motion handles optimization  
✅ **Maintainable** - Single animation approach across codebase

## Technical Notes

### Why useTransform?
`useTransform` is framer-motion's declarative way to derive motion values:
- Input: `carouselOffset` (MotionValue)
- Output: Transformed X position (MotionValue)
- Framer-motion subscribes and updates automatically
- No manual DOM manipulation needed

### Why motion.div?
`motion.div` is framer-motion's enhanced div:
- Accepts `initial`, `animate`, `transition` props
- Handles all animation state internally
- Optimizes rendering automatically
- Consistent with DSA Stats approach
