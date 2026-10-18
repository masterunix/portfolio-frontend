/**
 * BlogHex.tsx — A blog post's tile on the Blog page.
 *
 * Used inside a parent <Hexagon>. Shows the post's date and reading time, its title
 * and description, and a Read button. Pure presentational: opening the post (with
 * the page's exit animation) is handled by BlogClient.
 */
'use client';

import React from 'react';

import { formatPostDate } from '@/lib/blogFormat';
import type { BlogPostSummary } from '@/types';

interface BlogHexProps {
  post: BlogPostSummary;
  /** Click handler for the Read button */
  onOpen: (e: React.MouseEvent) => void;
}

export default function BlogHex({ post, onOpen }: BlogHexProps) {
  return (
    <div className="hex-content pointer-events-auto" style={{ gap: '6px', padding: '28px' }}>
      {/* Date · reading time */}
      <div className="text-[10px] text-white/60 text-center uppercase tracking-wider font-semibold shrink-0">
        {formatPostDate(post.date)} · {post.readMins} min
      </div>

      {/* Title */}
      <div className="text-[14px] font-bold text-white text-center leading-tight line-clamp-2 shrink-0">
        {post.title}
      </div>

      {/* Description */}
      <div className="text-[10px] text-white/75 text-center leading-[1.4] line-clamp-3 max-w-[170px] shrink-0">
        {post.description}
      </div>

      {post.draft && (
        <div className="blog-draft text-[9px] uppercase shrink-0">Draft</div>
      )}

      <button className="hex-button mt-1" onClick={onOpen} aria-label={`Read ${post.title}`}>
        Read
      </button>
    </div>
  );
}
