/**
 * sitemap.ts: /sitemap.xml: every page, for search engines. Blog posts carry their
 * own dates; the rest change whenever the site is deployed.
 */
import type { MetadataRoute } from 'next';

import { getPosts, getSite } from '@/lib/content';

export default function sitemap(): MetadataRoute.Sitemap {
  const { url } = getSite();
  const now = new Date();
  const pages: Array<[string, number]> = [
    ['', 1], ['/summary', 0.9], ['/projects', 0.9], ['/skills', 0.8], ['/resumes', 0.7], ['/dsa', 0.6], ['/blog', 0.6],
  ];
  return [
    ...pages.map(([path, priority]) => ({ url: `${url}${path}`, lastModified: now, changeFrequency: 'monthly' as const, priority })),
    ...getPosts().filter((post) => !post.draft).map((post) => ({
      url: `${url}/blog/${post.slug}`,
      lastModified: new Date(`${post.updated ?? post.date}T00:00:00Z`),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    })),
  ];
}
