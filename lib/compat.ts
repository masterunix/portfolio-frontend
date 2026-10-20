/**
 * compat.ts: Compatibility mode's storage key and its first-paint script, shared by the
 * root layout (a server component) and CompatToggle (a client one).
 */

export const COMPAT_KEY = 'compat-mode';

/** Applies a saved compatibility mode before the first paint, so the blur never flashes */
export const COMPAT_SCRIPT = `try{if(localStorage.getItem('${COMPAT_KEY}')==='1')document.documentElement.dataset.compat=''}catch(e){}`;
