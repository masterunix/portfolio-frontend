/**
 * useIsMobile.ts — Detects mobile viewport for responsive layout switching.
 *
 * Returns true when the viewport width is below the breakpoint (768px).
 * Uses a resize listener with SSR safety (returns false on server).
 *
 * Used by page client components to switch between hex grid (desktop)
 * and vertical card layout (mobile).
 */

import { useState, useEffect } from 'react';

// ─── Constants ───────────────────────────────────────────────────────────────

/** Mobile breakpoint in pixels — matches Tailwind's `md` breakpoint */
const MOBILE_BREAKPOINT = 768;

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Initial check
    check();

    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile;
}
