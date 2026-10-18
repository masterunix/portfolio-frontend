/**
 * useNoticeCarousel.ts — Auto-cycles through Gleck notices.
 *
 * When the widget is expanded and there are multiple notices,
 * automatically advances to the next notice every 5 seconds.
 * Pauses when collapsed or when only one notice exists.
 *
 * Resets the index if the notice count changes (e.g., CMS update).
 */

import { useState, useEffect, useRef } from 'react';

// ─── Constants ───────────────────────────────────────────────────────────────

/** Time between automatic notice transitions (milliseconds) */
const CAROUSEL_INTERVAL = 5000;

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useNoticeCarousel(noticeCount: number, isExpanded: boolean) {
  const [rawIndex, setRawIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clamp during render: if the notice count shrinks below the stored index
  // (e.g. CMS update), show the first notice instead of an out-of-range one
  const currentIndex = noticeCount > 0 && rawIndex >= noticeCount ? 0 : rawIndex;

  useEffect(() => {
    // Only auto-cycle when expanded and there are multiple notices
    if (!isExpanded || noticeCount <= 1) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start carousel — wraps around using modular arithmetic
    intervalRef.current = setInterval(() => {
      setRawIndex((prev) => (prev + 1) % noticeCount);
    }, CAROUSEL_INTERVAL);

    // Cleanup interval on dependency change or unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isExpanded, noticeCount]);

  return { currentIndex, setCurrentIndex: setRawIndex };
}
