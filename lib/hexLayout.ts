/**
 * hexLayout.ts — Geometry for the honeycomb grids.
 *
 * Hexagons are sized from the viewport width, rows are offset by half a hex on odd
 * rows, and the grid is centred. Every value is a whole pixel, and the horizontal
 * spacing is even: Chrome snaps each hex's clip edge to whole pixels on its own, so a
 * .5px odd-row offset made alternate rows jitter against each other while animating.
 */

export interface GridConfig {
  rows: number;
  cols: number;
  /** Gap between hexagons, in px */
  gap: number;
  /** Viewport width ÷ hex width: bigger means smaller hexagons */
  scale: number;
  /** Cells left out of the grid entirely, as [row, col] */
  skip?: ReadonlyArray<readonly [number, number]>;
}

export interface HexLayout {
  hexWidth: number;
  hexHeight: number;
  /** Distance between neighbouring hexes' left edges in a row */
  spacingX: number;
  /** Distance between rows */
  spacingY: number;
  /** Left edge of column 0 when the grid is centred */
  startX: number;
  /** Top edge of row 0 when the grid is centred */
  startY: number;
}

export function computeHexLayout(viewport: { width: number; height: number }, config: GridConfig): HexLayout {
  const { rows, cols, gap, scale } = config;
  let hexWidth = Math.floor(viewport.width / scale);
  if ((hexWidth + gap) % 2 !== 0) hexWidth -= 1;
  // A regular hexagon is 2/√3 times as tall as it is wide
  const hexHeight = Math.round(hexWidth * 1.1547);
  const spacingX = hexWidth + gap;
  const spacingY = Math.round(hexHeight * 0.75) + gap;

  return {
    hexWidth,
    hexHeight,
    spacingX,
    spacingY,
    startX: Math.round((viewport.width - ((cols - 1) * spacingX + hexWidth)) / 2),
    startY: Math.round((viewport.height - ((rows - 1) * spacingY + hexHeight)) / 2),
  };
}

/** The top-left corner of the hex at (row, col), before centring */
export function hexOffset(layout: HexLayout, row: number, col: number): { x: number; y: number } {
  return {
    x: col * layout.spacingX + (row % 2 === 1 ? layout.spacingX / 2 : 0),
    y: row * layout.spacingY,
  };
}

/** Every [row, col] in the grid that isn't skipped, row by row */
export function gridCells(config: GridConfig): Array<[number, number]> {
  const cells: Array<[number, number]> = [];
  for (let row = 0; row < config.rows; row++) {
    for (let col = 0; col < config.cols; col++) {
      if (!config.skip?.some(([r, c]) => r === row && c === col)) cells.push([row, col]);
    }
  }
  return cells;
}

/** The full-window honeycomb of the home, resumes and blog pages */
export const WIDE_GRID: GridConfig = {
  rows: 4,
  cols: 8,
  gap: 20,
  scale: 5.69,
  // Trims the corners and the ragged right edge
  skip: [[0, 0], [2, 0], [0, 7], [1, 7], [2, 7], [3, 7]],
};
