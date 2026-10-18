/**
 * Carousel.tsx — Three rows of glass hexagons scrolling sideways forever (projects,
 * skills): the main tiles in the middle row, supporting tiles above and below. A bar
 * of buttons, or the arrow keys, centres a main tile. Used inside HexPage.
 *
 * The grid is drawn three times side by side; CarouselHex wraps positions so the
 * copies loop seamlessly.
 */
'use client';

import type { CSSProperties } from 'react';

import CarouselHex from '@/components/CarouselHex';
import HexTile from '@/components/HexTile';
import { useExitDuration } from '@/components/transition';
import { useCarousel } from '@/hooks/useCarousel';
import { useViewportSize } from '@/hooks/useViewportSize';
import { computeHexLayout, hexOffset, type GridConfig } from '@/lib/hexLayout';
import { carouselLastStep, exitDurationMs } from '@/lib/hexTransition';
import type { Tile } from '@/lib/tiles';

const GRID: GridConfig = { rows: 3, cols: 14, gap: 20, scale: 4.27 };
const COPIES = 3;

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
  const layout = viewport && computeHexLayout(viewport, GRID);
  const setWidth = layout ? GRID.cols * layout.spacingX : 0;

  const { offset, activeIndex, goTo } = useCarousel({
    count: main.length,
    spacing: layout?.spacingX ?? 0,
    setWidth,
  });

  useExitDuration(viewport && layout ? exitDurationMs(carouselLastStep(viewport.width, layout.spacingX, GRID.rows)) : 0);

  if (!layout) return null;

  const hexes = [];
  for (let copy = 0; copy < COPIES; copy++) {
    for (let row = 0; row < GRID.rows; row++) {
      const tiles = row === 1 ? main : supporting;
      if (!tiles.length) continue;
      for (let col = 0; col < GRID.cols; col++) {
        const { x, y } = hexOffset(layout, row, col);
        hexes.push(
          <CarouselHex
            key={`${copy}-${row}-${col}`}
            baseX={x + copy * setWidth - layout.spacingX}
            y={layout.startY + y}
            width={layout.hexWidth}
            height={layout.hexHeight}
            row={row}
            col={col}
            copy={copy}
            offset={offset}
            loopWidth={setWidth * COPIES}
            spacingX={layout.spacingX}
          >
            <HexTile tile={tiles[col % tiles.length]} />
          </CarouselHex>,
        );
      }
    }
  }

  return (
    <>
      <div className="absolute inset-0">{hexes}</div>

      <nav className="carousel-bar glass page-fade" aria-label={label}>
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
            <span className="carousel-tooltip glass" role="tooltip">
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
