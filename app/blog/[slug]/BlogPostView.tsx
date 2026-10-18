/**
 * BlogPostView.tsx — A blog post: a readable glass panel over the animated background.
 *
 * Rendered on the server too (no mount gate), so the article is in the page's HTML for
 * search engines and link previews. The body is HTML that lib/content.ts rendered from
 * the post's Markdown at build time; it comes from the repo, not from visitors.
 *
 * The panel fades up on arrival; "All posts" fades it back down before navigating,
 * matching the other pages' outros.
 */
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import Footer from '@/components/Footer';
import { formatPostDate } from '@/lib/blogFormat';
import type { BlogPost } from '@/types';

/** Matches the panel's fade-out in globals.css (.blog-article.is-exiting) */
const EXIT_MS = 250;

export default function BlogPostView({ post }: { post: BlogPost }) {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsExiting(true);
    setTimeout(() => router.push('/blog'), EXIT_MS);
  };

  return (
    <main className="blog-page">
      <article className={`blog-article ${isExiting ? 'is-exiting' : ''}`}>
        <Link href="/blog" onClick={handleBack} className="blog-back">← All posts</Link>

        {post.cover && (
          <Image
            src={post.cover.url}
            alt=""
            width={1280}
            height={720}
            className="blog-cover"
            priority
            unoptimized={post.cover.url.toLowerCase().endsWith('.svg')}
          />
        )}

        <div className="blog-meta">
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          <span>·</span>
          <span>{post.readMins} min read</span>
          {post.updated && (
            <>
              <span>·</span>
              <span>Updated <time dateTime={post.updated}>{formatPostDate(post.updated)}</time></span>
            </>
          )}
          {post.draft && (
            <>
              <span>·</span>
              <span className="blog-draft">Draft</span>
            </>
          )}
        </div>

        <h1 className="blog-title">{post.title}</h1>
        <p className="blog-lead">{post.description}</p>

        {post.tags.length > 0 && (
          <ul className="blog-tags" aria-label="Tags">
            {post.tags.map((tag) => <li key={tag}>{tag}</li>)}
          </ul>
        )}

        <div className="blog-prose" dangerouslySetInnerHTML={{ __html: post.html }} />
      </article>

      <Footer variant="full" className="blog-footer" />
    </main>
  );
}
