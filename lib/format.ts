/**
 * format.ts — Small formatting helpers shared by server and client code.
 */

/** "2026-10-18" → "Oct 18, 2026" (in UTC, so it never shifts a day) */
export function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * A content colour at the given opacity (0–1), for glows and shadows. Content colours
 * can be any CSS colour (#667eea, purple, rgb(…)), which color-mix handles.
 */
export function withAlpha(color: string, alpha: number): string {
  return `color-mix(in srgb, ${color} ${Math.round(alpha * 1000) / 10}%, transparent)`;
}

/** Links to other sites open in a new tab */
export function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href);
}
