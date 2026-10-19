/**
 * useBlink.ts: Gleck blinks on his own every few seconds (now and then twice), and
 * on demand. Returns whether the eyes are shut, and a function to blink now.
 */
import { useCallback, useEffect, useState } from 'react';

const SHUT_MS = 140;

/** 2.5–6.5s between blinks */
const nextGap = () => 2500 + Math.random() * 4000;

export function useBlink(): { shut: boolean; blink: () => void } {
  const [shut, setShut] = useState(false);

  const blink = useCallback(() => {
    setShut(true);
    setTimeout(() => setShut(false), SHUT_MS);
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        blink();
        // One blink in four is a double blink
        if (Math.random() < 0.25) timer = setTimeout(blink, SHUT_MS * 2.2);
        schedule();
      }, nextGap());
    };
    schedule();
    return () => clearTimeout(timer);
  }, [blink]);

  return { shut, blink };
}
