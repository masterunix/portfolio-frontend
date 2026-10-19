/**
 * Footer.tsx: The footer's lines from content/site.md: the first shows everywhere,
 * the rest only on wide layouts, and the site's version follows the first line. The root
 * layout provides them (SiteProvider), so any page or frame can place a Footer.
 */
'use client';

import { createContext, useContext, type ReactNode } from 'react';

const FooterContent = createContext<{ lines: string[]; version: string }>({ lines: [], version: '' });

export function SiteProvider({ footer, version, children }: { footer: string[]; version: string; children: ReactNode }) {
  return <FooterContent value={{ lines: footer, version }}>{children}</FooterContent>;
}

interface FooterProps {
  /** Only the first line (mobile lists) */
  short?: boolean;
  className?: string;
}

export default function Footer({ short = false, className = '' }: FooterProps) {
  const { lines, version } = useContext(FooterContent);
  return (
    <footer className={`site-footer ${className}`}>
      {(short ? lines.slice(0, 1) : lines).map((html, i) => (
        <p key={i} className={i > 0 ? 'site-footer-small' : undefined}>
          {/* Rendered from content/site.md's Markdown at build time */}
          <span dangerouslySetInnerHTML={{ __html: html }} />
          {i === 0 && version && <span className="site-version">v{version}</span>}
        </p>
      ))}
    </footer>
  );
}
