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
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
      setCurrentIndex((prev) => (prev + 1) % noticeCount);
    }, CAROUSEL_INTERVAL);

    // Cleanup interval on dependency change or unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isExpanded, noticeCount]);

  // Guard: Reset index if notice count shrinks below current position
  useEffect(() => {
    if (currentIndex >= noticeCount) {
      setCurrentIndex(0);
    }
  }, [noticeCount, currentIndex]);

  return { currentIndex, setCurrentIndex };
}
