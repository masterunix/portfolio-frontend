/**
 * CompatToggle.tsx: The CPU button next to the feedback button. It switches
 * compatibility mode on and off (lib/compat.ts): <html data-compat>, which site.css uses
 * to turn off every backdrop blur and use plain tints instead. Some browsers draw the
 * heavy blur badly or slowly. The button follows the mode however it came on, by hand
 * or by itself on a slow device, and is tinted green while it's on.
 *
 * Hovering (or focusing) shows the tip from content/site.md (`compatibility`); a click
 * shows it for a moment too, which is what touch screens get.
 */
'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

import { getCompat, setCompatByHand, subscribeCompat } from '@/lib/compat';
import type { Compatibility } from '@/types';

const FLASH_MS = 2500;

export default function CompatToggle({ compatibility }: { compatibility: Compatibility }) {
  const state = useSyncExternalStore(subscribeCompat, getCompat, () => 'off');
  const on = state !== 'off';
  const [flash, setFlash] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const toggle = () => {
    setCompatByHand(!on);
    setFlash(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setFlash(false), FLASH_MS);
  };

  return (
    <div className={`compat ${flash ? 'is-flashing' : ''}`}>
      <button type="button" className={`compat-button glass ${on ? 'is-on' : ''}`} onClick={toggle}
        aria-pressed={on} aria-label={compatibility.label} aria-describedby="compat-tip">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="6" y="6" width="12" height="12" rx="2" />
          <rect x="9.5" y="9.5" width="5" height="5" rx="0.5" />
          <path d="M9.5 3v3M14.5 3v3M9.5 18v3M14.5 18v3M3 9.5h3M3 14.5h3M18 9.5h3M18 14.5h3" />
        </svg>
      </button>
      <div className="compat-tip" id="compat-tip" role="status">
        <strong>{compatibility.label}: {on ? 'on' : 'off'}</strong>
        {state === 'auto' && <span>{compatibility.auto}</span>}
        <span>{compatibility.tip}</span>
      </div>
    </div>
  );
}
