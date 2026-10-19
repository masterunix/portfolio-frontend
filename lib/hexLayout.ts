/**
 * hexLayout.ts: Geometry for the honeycomb grids.
 *
 * Hexagons are sized from the viewport width (up to a 16:10 shape), rows are offset by half a hex on odd
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

/**
 * The widest shape the grid is sized for. Hexes scale with the window's width, but no
 * further than a 16:10 window (a MacBook) of the same height would give them, so a
 * wider, shorter 16:9 monitor shows the same framing instead of a zoomed-in one.
 */
const MAX_ASPECT = 1.6;

export function computeHexLayout(viewport: { width: number; height: number }, config: GridConfig): HexLayout {
  const { rows, cols, gap, scale } = config;
  let hexWidth = Math.floor(Math.min(viewport.width, viewport.height * MAX_ASPECT) / scale);
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
    x: col * layout.spacingX + (Math.abs(row % 2) === 1 ? layout.spacingX / 2 : 0),
    y: row * layout.spacingY,
  };
}

/**
 * Every [row, col] with a hex that shows in the window, inside the grid or beyond it
 * (negative or past `cols`), so a filled honeycomb reaches every edge whatever the
 * window's shape.
 */
export function visibleCells(layout: HexLayout, viewport: { width: number; height: number }): Array<[number, number]> {
  const { hexWidth, hexHeight, spacingX, spacingY, startX, startY } = layout;
  const cells: Array<[number, number]> = [];
  const firstRow = Math.ceil((-startY - hexHeight) / spacingY);
  const lastRow = Math.floor((viewport.height - startY) / spacingY);
  for (let row = firstRow; row <= lastRow; row++) {
    const x = startX + hexOffset(layout, row, 0).x;
    const firstCol = Math.ceil((-x - hexWidth) / spacingX);
    const lastCol = Math.floor((viewport.width - x) / spacingX);
    for (let col = firstCol; col <= lastCol; col++) cells.push([row, col]);
  }
  return cells;
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
  // Cells tiles can't use: at the edges, they're often off-screen. (The honeycomb still
  // draws empty hexes there, and beyond the grid, to fill the window.)
  skip: [[0, 0], [2, 0], [0, 7], [1, 7], [2, 7], [3, 7]],
};
