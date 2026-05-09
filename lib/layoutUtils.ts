/**
 * layoutUtils.ts — Layout calculation utilities for hexagonal grids.
 *
 * Provides pure functions for computing hex dimensions, grid spacing,
 * and individual hex positions. Used by the carousel pages (Projects, Skills)
 * to create a consistent honeycomb layout.
 *
 * Key design decisions:
 * - hexSpacingX is forced to an EVEN number to prevent Chromium sub-pixel
 *   phase jitter (see Chromium Bug Fix comment below)
 * - All spacing values are rounded to integers for pixel-perfect rendering
 * - Functions are pure (no side effects) and easily testable
 */

// ─── Types ───────────────────────────────────────────────────────────────────

/** Computed layout measurements for a hexagonal grid */
export interface HexLayout {
  /** Width of a single hexagon in pixels */
  hexWidth: number;
  /** Height of a single hexagon in pixels */
  hexHeight: number;
  /** Horizontal distance between hex centers (hexWidth + gap) */
  hexSpacingX: number;
  /** Vertical distance between hex centers (hexHeight × 0.75 + gap) */
  hexSpacingY: number;
  /** Y offset to vertically center the grid in the viewport */
  startY: number;
  /** Total width of one complete set of columns (cols × hexSpacingX) */
  setWidth: number;
}

/** Input configuration for the grid calculator */
export interface GridConfig {
  /** Number of rows in the grid */
  rows: number;
  /** Number of columns per set */
  cols: number;
  /** Gap between hexagons in pixels */
  gap: number;
}

// ─── Layout Computation ──────────────────────────────────────────────────────

/**
 * Compute hexagon dimensions and grid layout based on viewport size.
 *
 * @param viewportWidth  - Window inner width in pixels
 * @param viewportHeight - Window inner height in pixels
 * @param config         - Grid configuration (rows, cols, gap)
 * @returns Layout measurements for positioning hexagons
 */
export function computeHexLayout(
  viewportWidth: number,
  viewportHeight: number,
  config: GridConfig
): HexLayout {
  const { rows, cols, gap } = config;
  
  // Base hex width is 1/4.27 of viewport (25% smaller than original 1/3.2)
  let hexWidth = Math.floor(viewportWidth / 4.27);
  
  /**
   * Chromium Bug Fix: Chrome snaps mask/clip boundaries to physical integers
   * independently per element. In a honeycomb grid, odd rows are offset by
   * hexSpacingX / 2. If hexSpacingX is ODD, this produces a .5px offset,
   * causing even and odd rows to snap on different frames during animation.
   * This manifests as a visible "rippling" or "alternating" vibration.
   *
   * Fix: Force hexSpacingX to be EVEN so the half-offset is always a
   * perfect integer, and both row groups snap together as one unit.
   */
  if ((hexWidth + gap) % 2 !== 0) {
    hexWidth -= 1;
  }
  
  const hexHeight = Math.round(hexWidth * 1.1547); // Regular hexagon aspect ratio (2/√3)
  
  const hexSpacingX = hexWidth + gap; // Guaranteed even
  const hexSpacingY = Math.round(hexHeight * 0.75) + gap; // Guaranteed integer
  
  // Calculate grid dimensions and center vertically
  const gridHeight = (rows - 1) * hexSpacingY + hexHeight;
  const startY = Math.round((viewportHeight - gridHeight) / 2);
  
  // Width of one complete set of columns (used for carousel wrapping)
  const setWidth = cols * hexSpacingX;
  
  return {
    hexWidth,
    hexHeight,
    hexSpacingX,
    hexSpacingY,
    startY,
    setWidth
  };
}

// ─── Position Calculation ────────────────────────────────────────────────────

/**
 * Calculate X position for a hexagon in the grid.
 * Odd rows are offset by half a hex width for the honeycomb pattern.
 *
 * @param row        - Row index (0-based)
 * @param col        - Column index (0-based)
 * @param hexSpacingX - Horizontal spacing between hex centers
 * @param setIndex   - Which set (for infinite carousel: 0, 1, or 2)
 * @param setWidth   - Width of one complete set
 * @returns X position in pixels
 */
export function calculateHexX(
  row: number,
  col: number,
  hexSpacingX: number,
  setIndex: number,
  setWidth: number
): number {
  // Honeycomb offset: odd rows shift right by half spacing
  const rowOffset = row % 2 === 1 ? hexSpacingX / 2 : 0;
  
  // Base position within the set (shifted left by one hex for visual padding)
  const baseX = col * hexSpacingX + rowOffset - hexSpacingX;
  
  // Add set offset for carousel duplication
  const setOffset = setIndex * setWidth;
  
  return baseX + setOffset;
}

/**
 * Calculate Y position for a hexagon in the grid.
 *
 * @param row        - Row index (0-based)
 * @param hexSpacingY - Vertical spacing between hex centers
 * @param startY     - Top offset to center grid vertically
 * @returns Y position in pixels
 */
export function calculateHexY(
  row: number,
  hexSpacingY: number,
  startY: number
): number {
  return startY + row * hexSpacingY;
}
