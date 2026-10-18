/**
 * metadata.ts — A page's search title and description, from content/site.md.
 */
import type { Metadata } from 'next';

import { getSite } from '@/lib/content';
import type { Site } from '@/types';

export function pageMetadata(page: keyof Site['pages']): Metadata {
  const { title, description } = getSite().pages[page];
  return { title, description };
}
