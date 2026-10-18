import type { Metadata } from 'next';
import BlogClient from './BlogClient';
import { getPosts } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Blog | Vatsal Goyal',
  description: 'Notes on what I build and learn: web development, AI/ML and problem solving.',
};

export default function BlogPage() {
  return <BlogClient posts={getPosts()} />;
}
