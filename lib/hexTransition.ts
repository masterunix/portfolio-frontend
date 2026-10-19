/**
 * hexTransition.ts — Timing for the hexagon intro and outro, shared by every page.
 *
 * Both are a diagonal wave from the top-left: each hex starts (row + col) steps after
 * the first. The animations themselves are CSS (globals.css, .hex); this file gives
 * each hex its delays and tells the page when the outro is over.
 * - Intro: each hex fades in and slides up 20px. It fades via --hex-fade, so its
 *   glass blur fades in together with its outline (see HexShell).
 * - Outro: the wave carries on in the same direction, each hex fading out and sliding
 *   down 20px. It fades via real `opacity`, so each hex's blur drops off the moment it
 *   starts leaving: that's the sweep. A page navigates a beat after the last hex is gone.
 */

/** How long one hex takes to fade in or out, in seconds (the .hex animations in globals.css) */
export const HEX_FADE_DURATION = 0.15;

/** Seconds between one diagonal of the wave and the next */
export const HEX_STAGGER = 0.05;

/** The empty beat between the last hex leaving and the next page, in ms */
export const EXIT_PAUSE_MS = 150;

/** Intro delay for the hex at (row, col), in seconds */
export function enterDelay(row: number, col: number, stagger = HEX_STAGGER): number {
  return Math.max(0, row + col) * stagger;
}

/** Outro delay for the hex at (row, col), in seconds: the top-left hex leaves first */
export function exitDelay(row: number, col: number): number {
  return Math.max(0, row + col) * HEX_STAGGER;
}

/** When to navigate after the outro starts, in ms. `lastStep` is the largest row + col on screen. */
export function exitDurationMs(lastStep: number): number {
  return Math.round((lastStep * HEX_STAGGER + HEX_FADE_DURATION) * 1000) + EXIT_PAUSE_MS;
}

/**
 * The largest screen row + column on a carousel page. Carousel exits go by screen
 * column (Carousel): 0 is the column partly off the left edge.
 */
export function carouselLastStep(viewportWidth: number, hexSpacing: number, rows: number): number {
  const visibleCols = Math.ceil(viewportWidth / hexSpacing) + 1;
  return visibleCols - 1 + rows - 1;
}

/** The largest row + col among some [row, col] cells */
export function lastStepOf(cells: ReadonlyArray<readonly [number, number]>): number {
  return cells.reduce((max, [row, col]) => Math.max(max, row + col), 0);
}
