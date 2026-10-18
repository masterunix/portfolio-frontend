/**
 * BlogClient.tsx — The Blog page: a honeycomb of posts (desktop) or glass cards (mobile).
 *
 * Desktop: the same 4 × 8 honeycomb as the Resumes page, with posts in the middle
 * positions and the same intro and outro (lib/hexTransition). Opening a post or going
 * back plays the outro first. With more posts than the honeycomb holds, desktop shows
 * the card list too, so no post is ever left out.
 * Mobile: a scrollable list of glass cards.
 */
'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useIsMobile } from '@/hooks/useIsMobile';
import { useViewportSize } from '@/hooks/useViewportSize';
import { useMounted } from '@/hooks/useMounted';
import { computeHexLayout, calculateHexX, calculateHexY } from '@/lib/layoutUtils';
import { enterDelay, exitDelay, exitDurationMs, lastStepOf } from '@/lib/hexTransition';
import { formatPostDate } from '@/lib/blogFormat';
import Hexagon from '@/components/Hexagon';
import BlogHex from '@/components/BlogHex';
import Footer from '@/components/Footer';
import type { BlogPostSummary } from '@/types';

const GRID_CONFIG = { rows: 4, cols: 8, gap: 20, scaleDivisor: 5.69 };
const SKIP = [[0, 0], [2, 0], [0, 7], [2, 7], [1, 7], [3, 7]];

/**
 * Where posts go, newest first, filling outward from the centre so a few posts sit in
 * the middle: [1, 3] is dead centre (odd rows are shifted half a hex right), the
 * pair under it is centred too, and each later pair widens the block evenly.
 */
const POST_POSITIONS = [
  [1, 3],
  [2, 3], [2, 4],
  [1, 2], [1, 4],
  [2, 2], [2, 5],
  [1, 1], [1, 5],
  [3, 2], [3, 3], [3, 4],
];

/** Where the "no posts yet" tile goes */
const EMPTY_POSITION = [1, 3];

interface GridItem {
  id: string;
  row: number;
  col: number;
  x: number;
  y: number;
  post: BlogPostSummary | null;
  isEmptyNote: boolean;
}

export default function BlogClient({ posts }: { posts: BlogPostSummary[] }) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const mounted = useMounted();
  const [isExiting, setIsExiting] = useState(false);

  const viewport = useViewportSize();
  const layout = useMemo(() => {
    if (!viewport) return null;
    return computeHexLayout(viewport.width, viewport.height, GRID_CONFIG);
  }, [viewport]);

  const gridItems = useMemo((): GridItem[] => {
    if (!layout) return [];
    const { hexSpacingX, hexSpacingY, startY, hexWidth } = layout;
    const items: GridItem[] = [];

    for (let row = 0; row < GRID_CONFIG.rows; row++) {
      for (let col = 0; col < GRID_CONFIG.cols; col++) {
        if (SKIP.some(([r, c]) => r === row && c === col)) continue;
        const slot = POST_POSITIONS.findIndex(([r, c]) => r === row && c === col);
        const isEmptyNote = posts.length === 0 && row === EMPTY_POSITION[0] && col === EMPTY_POSITION[1];
        items.push({
          id: `${row}-${col}`, row, col,
          x: calculateHexX(row, col, hexSpacingX, 0, layout.setWidth),
          y: calculateHexY(row, hexSpacingY, startY),
          post: slot >= 0 ? posts[slot] ?? null : null,
          isEmptyNote,
        });
      }
    }

    // Center the grid horizontally
    const gridContentWidth = (GRID_CONFIG.cols - 1) * hexSpacingX + hexWidth;
    const shiftX = ((viewport?.width ?? 1200) - gridContentWidth) / 2;
    items.forEach((item) => { item.x += shiftX; });
    return items;
  }, [layout, posts, viewport]);

  // The exit is the entrance backwards, and navigates when it ends
  const lastStep = lastStepOf(gridItems);

  /** Plays the exit animation (desktop honeycomb only), then navigates */
  const leaveTo = useCallback((href: string, animate: boolean) => {
    if (!animate) {
      router.push(href);
      return;
    }
    setIsExiting(true);
    setTimeout(() => router.push(href), exitDurationMs(lastStep));
  }, [router, lastStep]);

  if (!mounted) return null;

  const useHoneycomb = !isMobile && posts.length <= POST_POSITIONS.length;

  // ─── List Layout (mobile, or more posts than the honeycomb holds) ────────

  if (!useHoneycomb) {
    return (
      <main className="relative w-full min-h-screen">
        <div className="mobile-header">
          <Link href="/" className="mobile-back">← Back</Link>
          <h1 className="text-white font-bold text-xl mt-3" style={{ fontFamily: "'Inter', sans-serif" }}>
            Blog
          </h1>
        </div>

        <div className={`mobile-scroll ${isMobile ? '' : 'max-w-[720px] mx-auto'}`}>
          {posts.length === 0 && (
            <div className="mobile-glass-card" style={{ flexDirection: 'column', alignItems: 'flex-start', cursor: 'default' }}>
              <div className="mobile-card-title">No posts yet</div>
              <div className="mobile-card-desc">The first one is on its way.</div>
            </div>
          )}
          {posts.map((post, index) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="mobile-glass-card no-underline"
              style={{
                flexDirection: 'column', alignItems: 'flex-start', gap: '6px',
                animation: `fadeInUp 0.4s ease-out forwards ${index * 60}ms`, opacity: 0
              }}
            >
              <div className="mobile-card-meta uppercase tracking-wider">
                {formatPostDate(post.date)} · {post.readMins} min read
                {post.draft && <> · <span className="blog-draft">Draft</span></>}
              </div>
              <div className="mobile-card-title">{post.title}</div>
              <div className="mobile-card-desc">{post.description}</div>
            </Link>
          ))}
        </div>

        <Footer variant="minimal" className="w-full text-center py-6 mt-4 opacity-70" />
      </main>
    );
  }

  // ─── Desktop Honeycomb ───────────────────────────────────────────────────

  if (!layout) return null;
  const { hexWidth, hexHeight } = layout;

  return (
    <main className="relative w-full h-screen overflow-hidden">
      <header
        className={`fixed left-1/2 -translate-x-1/2 text-center z-[100] transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}
        style={{ top: '20px', animation: isExiting ? undefined : 'fadeIn 0.5s ease-out forwards 200ms', opacity: 0 }}
      >
        <h1 className="text-white text-4xl font-bold tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] whitespace-nowrap"
          style={{ fontFamily: "'Inter', sans-serif", marginBottom: '12px' }}>
          Blog
        </h1>
        <div className="back-button-glass">
          <Link href="/" onClick={(e) => { e.preventDefault(); leaveTo('/', true); }}>← Back to Home</Link>
        </div>
      </header>

      <div className="absolute inset-0">
        {gridItems.map((item) => (
          <Hexagon
            key={item.id} isExiting={isExiting}
            delay={enterDelay(item.row, item.col)}
            exitDelay={exitDelay(item.row, item.col, lastStep)}
            onClick={item.post ? () => leaveTo(`/blog/${item.post!.slug}`, true) : undefined}
            style={{ position: 'absolute', left: item.x, top: item.y, width: hexWidth, height: hexHeight }}
          >
            {item.post ? (
              <BlogHex
                post={item.post}
                onOpen={(e) => { e.stopPropagation(); leaveTo(`/blog/${item.post!.slug}`, true); }}
              />
            ) : item.isEmptyNote ? (
              <div className="hex-content">
                <div className="text-[14px] font-bold text-white text-center">No posts yet</div>
                <div className="text-[10px] text-white/70 text-center">The first one is on its way.</div>
              </div>
            ) : null}
          </Hexagon>
        ))}
      </div>

      <Footer
        variant="full"
        className="fixed left-1/2 -translate-x-1/2 z-50 text-center"
        style={{ bottom: 10, opacity: isExiting ? undefined : 0,
          animation: isExiting ? 'fadeOut 0.5s ease-out forwards' : 'fadeIn 0.5s ease-out forwards 1000ms' }}
      />
    </main>
  );
}
