/**
 * useIsDesktop.ts — True when the viewport is at least 768px wide (the hex layouts).
 *
 * False on the server and while hydrating, so the server-rendered page is the mobile
 * layout (CSS hides it on wide screens) and the hex layout mounts in the browser.
 */
import { useSyncExternalStore } from 'react';

const QUERY = '(min-width: 768px)';

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

export function useIsDesktop(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}
