import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import BlogPostView from './BlogPostView';
import { getPost, getPosts } from '@/lib/content';

/** Every post is built ahead of time; any other /blog/… address is a 404 */
export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    title: `${post.title} | Vatsal Goyal`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      ...(post.updated && { modifiedTime: post.updated }),
      ...(post.cover && { images: [post.cover.url] }),
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  return <BlogPostView post={post} />;
}
