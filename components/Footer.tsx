/**
 * Footer.tsx — Shared footer component used on every page.
 *
 * Two variants:
 * - "full": Copyright + Gleck attribution (desktop sub-pages)
 * - "minimal": Copyright only (mobile pages)
 *
 * Eliminates the footer duplication across 8+ page files.
 */
'use client';

import React from 'react';

// ─── Props ───────────────────────────────────────────────────────────────────

interface FooterProps {
  /** "full" includes Gleck attribution, "minimal" is copyright only */
  variant?: 'full' | 'minimal';
  className?: string;
  style?: React.CSSProperties;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Footer({ variant = 'full', className = '', style }: FooterProps) {
  return (
    <footer className={className} style={style}>
      <p className="text-[12px] text-white/50 m-0 mb-1">
        © 2025 - 2026 Vatsal Goyal. All rights reserved.
      </p>
      {variant === 'full' && (
        <p className="text-[10px] text-white/40 m-0">
          This website is managed by{' '}
          <a
            href="https://github.com/masterunix/gleck"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white/60 transition-colors"
          >
            Gleck
          </a>
          , my Personal AI Agent.
        </p>
      )}
    </footer>
  );
}
