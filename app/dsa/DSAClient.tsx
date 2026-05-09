'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Hexagon from '@/components/Hexagon';
import DSAPlatformHex from '@/components/DSAPlatformHex';
import DSAConceptHex from '@/components/DSAConceptHex';

const GRID_CONFIG = {
  rows: 3,
  gap: 20
};

// DSA concepts for top and bottom rows
const DSA_CONCEPTS = [
  // Top row (5 concepts)
  { title: 'Arrays', icon: '📊', description: 'Linear data structures', color: '#3498db' },
  { title: 'Linked Lists', icon: '🔗', description: 'Dynamic data structures', color: '#9b59b6' },
  { title: 'Stacks', icon: '📚', description: 'LIFO data structure', color: '#e74c3c' },
  { title: 'Queues', icon: '🚶', description: 'FIFO data structure', color: '#f39c12' },
  { title: 'Trees', icon: '🌳', description: 'Hierarchical structures', color: '#27ae60' },
  // Bottom row (5 concepts)
  { title: 'Graphs', icon: '🕸️', description: 'Network structures', color: '#2c3e50' },
  { title: 'Hashing', icon: '#️⃣', description: 'Key-value mapping', color: '#8e44ad' },
  { title: 'Sorting', icon: '🔢', description: 'Ordering algorithms', color: '#d35400' },
  { title: 'Searching', icon: '🔍', description: 'Finding algorithms', color: '#16a085' },
  { title: 'Dynamic Programming', icon: '🧮', description: 'Optimization technique', color: '#c0392b' }
];

interface DSAPlatform {
  id: number;
  name: string;
  url: string;
  color: string;
  logoPath?: string;
  logo?: { url: string };
  order: number;
}

interface GridItem {
  id: string;
  row: number;
  col: number;
  x: number;
  y: number;
  delay: number;
  type: 'platform' | 'concept';
  data: DSAPlatform | typeof DSA_CONCEPTS[0];
}

interface DSAClientProps {
  platforms: DSAPlatform[];
}

/**
 * DSAClient — static grid of DSA platforms and concepts.
 * 
 * Architecture:
 * - 3 rows: top (DSA concepts), middle (platforms), bottom (DSA concepts)
 * - Static layout (no carousel)
 * - Middle row has 4 platforms, top/bottom rows have 5 concepts each
 * - All components modular and reusable
 * - No DOM manipulation - pure React
 */
export default function DSAClient({ platforms }: DSAClientProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  /**
   * Compute layout based on viewport size.
   * Uses same ratio as Projects/Skills pages for consistency.
   */
  const layout = useMemo(() => {
    if (typeof window === 'undefined') return null;
    
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Same ratio as Projects/Skills pages (4.27)
    const hexWidth = Math.floor(vw / 4.27);
    const hexHeight = Math.floor(hexWidth * 1.1547);
    const hexSpacingX = hexWidth + GRID_CONFIG.gap;
    const hexSpacingY = hexHeight * 0.75 + GRID_CONFIG.gap;

    const maxCols = 5;
    const gridWidth = (maxCols - 1) * hexSpacingX + hexWidth;
    const gridHeight = (GRID_CONFIG.rows - 1) * hexSpacingY + hexHeight;

    const startX = (vw - gridWidth) / 2;
    const startY = (vh - gridHeight) / 2;

    return { hexWidth, hexHeight, hexSpacingX, hexSpacingY, startX, startY };
  }, [mounted]);

  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Handle navigation back to home with exit animation.
   */
  const handleBack = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsExiting(true);
    const maxDelay = (5 + GRID_CONFIG.rows) * 50; // Max cols + rows
    setTimeout(() => router.push('/'), maxDelay + 200);
  }, [router]);

  /**
   * Handle platform visit button click.
   */
  const handleVisitPlatform = useCallback((e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    window.open(url, '_blank');
  }, []);

  /**
   * Build grid items with positions and types.
   * Memoized to prevent recalculation on every render.
   */
  const gridItems = useMemo((): GridItem[] => {
    if (!layout) return [];

    const items: GridItem[] = [];

    for (let row = 0; row < GRID_CONFIG.rows; row++) {
      // Top and bottom rows have 5 items, middle row has 4 items (offset)
      const colsInRow = (row === 1) ? 4 : 5;
      
      for (let col = 0; col < colsInRow; col++) {
        const offsetX = (row % 2 === 1) ? layout.hexSpacingX / 2 : 0;
        const x = layout.startX + col * layout.hexSpacingX + offsetX;
        const y = layout.startY + row * layout.hexSpacingY;
        
        let type: 'platform' | 'concept';
        let data: DSAPlatform | typeof DSA_CONCEPTS[0];

        if (row === 1) {
          // Middle row - platforms
          type = 'platform';
          data = platforms[col];
          if (!data) continue; // Skip if no platform data
        } else {
          // Top/bottom rows - concepts
          type = 'concept';
          const conceptIndex = row === 0 ? col : (col + 5);
          data = DSA_CONCEPTS[conceptIndex];
          if (!data) continue; // Skip if no concept data
        }

        items.push({
          id: `${row}-${col}`,
          row,
          col,
          x,
          y,
          delay: (col + row) * 0.05,
          type,
          data
        });
      }
    }

    return items;
  }, [layout, platforms]);

  // Early return AFTER all hooks
  if (!mounted || !layout) return null;

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black">
      {/* Header */}
      <header 
        className={`fixed left-1/2 -translate-x-1/2 text-center z-[100] transition-opacity duration-500 ${isExiting ? 'opacity-0' : ''}`}
        style={{ top: 20, animation: 'fadeIn 0.5s ease-out forwards 200ms', opacity: 0 }}
      >
        <h1 
          className="text-white text-[32px] font-bold mb-2.5 tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] whitespace-nowrap" 
          style={{ fontFamily: "'Inter', sans-serif", marginBottom: '12px' }}
        >
          DSA Stats
        </h1>
        <a
          href="/"
          onClick={handleBack}
          className="inline-block transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg,rgba(255,255,255,0.1) 0%,rgba(255,255,255,0.05) 100%)',
            border: '1px solid rgba(255,255,255,0.18)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: 25,
            fontSize: 14,
            fontWeight: 500,
            backdropFilter: 'blur(15px) saturate(180%)',
            WebkitBackdropFilter: 'blur(15px) saturate(180%)',
            textDecoration: 'none',
            boxShadow: '0 8px 32px 0 rgba(0,0,0,0.37),inset 0 1px 0 0 rgba(255,255,255,0.1)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'linear-gradient(135deg,rgba(255,255,255,0.15) 0%,rgba(255,255,255,0.08) 100%)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'linear-gradient(135deg,rgba(255,255,255,0.1) 0%,rgba(255,255,255,0.05) 100%)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          ← Back to Home
        </a>
      </header>

      {/* Grid */}
      <div className="absolute inset-0">
        {gridItems.map((item) => {
          const style = {
            position: 'absolute' as const,
            left: `${item.x}px`,
            top: `${item.y}px`,
            width: `${layout.hexWidth}px`,
            height: `${layout.hexHeight}px`
          };

          const className = `transition-all duration-300 hover:scale-[1.05] hover:z-10 hover:brightness-120 ${item.type === 'platform' ? 'cursor-pointer' : ''}`;

          return (
            <Hexagon
              key={item.id}
              delay={item.delay}
              isExiting={isExiting}
              className={className}
              style={style}
              onClick={() => {
                if (item.type === 'platform') {
                  window.open((item.data as DSAPlatform).url, '_blank');
                }
              }}
            >
              {item.type === 'platform' ? (
                <DSAPlatformHex 
                  platform={item.data as DSAPlatform}
                  onVisit={(e) => handleVisitPlatform(e, (item.data as DSAPlatform).url)}
                />
              ) : (
                <DSAConceptHex concept={item.data as typeof DSA_CONCEPTS[0]} />
              )}
            </Hexagon>
          );
        })}
      </div>

      {/* Footer */}
      <footer 
        className={`fixed left-1/2 -translate-x-1/2 z-50 text-center transition-opacity duration-500 ${isExiting ? 'opacity-0' : ''}`}
        style={{ bottom: 10, opacity: 0, animation: 'fadeIn 0.5s ease-out forwards', animationDelay: '400ms' }}
      >
        <p className="text-[12px] text-white/50 m-0 mb-1">© 2025 - 2026 Vatsal Goyal. All rights reserved.</p>
        <p className="text-[10px] text-white/40 m-0">This website uses Strapi, managed by Gleck, my Personal AI Agent.</p>
      </footer>
    </main>
  );
}
