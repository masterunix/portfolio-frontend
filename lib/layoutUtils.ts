/**
 * Layout calculation utilities for hexagonal grids.
 * Matches the legacy projects-script.js calculations exactly.
 */

export interface HexLayout {
  hexWidth: number;
  hexHeight: number;
  hexSpacingX: number;
  hexSpacingY: number;
  startY: number;
  setWidth: number;
}

export interface GridConfig {
  rows: number;
  cols: number;
  gap: number;
}

/**
 * Compute hexagon dimensions and grid layout based on viewport size.
 * 
 * @param viewportWidth - Window inner width
 * @param viewportHeight - Window inner height
 * @param config - Grid configuration (rows, cols, gap)
 * @returns Layout measurements for positioning hexagons
 */
export function computeHexLayout(
  viewportWidth: number,
  viewportHeight: number,
  config: GridConfig
): HexLayout {
  const { rows, cols, gap } = config;
  
  // Base hex width is 1/4.27 of viewport (25% smaller than original 1/3.2)
  const hexWidth = Math.floor(viewportWidth / 4.27);
  const hexHeight = Math.floor(hexWidth * 1.1547); // Hexagon aspect ratio
  
  const hexSpacingX = hexWidth + gap;
  const hexSpacingY = hexHeight * 0.75 + gap; // Vertical overlap for honeycomb
  
  // Calculate grid dimensions
  const gridHeight = (rows - 1) * hexSpacingY + hexHeight;
  const startY = (viewportHeight - gridHeight) / 2; // Center vertically
  
  // Width of one complete set of columns
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

/**
 * Calculate X position for a hexagon in the grid.
 * Odd rows are offset by half a hex width for honeycomb pattern.
 * 
 * @param row - Row index (0-based)
 * @param col - Column index (0-based)
 * @param hexSpacingX - Horizontal spacing between hex centers
 * @param setIndex - Which set (for infinite carousel, 0-2)
 * @param setWidth - Width of one complete set
 * @returns X position in pixels
 */
export function calculateHexX(
  row: number,
  col: number,
  hexSpacingX: number,
  setIndex: number,
  setWidth: number
): number {
  // Odd rows offset by half spacing for honeycomb pattern
  const rowOffset = row % 2 === 1 ? hexSpacingX / 2 : 0;
  
  // Base position within the set
  const baseX = col * hexSpacingX + rowOffset - hexSpacingX;
  
  // Add set offset for carousel duplication
  const setOffset = setIndex * setWidth;
  
  return baseX + setOffset;
}

/**
 * Calculate Y position for a hexagon in the grid.
 * 
 * @param row - Row index (0-based)
 * @param hexSpacingY - Vertical spacing between hex centers
 * @param startY - Top offset to center grid vertically
 * @returns Y position in pixels
 */
export function calculateHexY(
  row: number,
  hexSpacingY: number,
  startY: number
): number {
  return startY + row * hexSpacingY;
}
