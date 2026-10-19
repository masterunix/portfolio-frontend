/**
 * Honeycomb.tsx — A fixed honeycomb of glass hexagons, centred in the window, with
 * tiles in some of its cells. Used inside HexPage (home, DSA, resumes, blog). A filled
 * honeycomb covers the whole window, with empty hexes wherever there's no tile.
 */
'use client';

import HexTile from '@/components/HexTile';
import Hexagon from '@/components/Hexagon';
import { useExitDuration } from '@/components/transition';
import { useViewportSize } from '@/hooks/useViewportSize';
import { computeHexLayout, hexOffset, visibleCells, type GridConfig } from '@/lib/hexLayout';
import { enterDelay, exitDelay, exitDurationMs, HEX_STAGGER, lastStepOf } from '@/lib/hexTransition';
import type { Tile } from '@/lib/tiles';

interface HoneycombProps {
  grid: GridConfig;
  cells: Array<{ cell: readonly [number, number]; tile: Tile }>;
  /** Fill the window with empty hexagons around the tiles (default), or show only the tiles */
  fill?: boolean;
  /** Seconds between diagonals of the intro wave */
  stagger?: number;
}

export default function Honeycomb({ grid, cells, fill = true, stagger = HEX_STAGGER }: HoneycombProps) {
  const viewport = useViewportSize();
  const layout = viewport && computeHexLayout(viewport, grid);
  const tiles = new Map(cells.map(({ cell, tile }) => [cell.join('-'), tile]));
  const shown: Array<readonly [number, number]> = cells.map(({ cell }) => cell);
  if (fill && layout && viewport) {
    shown.push(...visibleCells(layout, viewport).filter((cell) => !tiles.has(cell.join('-'))));
  }
  useExitDuration(exitDurationMs(lastStepOf(shown)));

  if (!layout) return null;

  return (
    <div className="absolute inset-0">
      {shown.map(([row, col]) => {
        const { x, y } = hexOffset(layout, row, col);
        const tile = tiles.get(`${row}-${col}`);
        return (
          <Hexagon
            key={`${row}-${col}`}
            delay={enterDelay(row, col, stagger)}
            exitDelay={exitDelay(row, col)}
            style={{ left: layout.startX + x, top: layout.startY + y, width: layout.hexWidth, height: layout.hexHeight }}
          >
            {tile && <HexTile tile={tile} />}
          </Hexagon>
        );
      })}
    </div>
  );
}
