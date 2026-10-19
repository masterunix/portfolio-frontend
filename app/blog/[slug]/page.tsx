import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import BlogPostView from './BlogPostView';
import JsonLd from '@/components/JsonLd';
import { getPost, getPosts } from '@/lib/content';
import { baseOpenGraph, postSchema } from '@/lib/metadata';

/** Every post is built ahead of time; any other /blog/… address is a 404 */
export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    ...(post.tags.length && { keywords: post.tags }),
    openGraph: {
      ...baseOpenGraph(),
      url: `/blog/${post.slug}`,
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
  return (
    <>
      <JsonLd data={postSchema(post)} />
      <BlogPostView post={post} />
    </>
  );
}
