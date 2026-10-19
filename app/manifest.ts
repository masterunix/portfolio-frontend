/**
 * manifest.ts — /manifest.webmanifest: the name and icon a phone uses when the site is
 * added to the home screen.
 */
import type { MetadataRoute } from 'next';

import { getSite, getSummary } from '@/lib/content';

export default function manifest(): MetadataRoute.Manifest {
  const { title, description } = getSite();
  return {
    name: title,
    short_name: getSummary().title,
    description,
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [{ src: '/icon.png', sizes: '1024x1024', type: 'image/png' }],
  };
}
