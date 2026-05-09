import { useState, useEffect, RefObject } from 'react';

interface EyePosition {
  x: number;
  y: number;
}

/**
 * useEyeTracking — Tracks cursor position relative to widget for anime eyes
 * 
 * Calculates normalized position (-1 to 1) for pupil movement based on
 * cursor distance from widget center.
 * 
 * @param widgetRef - React ref to the widget container element
 * @returns Object with normalized x and y positions for pupils
 */
export function useEyeTracking(widgetRef: RefObject<HTMLElement | null>): EyePosition {
  const [eyePos, setEyePos] = useState<EyePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!widgetRef.current) return;

      const rect = widgetRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculate distance from center
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      // Normalize to -1 to 1 range with smooth falloff
      const maxDistance = 200; // pixels
      const normalizedX = Math.max(-1, Math.min(1, deltaX / maxDistance));
      const normalizedY = Math.max(-1, Math.min(1, deltaY / maxDistance));

      setEyePos({ x: normalizedX, y: normalizedY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [widgetRef]);

  return eyePos;
}
