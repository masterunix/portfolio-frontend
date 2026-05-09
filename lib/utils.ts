/**
 * utils.ts — General-purpose utility functions.
 */

/**
 * Adjusts the brightness of a hex color by a given percentage.
 * Used to create gradient pairs (e.g., base color → 20% darker).
 *
 * @param color  - Hex color string (e.g., '#667eea')
 * @param amount - Brightness adjustment (-100 to 100). Negative = darker.
 * @returns Adjusted hex color string
 *
 * @example
 * adjustColor('#667eea', -20)  // Returns a 20% darker shade
 * adjustColor('#667eea', 20)   // Returns a 20% lighter shade
 */
export function adjustColor(color: string, amount: number): string {
  if (!color) return '#000000';

  // Parse hex string into RGB components
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * amount);

  // Adjust each channel, clamping to 0-255
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;

  // Reconstruct hex string with zero-padding
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}
