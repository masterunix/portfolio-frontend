/**
 * metadata.ts: What search engines and link previews see: each page's title,
 * description and canonical address, and the structured data (JSON-LD) describing me
 * and the site. All of it comes from content/site.md and content/summary.md.
 */
import type { Metadata } from 'next';

import { getDSAPlatforms, getSite, getSummary } from '@/lib/content';
import type { BlogPost, Site } from '@/types';

/**
 * Open Graph fields every page shares. A page that sets its own openGraph replaces the
 * layout's whole object, so pages spread this in rather than relying on inheritance.
 */
export function baseOpenGraph(): NonNullable<Metadata['openGraph']> {
  const name = getSummary().title;
  return {
    siteName: name,
    locale: 'en_US',
    type: 'website',
    // The picture app/opengraph-image.tsx draws
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: `${name}, ${getSummary().jobTitle ?? ''}`.replace(/, $/, '') }],
  };
}

/** A hex page's metadata, from its entry in site.md `pages` */
export function pageMetadata(page: keyof Site['pages']): Metadata {
  const { title, description } = getSite().pages[page];
  const path = `/${page}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { ...baseOpenGraph(), title: `${title} | ${getSummary().title}`, description, url: path },
  };
}

// ─── Structured data (schema.org) ──────────────────────────────────────────────

/** Me, as a schema.org Person: name, role, school, and every profile of mine */
export function personSchema() {
  const { url } = getSite();
  const summary = getSummary();
  const profiles = [
    ...summary.links.map((link) => link.href).filter((href) => /^https:\/\//.test(href)),
    ...getDSAPlatforms().map((platform) => platform.url),
  ];
  const email = summary.links.find((link) => link.href.startsWith('mailto:'))?.href;
  const [locality, country] = summary.location?.split(',').map((part) => part.trim()) ?? [];

  return {
    '@type': 'Person',
    '@id': `${url}/#person`,
    name: summary.title,
    url,
    ...(summary.tagline && { description: summary.tagline }),
    ...(summary.jobTitle && { jobTitle: summary.jobTitle }),
    ...(summary.school && { alumniOf: { '@type': 'CollegeOrUniversity', name: summary.school } }),
    ...(locality && { address: { '@type': 'PostalAddress', addressLocality: locality, ...(country && { addressCountry: country }) } }),
    ...(email && { email }),
    ...(summary.photo && { image: `${url}${summary.photo.url}` }),
    sameAs: [...new Set(profiles)],
  };
}

/** The home page: the site, and who it's about */
export function homeSchema() {
  const { url, title, description } = getSite();
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', '@id': `${url}/#website`, url, name: title, description, author: { '@id': `${url}/#person` } },
      personSchema(),
    ],
  };
}

/** The summary page: a profile page about me */
export function profileSchema() {
  const { url } = getSite();
  const { updated } = getSummary();
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: `${url}/summary`,
    ...(updated && { dateModified: updated }),
    mainEntity: personSchema(),
  };
}

/** A blog post */
export function postSchema(post: BlogPost) {
  const { url } = getSite();
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    url: `${url}/blog/${post.slug}`,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    ...(post.tags.length && { keywords: post.tags.join(', ') }),
    ...(post.cover && { image: `${url}${post.cover.url}` }),
    author: { '@type': 'Person', name: getSummary().title, url },
  };
}
