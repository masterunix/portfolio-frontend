/**
 * useCarousel.ts — The carousel's scroll position: a steady drift, plus going to a
 * tile (buttons, or the ← → keys) by easing it to the middle of the window. The active
 * tile follows whichever one is in the middle as it drifts, so the buttons keep up.
 *
 * One animation loop moves every hex by writing its transform directly, so scrolling
 * never re-renders React. `offset` holds the current position for anything that needs
 * it outside the loop (the exit wave).
 */
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

/** Drift speed, in px per 60fps frame */
const DRIFT = 0.39;
/** How long going to a tile takes, in ms */
const GO_TO_MS = 600;

/** CSS's ease-in-out, cubic-bezier(0.42, 0, 0.58, 1), solved for y at time t */
function easeInOut(t: number): number {
  // x(s) = 3(1-s)²s·0.42 + 3(1-s)s²·0.58 + s³; find s where x(s) = t, then y(s)
  let s = t;
  for (let i = 0; i < 8; i++) {
    const x = 1.26 * (1 - s) ** 2 * s + 1.74 * (1 - s) * s ** 2 + s ** 3 - t;
    const dx = 1.26 * (1 - s) * (1 - 3 * s) + 1.74 * s * (2 - 3 * s) + 3 * s ** 2;
    if (Math.abs(x) < 1e-5 || dx === 0) break;
    s -= x / dx;
  }
  return 3 * (1 - s) * s ** 2 + s ** 3;
}

interface Options {
  /** The hex elements, and where each sits before scrolling (its left edge) */
  hexes: RefObject<Array<{ el: HTMLElement | null; baseX: number }>>;
  /** Width of all copies of the grid together, where positions wrap */
  loopWidth: number;
  /** Distance between neighbouring hexes, in px */
  spacing: number;
  /** How many main tiles the buttons and keys cycle through */
  count: number;
  /** The scroll position that centres main tile `index` (any loop of it) */
  centre: (index: number) => number;
  /** The main tile nearest the middle of the window at scroll position `offset` */
  indexAt: (offset: number) => number;
  /** Where the carousel starts */
  start: number;
}

/** A hex's left edge on screen at scroll position `offset` */
export function carouselX(baseX: number, offset: number, loopWidth: number, spacing: number): number {
  return ((((baseX - offset) % loopWidth) + loopWidth) % loopWidth) - spacing;
}

export function useCarousel({ hexes, loopWidth, spacing, count, centre, indexAt, start }: Options) {
  const offset = useRef<number | null>(null);
  const tween = useRef<{ from: number; to: number; start: number } | null>(null);
  const active = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!loopWidth) return;
    offset.current ??= start;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const t = tween.current;
      if (t) {
        const p = Math.min(1, (now - t.start) / GO_TO_MS);
        offset.current = t.from + (t.to - t.from) * easeInOut(p);
        if (p === 1) tween.current = null;
      } else {
        // The same speed on any refresh rate
        offset.current! += DRIFT * ((now - last) / 16);
        // Keep the active button on the tile in the middle as it drifts past
        const index = indexAt(offset.current!);
        if (index !== active.current) {
          active.current = index;
          setActiveIndex(index);
        }
      }
      last = now;
      for (const hex of hexes.current) {
        if (hex.el) hex.el.style.transform = `translateX(${carouselX(hex.baseX, offset.current!, loopWidth, spacing)}px)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [hexes, loopWidth, spacing, indexAt, start]);

  const goTo = useCallback((index: number) => {
    active.current = index;
    setActiveIndex(index);
    // Positions repeat every loopWidth, so go the short way round to that tile
    const from = offset.current ?? start;
    const to = centre(index) + Math.round((from - centre(index)) / loopWidth) * loopWidth;
    tween.current = { from, to, start: performance.now() };
  }, [centre, loopWidth, start]);

  useEffect(() => {
    if (count === 0) return;
    const onKey = (e: KeyboardEvent) => {
      const step = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0;
      if (!step) return;
      e.preventDefault();
      goTo((active.current + step + count) % count);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [count, goTo]);

  return { offset, activeIndex, goTo };
}
