import { useState, useEffect, useRef } from 'react';

const CAROUSEL_INTERVAL = 5000; // 5 seconds per notice

/**
 * useNoticeCarousel — Auto-cycles through notices when widget is expanded
 * 
 * @param noticeCount - Total number of notices
 * @param isExpanded - Whether the widget is currently expanded
 * @returns Object with currentIndex and setCurrentIndex
 */
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

    // Start carousel
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % noticeCount);
    }, CAROUSEL_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isExpanded, noticeCount]);

  // Reset index if notice count changes
  useEffect(() => {
    if (currentIndex >= noticeCount) {
      setCurrentIndex(0);
    }
  }, [noticeCount, currentIndex]);

  return { currentIndex, setCurrentIndex };
}
