/**
 * blogFormat.ts — Formatting for blog post details, shared by the list and post pages.
 */

/** "2026-10-18" → "Oct 18, 2026" (in UTC, so it never shifts a day) */
export function formatPostDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
