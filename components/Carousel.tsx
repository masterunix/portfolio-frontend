/**
 * Carousel.tsx: Three rows of glass hexagons scrolling sideways forever (projects,
 * skills): the main tiles in the middle row, supporting tiles above and below. A bar
 * of buttons, or the arrow keys, centres a main tile. Used inside HexPage.
 *
 * The grid is drawn three times side by side and positions wrap, so the copies loop
 * seamlessly (useCarousel moves them). It starts with the first main tile in the middle;
 * the hexes on screen wave in like the other pages, and the rest appear without
 * animating. The buttons follow the tile in the middle as the carousel drifts.
 */
'use client';

import { useCallback, useLayoutEffect, useMemo, useRef, type CSSProperties } from 'react';

import HexShell from '@/components/HexShell';
import HexTile from '@/components/HexTile';
import { useExitDuration, useIsExiting } from '@/components/transition';
import { carouselX, useCarousel } from '@/hooks/useCarousel';
import { useViewportSize } from '@/hooks/useViewportSize';
import { computeHexLayout, hexOffset, type GridConfig } from '@/lib/hexLayout';
import { carouselLastStep, enterDelay, exitDelay, exitDurationMs } from '@/lib/hexTransition';
import type { Tile } from '@/lib/tiles';

const GRID: GridConfig = { rows: 3, cols: 14, gap: 20, scale: 4.27 };
const COPIES = 3;

/** Columns per copy: at least 14, and a whole number of rounds of the main tiles, so every
    tile shows and the sequence runs on unbroken from one copy into the next */
const columnsFor = (count: number) => Math.max(1, Math.ceil(GRID.cols / Math.max(count, 1))) * Math.max(count, 1);

interface CarouselProps {
  /** The middle row, and the buttons */
  main: Tile[];
  /** The top and bottom rows */
  supporting: Tile[];
  /** Names the button bar for screen readers */
  label: string;
  /** The hint under the buttons */
  hint: string;
}

export default function Carousel({ main, supporting, label, hint }: CarouselProps) {
  const viewport = useViewportSize();
  const layout = useMemo(() => viewport && computeHexLayout(viewport, GRID), [viewport]);
  const spacing = layout?.spacingX ?? 0;
  const cols = columnsFor(main.length);
  const setWidth = cols * spacing;
  const loopWidth = setWidth * COPIES;

  // Every hex: its element (filled in by ref) and where it sits before scrolling
  const hexes = useRef<Array<{ el: HTMLElement | null; baseX: number; row: number }>>([]);
  const cells = [];
  if (layout) {
    for (let copy = 0; copy < COPIES; copy++) {
      for (let row = 0; row < GRID.rows; row++) {
        const tiles = row === 1 ? main : supporting;
        if (!tiles.length) continue;
        for (let col = 0; col < cols; col++) {
          const { x, y } = hexOffset(layout, row, col);
          cells.push({ copy, row, col, baseX: x + copy * setWidth - spacing, y: layout.startY + y, tile: tiles[col % tiles.length] });
        }
      }
    }
  }

  // Scroll so main tile `index` (middle row, middle copy) sits in the centre of the window
  const centre = useCallback((index: number) => {
    if (!layout || !viewport) return 0;
    const baseX = hexOffset(layout, 1, index).x + setWidth - spacing;
    return baseX - spacing - (viewport.width - layout.hexWidth) / 2;
  }, [layout, viewport, setWidth, spacing]);

  // Columns are spacing apart, so the one in the middle is a step count from column 0's
  const indexAt = useCallback((at: number) => {
    if (!spacing || !main.length) return 0;
    const col = Math.round((at - centre(0)) / spacing);
    return (((col % cols) + cols) % cols) % main.length;
  }, [centre, spacing, cols, main.length]);

  // Start with the first tile in the middle (in the middle copy, so there are hexes either side)
  const start = centre(0);

  const { offset, activeIndex, goTo } = useCarousel({ hexes, loopWidth, spacing, count: main.length, centre, indexAt, start });
  const isExiting = useIsExiting();
  useExitDuration(viewport && layout ? exitDurationMs(carouselLastStep(viewport.width, spacing, GRID.rows)) : 0);

  // The exit wave follows where each hex is on screen now, not its column in the data
  // (the carousel has scrolled). Odd rows sit half a hex right; taking that off keeps
  // every row's columns on the same diagonals. Hexes off screen to the left go first.
  useLayoutEffect(() => {
    if (!isExiting) return;
    for (const hex of hexes.current) {
      if (!hex.el) continue;
      const x = carouselX(hex.baseX, offset.current ?? start, loopWidth, spacing);
      const screenCol = Math.round((x - (hex.row % 2 === 1 ? spacing / 2 : 0)) / spacing) + 1;
      hex.el.style.setProperty('--out-delay', `${screenCol < 0 ? 0 : exitDelay(hex.row, screenCol)}s`);
    }
  }, [isExiting, offset, loopWidth, spacing, start]);

  if (!layout) return null;

  return (
    <>
      <div className="absolute inset-0">
        {cells.map((cell, i) => {
          // The intro wave runs by where each hex starts on screen; hexes off screen skip it
          const x = carouselX(cell.baseX, start, loopWidth, spacing);
          const screenCol = Math.round((x - (cell.row % 2 === 1 ? spacing / 2 : 0)) / spacing) + 1;
          const onScreen = x > -layout.hexWidth && x < viewport!.width;
          return (
            <div
              key={`${cell.copy}-${cell.row}-${cell.col}`}
              ref={(el) => { hexes.current[i] = { el, baseX: cell.baseX, row: cell.row }; }}
              className="hex"
              data-no-intro={!onScreen || undefined}
              style={{
                top: cell.y,
                width: layout.hexWidth,
                height: layout.hexHeight,
                transform: `translateX(${x}px)`,
                '--in-delay': `${enterDelay(cell.row, Math.max(0, screenCol))}s`,
              } as CSSProperties}
            >
              <HexShell><HexTile tile={cell.tile} /></HexShell>
            </div>
          );
        })}
      </div>

      <nav className="carousel-bar page-fade" aria-label={label}>
        {main.map((tile, i) => (
          <button
            key={tile.key}
            onClick={() => goTo(i)}
            aria-label={`Show ${tile.title}`}
            aria-current={i === activeIndex}
            className="carousel-button group"
            style={{ '--color': tile.color } as CSSProperties}
          >
            {tile.icon}
            <span className="carousel-tooltip" role="tooltip">
              <strong>{tile.title}</strong>
              {(tile.meta ?? tile.description) && <span>{tile.meta ?? tile.description}</span>}
            </span>
          </button>
        ))}
      </nav>

      <p className="carousel-hint page-fade">{hint}</p>
    </>
  );
}
