/**
 * useMounted.ts — Hydration gate.
 *
 * Returns false during SSR and the initial hydration render, true afterwards.
 * Built on useSyncExternalStore instead of the useState + useEffect pattern,
 * which avoids an extra cascading render after mount (and satisfies the
 * react-hooks/set-state-in-effect lint rule).
 *
 * Used by page clients to defer viewport-dependent layouts until the
 * client is interactive, preventing SSR/client hydration mismatches.
 */

import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,  // Client snapshot — after hydration
    () => false  // Server snapshot — SSR and hydration render
  );
}
