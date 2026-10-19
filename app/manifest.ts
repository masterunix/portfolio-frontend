/**
 * manifest.ts: /manifest.webmanifest: the name and icon a phone uses when the site is
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
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
