/**
 * useViewportSize.ts — Tracks the viewport dimensions with debounced updates.
 *
 * Returns `null` on the server and during the first client render (before
 * the mount effect runs), then the live window size. Updates are debounced
 * so a drag-resize doesn't recompute layouts on every intermediate frame.
 *
 * Used by the desktop hex-grid pages so the honeycomb re-centers itself
 * when the window is resized instead of staying at its mount-time layout.
 */

import { useState, useEffect } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ViewportSize {
  width: number;
  height: number;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useViewportSize(debounceMs = 150): ViewportSize | null {
  const [size, setSize] = useState<ViewportSize | null>(null);

  useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight });

    // Initial measurement on mount
    update();

    let timer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(timer);
      timer = setTimeout(update, debounceMs);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [debounceMs]);

  return size;
}
