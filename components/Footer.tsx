/**
 * Footer.tsx — Copyright, and (on wide layouts) who runs the site.
 */

interface FooterProps {
  /** Leave out the Gleck line (mobile lists) */
  short?: boolean;
  className?: string;
}

export default function Footer({ short = false, className = '' }: FooterProps) {
  return (
    <footer className={`site-footer ${className}`}>
      <p>© 2025 – {new Date().getFullYear()} Vatsal Goyal. All rights reserved.</p>
      {!short && (
        <p className="site-footer-small">
          This website is managed by{' '}
          <a href="https://github.com/masterunix/gleck" target="_blank" rel="noopener noreferrer">Gleck</a>
          , my Personal AI Agent.
        </p>
      )}
    </footer>
  );
}
