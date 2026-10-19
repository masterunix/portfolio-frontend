/**
 * BrowserNotice.tsx: A small popup for Firefox and the browsers built on its engine
 * (Gecko: LibreWolf, Zen, Floorp, Tor Browser…), whose blur is slower than Chrome's and
 * Safari's. The text is in content/site.md (`firefoxNotice`). Once closed, it stays
 * closed for that browser.
 *
 * Gecko is told apart by the "Gecko/<date>" token in its user agent; Chrome and Safari
 * only say "like Gecko", and Firefox on iPhone uses Safari's engine, so it isn't shown there.
 */
'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'firefox-notice-closed';

export default function BrowserNotice({ html }: { html: string }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!/\bGecko\/\d/.test(navigator.userAgent)) return;
    let closed = false;
    try {
      closed = localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      // Storage blocked (private windows, strict settings): show it each visit
    }
    // Let the page's intro play first
    const timer = setTimeout(() => setShown(!closed), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (!shown) return null;

  const close = () => {
    setShown(false);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // Nothing to remember it with; it just shows again next visit
    }
  };

  return (
    <div className="browser-notice" role="dialog" aria-label="A note about your browser">
      {/* Rendered from content/site.md's Markdown at build time */}
      <p dangerouslySetInnerHTML={{ __html: html }} />
      <button type="button" className="hex-button" onClick={close}>Got it</button>
    </div>
  );
}
