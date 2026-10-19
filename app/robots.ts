/**
 * robots.ts — /robots.txt: everything may be crawled; points to the sitemap.
 */
import type { MetadataRoute } from 'next';

import { getSite } from '@/lib/content';

export default function robots(): MetadataRoute.Robots {
  const { url } = getSite();
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${url}/sitemap.xml`,
    host: url,
  };
}
