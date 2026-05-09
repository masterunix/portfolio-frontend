/**
 * api.ts — Centralized Strapi API client.
 *
 * All data fetching goes through `fetchAPI()`, which:
 * - Prepends the Strapi base URL
 * - Uses Next.js ISR with 60-second revalidation
 * - Unwraps Strapi's `{ data: ... }` envelope
 * - Throws on non-OK responses
 *
 * Each export is a thin wrapper that appends the correct
 * query string (filters, sorting, population).
 */

// ─── Constants ───────────────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// ─── Core Fetch ──────────────────────────────────────────────────────────────

/**
 * Generic API fetch function for Strapi endpoints.
 * Handles both collection and single-type responses.
 *
 * @param endpoint - Strapi API endpoint (without /api/ prefix)
 * @returns Parsed data from the `data` key of the response
 * @throws Error if the HTTP response is not OK
 */
export async function fetchAPI(endpoint: string) {
  const res = await fetch(`${API_URL}/api/${endpoint}`, {
    next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }

  const data = await res.json();
  return data.data;
}

// ─── Collection Endpoints ────────────────────────────────────────────────────

/** Fetches all projects with logos, sorted by display order */
export async function getProjects() {
  return fetchAPI('projects?sort=order:asc&populate=logo');
}

/** Fetches all skills with logos and nested attachment files, sorted by order */
export async function getSkills() {
  return fetchAPI('skills?sort=order:asc&populate[0]=logo&populate[1]=attachments.file');
}

/** Fetches all resumes with all relations populated, sorted by order */
export async function getResumes() {
  return fetchAPI('resumes?sort=order:asc&populate=*');
}

/** Fetches all DSA platforms with logos, sorted by order */
export async function getDSAPlatforms() {
  return fetchAPI('dsa-platforms?sort=order:asc&populate=logo');
}

/** Fetches home page typewriter messages, sorted by order */
export async function getHomeMessages() {
  return fetchAPI('home-messages?sort=order:asc');
}

/** Fetches navigation items with icons/logos, sorted by order */
export async function getNavigationItems() {
  return fetchAPI('navigation-items?sort=order:asc&populate[0]=icon&populate[1]=logo');
}

/** Fetches the active (enabled) background theme with all relations */
export async function getActiveBackgroundTheme() {
  return fetchAPI('background-themes?filters[enabled][$eq]=true&sort=order:asc&populate=*');
}
