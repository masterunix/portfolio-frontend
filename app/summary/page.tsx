/**
 * /summary — Who I am, in short. Everything on it comes from content/summary.md.
 *
 * A server component: the whole page is in the HTML. The body is HTML that
 * lib/content.ts rendered from the file's Markdown at build time.
 */
import type { Metadata } from 'next';
import Image from 'next/image';

import GlassArticle from '@/components/GlassArticle';
import { formatDate } from '@/lib/format';
import { getSummary } from '@/lib/content';

export function generateMetadata(): Metadata {
  const { title, tagline } = getSummary();
  return {
    title,
    description: tagline,
    openGraph: { title, description: tagline, type: 'profile' },
  };
}

export default function SummaryPage() {
  const summary = getSummary();

  return (
    <GlassArticle back={{ href: '/', label: 'Home' }}>
      <header className="summary-header">
        {summary.photo && (
          <Image
            src={summary.photo.url}
            alt=""
            width={112}
            height={112}
            className="summary-photo"
            priority
            unoptimized={summary.photo.url.toLowerCase().endsWith('.svg')}
          />
        )}
        <div>
          <h1 className="article-title">{summary.title}</h1>
          {summary.tagline && <p className="article-lead">{summary.tagline}</p>}
          {(summary.location || summary.updated) && (
            <div className="article-meta">
              {summary.location && <span>{summary.location}</span>}
              {summary.location && summary.updated && <span>·</span>}
              {summary.updated && (
                <span>Updated <time dateTime={summary.updated}>{formatDate(summary.updated)}</time></span>
              )}
            </div>
          )}
        </div>
      </header>

      {summary.facts.length > 0 && (
        <ul className="summary-facts">
          {summary.facts.map((fact) => (
            <li key={`${fact.value} ${fact.label}`}>
              <strong>{fact.value}</strong> {fact.label}
            </li>
          ))}
        </ul>
      )}

      {summary.links.length > 0 && (
        <nav className="summary-links" aria-label="Links">
          {summary.links.map((link) => {
            const external = /^https?:\/\//i.test(link.href);
            return (
              <a key={link.href} href={link.href} {...(external && { target: '_blank', rel: 'noopener noreferrer' })}>
                {link.label}
              </a>
            );
          })}
        </nav>
      )}

      <div className="prose" dangerouslySetInnerHTML={{ __html: summary.html }} />
    </GlassArticle>
  );
}
