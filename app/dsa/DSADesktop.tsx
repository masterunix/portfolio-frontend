'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Hexagon from '@/components/Hexagon';
import DSAPlatformHex from '@/components/DSAPlatformHex';
import DSAConceptHex from '@/components/DSAConceptHex';
import { DSAPlatform, DSA_CONCEPTS } from './DSAClient';

const GRID_CONFIG = { rows: 3, gap: 20 };

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

interface DSADesktopProps {
  platforms: DSAPlatform[];
}

export default function DSADesktop({ platforms }: DSADesktopProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const layout = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
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

  useEffect(() => { setMounted(true); }, []);

  const handleBack = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsExiting(true);
    const maxDelay = (5 + GRID_CONFIG.rows) * 50;
    setTimeout(() => router.push('/'), maxDelay + 200);
  }, [router]);

  const handleVisitPlatform = useCallback((e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    window.open(url, '_blank');
  }, []);

  const gridItems = useMemo((): GridItem[] => {
    if (!layout) return [];
    const items: GridItem[] = [];
    for (let row = 0; row < GRID_CONFIG.rows; row++) {
      const colsInRow = (row === 1) ? 4 : 5;
      for (let col = 0; col < colsInRow; col++) {
        const offsetX = (row % 2 === 1) ? layout.hexSpacingX / 2 : 0;
        const x = layout.startX + col * layout.hexSpacingX + offsetX;
        const y = layout.startY + row * layout.hexSpacingY;
        let type: 'platform' | 'concept';
        let data: DSAPlatform | typeof DSA_CONCEPTS[0];
        if (row === 1) { type = 'platform'; data = platforms[col]; if (!data) continue; }
        else { type = 'concept'; const ci = row === 0 ? col : (col + 5); data = DSA_CONCEPTS[ci]; if (!data) continue; }
        items.push({ id: `${row}-${col}`, row, col, x, y, delay: (col + row) * 0.05, type, data });
      }
    }
    return items;
  }, [layout, platforms]);

  if (!mounted || !layout) return null;

  return (
    <main className="relative w-full h-screen overflow-hidden">
      <header
        className={`fixed left-1/2 -translate-x-1/2 text-center z-[100] transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}
        style={{ top: '20px', animation: isExiting ? undefined : 'fadeIn 0.5s ease-out forwards 200ms', opacity: 0 }}
      >
        <h1 className="text-white text-4xl font-bold tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] whitespace-nowrap"
          style={{ fontFamily: "'Inter', sans-serif", marginBottom: '12px' }}>
          DSA Stats
        </h1>
        <div className="back-button-glass"><a href="/" onClick={handleBack}>← Back to Home</a></div>
      </header>

      <div className="absolute inset-0">
        {gridItems.map((item) => {
          const style = {
            position: 'absolute' as const,
            left: `${item.x}px`, top: `${item.y}px`,
            width: `${layout.hexWidth}px`, height: `${layout.hexHeight}px`
          };
          return (
            <Hexagon key={item.id} delay={item.delay} isExiting={isExiting}
              className={`transition-all duration-300 ${item.type === 'platform' ? 'cursor-pointer' : ''}`}
              style={style}
              onClick={() => { if (item.type === 'platform') window.open((item.data as DSAPlatform).url, '_blank'); }}>
              {item.type === 'platform' ? (
                <DSAPlatformHex platform={item.data as DSAPlatform} onVisit={(e) => handleVisitPlatform(e, (item.data as DSAPlatform).url)} />
              ) : (
                <DSAConceptHex concept={item.data as typeof DSA_CONCEPTS[0]} />
              )}
            </Hexagon>
          );
        })}
      </div>

      <footer
        className={`fixed left-1/2 -translate-x-1/2 z-50 text-center transition-opacity duration-500 ${isExiting ? 'opacity-0' : ''}`}
        style={{ bottom: 10, opacity: 0, animation: 'fadeIn 0.5s ease-out forwards', animationDelay: '400ms' }}>
        <p className="text-[12px] text-white/50 m-0 mb-1">© 2025 - 2026 Vatsal Goyal. All rights reserved.</p>
        <p className="text-[10px] text-white/40 m-0">This website uses Strapi, managed by <a href="https://github.com/masterunix/gleck" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/60 transition-colors">Gleck</a>, my Personal AI Agent.</p>
      </footer>
    </main>
  );
}
