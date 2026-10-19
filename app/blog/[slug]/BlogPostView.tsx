/**
 * BlogPostView.tsx: A blog post inside the glass panel.
 *
 * A server component, so the article is in the page's HTML for search engines and
 * link previews. The body is HTML that lib/content.ts rendered from the post's
 * Markdown at build time; it comes from the repo, not from visitors.
 */
import Image from 'next/image';

import GlassArticle from '@/components/GlassArticle';
import { formatDate } from '@/lib/format';
import type { BlogPost } from '@/types';

export default function BlogPostView({ post }: { post: BlogPost }) {
  return (
    <GlassArticle back={{ href: '/blog', label: 'All posts' }}>
      {post.cover && (
        <Image
          src={post.cover.url}
          alt=""
          width={1280}
          height={720}
          className="article-cover"
          priority
          unoptimized={post.cover.url.toLowerCase().endsWith('.svg')}
        />
      )}

      <div className="article-meta">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <span>·</span>
        <span>{post.readMins} min read</span>
        {post.updated && (
          <>
            <span>·</span>
            <span>Updated <time dateTime={post.updated}>{formatDate(post.updated)}</time></span>
          </>
        )}
        {post.draft && (
          <>
            <span>·</span>
            <span className="blog-draft">Draft</span>
          </>
        )}
      </div>

      <h1 className="article-title">{post.title}</h1>
      <p className="article-lead">{post.description}</p>

      {post.tags.length > 0 && (
        <ul className="article-tags" aria-label="Tags">
          {post.tags.map((tag) => <li key={tag}>{tag}</li>)}
        </ul>
      )}

      <div className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />
    </GlassArticle>
  );
}
