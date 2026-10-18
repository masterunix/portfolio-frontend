/**
 * Footer.tsx — The footer's lines from content/site.md: the first shows everywhere,
 * the rest only on wide layouts. The root layout provides the lines (SiteProvider), so
 * any page or frame can place a Footer.
 */
'use client';

import { createContext, useContext, type ReactNode } from 'react';

const FooterLines = createContext<string[]>([]);

export function SiteProvider({ footer, children }: { footer: string[]; children: ReactNode }) {
  return <FooterLines value={footer}>{children}</FooterLines>;
}

interface FooterProps {
  /** Only the first line (mobile lists) */
  short?: boolean;
  className?: string;
}

export default function Footer({ short = false, className = '' }: FooterProps) {
  const lines = useContext(FooterLines);
  return (
    <footer className={`site-footer ${className}`}>
      {(short ? lines.slice(0, 1) : lines).map((html, i) => (
        // Rendered from content/site.md's Markdown at build time
        <p key={i} className={i > 0 ? 'site-footer-small' : undefined} dangerouslySetInnerHTML={{ __html: html }} />
      ))}
    </footer>
  );
}
