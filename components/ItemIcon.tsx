/**
 * ItemIcon.tsx — An item's logo, or its fallback (an emoji or letter) when there is no
 * logo or it fails to load, so a tile never shows a broken image. The icon square
 * around it sets the size (globals.css, .tile-icon).
 */
'use client';

import { useState } from 'react';
import Image from 'next/image';

import type { Media } from '@/types';

interface ItemIconProps {
  logo?: Media;
  fallback: string;
  alt: string;
}

export default function ItemIcon({ logo, fallback, alt }: ItemIconProps) {
  // Keyed by URL, so a carousel slot that switches to another item retries
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (!logo || failedUrl === logo.url) return <span className="item-icon-fallback">{fallback}</span>;

  return (
    <Image
      src={logo.url}
      alt={alt}
      width={64}
      height={64}
      // The image optimizer doesn't take SVGs; they scale on their own
      unoptimized={logo.url.toLowerCase().endsWith('.svg')}
      onError={() => setFailedUrl(logo.url)}
    />
  );
}
