/**
 * hexTransition.ts — Timing for the hexagon intro and outro, shared by every page.
 *
 * The intro is a diagonal wave from the top-left: each hex fades in and slides up
 * 20px, starting (row + col) steps after the first. The outro is the intro played
 * backwards: the last hex to arrive leaves first, each one fading out and sliding
 * down with the intro's easing mirrored in time. A page navigates the moment the
 * last visible hex is gone.
 */

/** How long one hex takes to fade in or out, in seconds */
export const HEX_FADE_DURATION = 0.15;

/** How far a hex slides while fading, in px */
export const HEX_SLIDE = 20;

/** The intro's easing (fast start, gentle landing) */
export const ENTER_EASE = [0.25, 0.46, 0.45, 0.94] as const;

/**
 * ENTER_EASE reversed in time: cubic-bezier(1−x2, 1−y2, 1−x1, 1−y1). Fading out
 * with it retraces the intro's curve backwards (gentle lift-off, fast finish).
 */
export const EXIT_EASE = [0.55, 0.06, 0.75, 0.54] as const;

/** Seconds between one diagonal of the wave and the next */
export const HEX_STAGGER = 0.05;

/** Intro delay for the hex at (row, col), in seconds */
export function enterDelay(row: number, col: number, stagger = HEX_STAGGER): number {
  return (row + col) * stagger;
}

/**
 * Outro delay for the hex at (row, col), in seconds: the intro backwards.
 * `lastStep` is the largest row + col on screen, so that hex leaves first.
 */
export function exitDelay(row: number, col: number, lastStep: number, stagger = HEX_STAGGER): number {
  return Math.max(0, lastStep - (row + col)) * stagger;
}

/** How long the whole outro takes, in ms: when to navigate */
export function exitDurationMs(lastStep: number, stagger = HEX_STAGGER): number {
  return Math.round((lastStep * stagger + HEX_FADE_DURATION) * 1000);
}

/**
 * The largest screen row + column on a carousel page. Carousel exits go by screen
 * column (CarouselHex): 0 is the column partly off the left edge.
 */
export function carouselLastStep(viewportWidth: number, hexSpacing: number, rows: number): number {
  const visibleCols = Math.ceil(viewportWidth / hexSpacing) + 1;
  return visibleCols - 1 + rows - 1;
}

/** The largest row + col among some grid items */
export function lastStepOf(items: Array<{ row: number; col: number }>): number {
  return items.reduce((max, item) => Math.max(max, item.row + item.col), 0);
}
