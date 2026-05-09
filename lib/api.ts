const API_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

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

export async function getProjects() {
  return fetchAPI('projects?sort=order:asc&populate=logo');
}

export async function getSkills() {
  return fetchAPI('skills?sort=order:asc&populate=*');
}

export async function getResumes() {
  return fetchAPI('resumes?sort=order:asc&populate=*');
}

export async function getDSAPlatforms() {
  return fetchAPI('dsa-platforms?sort=order:asc&populate=logo');
}

export async function getHomeMessages() {
  return fetchAPI('home-messages?sort=order:asc');
}

export async function getGleckNotices() {
  return fetchAPI('gleck-notices?sort=order:asc&filters[active][$eq]=true');
}

export async function getGleckSettings() {
  return fetchAPI('gleck-setting');
}

export async function getActiveBackgroundTheme() {
  return fetchAPI('background-themes?filters[enabled][$eq]=true&sort=order:asc&populate=*');
}
