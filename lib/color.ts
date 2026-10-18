/**
 * color.ts — Colour helpers.
 */

/**
 * A content colour at the given opacity (0–1), for glows and shadows.
 *
 * Content colours can be any CSS colour (#667eea, purple, rgb(…)), so appending hex
 * alpha digits (`${color}80`) only works for 6-digit hex; color-mix works for all of them.
 */
export function withAlpha(color: string, alpha: number): string {
  return `color-mix(in srgb, ${color} ${Math.round(alpha * 1000) / 10}%, transparent)`;
}
