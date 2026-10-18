/**
 * useViewportSize.ts — The window's size, for the hex layouts. Null on the server.
 *
 * Read straight from the window when a component mounts in the browser (so a hex grid
 * draws in its first render), then updated 150ms after resizing stops, so dragging the
 * window doesn't re-lay-out on every frame.
 */
import { useSyncExternalStore } from 'react';

interface ViewportSize {
  width: number;
  height: number;
}

let size: ViewportSize | null = null;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | undefined;

function measure() {
  size = { width: window.innerWidth, height: window.innerHeight };
}

function onResize() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    measure();
    listeners.forEach((listener) => listener());
  }, 150);
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener('resize', onResize);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener('resize', onResize);
  };
}

function getSnapshot(): ViewportSize {
  if (!size) measure();
  return size!;
}

export function useViewportSize(): ViewportSize | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
