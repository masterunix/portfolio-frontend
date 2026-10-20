/**
 * compat.ts: Compatibility mode, shared by the root layout (a server component, which
 * only uses the script), CompatToggle and ShaderBackground.
 *
 * Compatibility mode is <html data-compat>: site.css turns off every backdrop blur. It
 * comes on two ways:
 *   - by hand, with the processor button: remembered in this browser as '1' (on) or
 *     '0' (off) under COMPAT_KEY;
 *   - by itself, when ShaderBackground finds frames running slow: data-compat="auto",
 *     for this visit only, and never when the visitor has turned it off by hand.
 */

export const COMPAT_KEY = 'compat-mode';

/** Applies a saved choice before the first paint, so the blur never flashes */
export const COMPAT_SCRIPT = `try{if(localStorage.getItem('${COMPAT_KEY}')==='1')document.documentElement.dataset.compat=''}catch(e){}`;

export type CompatState = 'off' | 'on' | 'auto';

/** The visitor's own choice, if they've made one */
function savedChoice(): string | null {
  try {
    return localStorage.getItem(COMPAT_KEY);
  } catch {
    return null;
  }
}

export function getCompat(): CompatState {
  const value = document.documentElement.dataset.compat;
  return value === undefined ? 'off' : value === 'auto' ? 'auto' : 'on';
}

/** Calls `onChange` whenever compatibility mode turns on or off */
export function subscribeCompat(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-compat'] });
  return () => observer.disconnect();
}

/** The processor button: turns it on or off, and remembers the choice */
export function setCompatByHand(on: boolean): void {
  if (on) document.documentElement.dataset.compat = '';
  else delete document.documentElement.dataset.compat;
  try {
    localStorage.setItem(COMPAT_KEY, on ? '1' : '0');
  } catch {
    // Storage blocked: it still applies until the page is closed
  }
}

/** Slow frames: turns it on for this visit, unless the visitor turned it off by hand */
export function setCompatAuto(): void {
  if (getCompat() !== 'off' || savedChoice() === '0') return;
  document.documentElement.dataset.compat = 'auto';
}
