/**
 * useNoticeCarousel.ts: Moves to the next Gleck notice every 5 seconds while the
 * widget is expanded and has more than one.
 */
import { useState, useEffect } from 'react';

const INTERVAL_MS = 5000;

export function useNoticeCarousel(count: number, running: boolean) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!running || count <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL_MS);
    return () => clearInterval(timer);
  }, [running, count]);

  // If notices were removed, show the first instead of one that's gone
  return { index: index < count ? index : 0, setIndex };
}
