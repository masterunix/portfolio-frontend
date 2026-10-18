/**
 * ItemIcon.tsx — An item's logo, or its icon when there is no logo.
 *
 * Every tile, card and nav button that shows a logo goes through here, so they all
 * behave the same way:
 * - a logo renders as an optimized image at the given size (big originals are scaled down)
 * - no logo, or a logo that fails to load, shows `icon` instead (never a broken image)
 *
 * The caller passes `icon` already styled for its slot (emoji, letter, etc.).
 */
'use client';

import React, { useState } from 'react';
import Image from 'next/image';

import type { Media } from '@/types';

interface ItemIconProps {
  logo?: Media;
  /** Shown when there is no logo, or it fails to load */
  icon: React.ReactNode;
  alt: string;
  /** The logo's width and height in px */
  size: number;
  className?: string;
}

export default function ItemIcon({ logo, icon, alt, size, className = '' }: ItemIconProps) {
  // Keyed by URL, so a carousel slot that switches to another item retries
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (!logo || failedUrl === logo.url) return <>{icon}</>;

  return (
    <Image
      src={logo.url}
      alt={alt}
      width={size}
      height={size}
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
      // The image optimizer doesn't take SVGs; they scale on their own
      unoptimized={logo.url.toLowerCase().endsWith('.svg')}
      onError={() => setFailedUrl(logo.url)}
    />
  );
}
