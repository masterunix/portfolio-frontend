const API_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

/**
 * Generic API fetch function for Strapi endpoints
 * Handles both collection and single-type responses
 * 
 * @param endpoint - Strapi API endpoint (without /api/ prefix)
 * @returns Parsed data from response
 * @throws Error if fetch fails
 */
export async function fetchAPI(endpoint: string) {
  const res = await fetch(`${API_URL}/api/${endpoint}`, {
    next: { revalidate: 60 }, // Revalidate every 60 seconds
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }

  const data = await res.json();
  return data.data;
}

/**
 * Fetches all projects from Strapi
 * @returns Array of project objects with logos
 */
export async function getProjects() {
  return fetchAPI('projects?sort=order:asc&populate=logo');
}

/**
 * Fetches all skills from Strapi
 * @returns Array of skill objects with all relations populated including nested attachments
 */
export async function getSkills() {
  return fetchAPI('skills?sort=order:asc&populate[0]=logo&populate[1]=attachments.file');
}

/**
 * Fetches all resumes from Strapi
 * @returns Array of resume objects with all relations populated
 */
export async function getResumes() {
  return fetchAPI('resumes?sort=order:asc&populate=*');
}

/**
 * Fetches all DSA platforms from Strapi
 * @returns Array of DSA platform objects with logos
 */
export async function getDSAPlatforms() {
  return fetchAPI('dsa-platforms?sort=order:asc&populate=logo');
}

/**
 * Fetches home page messages from Strapi
 * @returns Array of message objects sorted by order
 */
export async function getHomeMessages() {
  return fetchAPI('home-messages?sort=order:asc');
}

/**
 * Fetches navigation items from Strapi
 * @returns Array of navigation objects with icons/logos populated
 */
export async function getNavigationItems() {
  return fetchAPI('navigation-items?sort=order:asc&populate[0]=icon&populate[1]=logo');
}

/**
 * Fetches active background theme from Strapi
 * @returns Array of enabled background theme objects
 */
export async function getActiveBackgroundTheme() {
  return fetchAPI('background-themes?filters[enabled][$eq]=true&sort=order:asc&populate=*');
}
