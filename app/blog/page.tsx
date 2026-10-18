/**
 * /blog — Every post, newest first, as readable cards in the same glass panel as the
 * posts themselves. A server component: the list is in the page's HTML.
 */
import Image from 'next/image';
import Link from 'next/link';

import GlassArticle from '@/components/GlassArticle';
import { getPosts, getSite } from '@/lib/content';
import { formatDate } from '@/lib/format';
import { pageMetadata } from '@/lib/metadata';

export const generateMetadata = () => pageMetadata('blog');

export default function BlogPage() {
  const { title, description } = getSite().pages.blog;
  const posts = getPosts();

  return (
    <GlassArticle back={{ href: '/', label: 'Home' }}>
      <h1 className="article-title">{title}</h1>
      <p className="article-lead">{description}</p>

      {posts.length === 0 ? (
        <p className="post-empty">No posts yet. The first one is on its way.</p>
      ) : (
        <ul className="post-list">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="post-card">
                {post.cover && (
                  <Image
                    src={post.cover.url}
                    alt=""
                    width={1280}
                    height={720}
                    className="post-cover"
                    unoptimized={post.cover.url.toLowerCase().endsWith('.svg')}
                  />
                )}
                <div className="article-meta">
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  <span>·</span>
                  <span>{post.readMins} min read</span>
                  {post.draft && <><span>·</span><span className="blog-draft">Draft</span></>}
                </div>
                <h2>{post.title}</h2>
                <p>{post.description}</p>
                {post.tags.length > 0 && (
                  <ul className="article-tags" aria-label="Tags">
                    {post.tags.map((tag) => <li key={tag}>{tag}</li>)}
                  </ul>
                )}
                <span className="post-read" aria-hidden="true">Read <span>→</span></span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </GlassArticle>
  );
}
