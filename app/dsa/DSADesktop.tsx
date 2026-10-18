'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { computeHexLayout, calculateHexX, calculateHexY } from '@/lib/layoutUtils';
import { enterDelay, exitDelay, exitDurationMs, lastStepOf } from '@/lib/hexTransition';
import { useViewportSize } from '@/hooks/useViewportSize';
import { useMounted } from '@/hooks/useMounted';
import Hexagon from '@/components/Hexagon';
import DSAPlatformHex from '@/components/DSAPlatformHex';
import DSAConceptHex from '@/components/DSAConceptHex';
import Footer from '@/components/Footer';
import type { DSAPlatform, DSAConcept } from '@/types';
import { DSA_CONCEPTS } from './DSAClient';

const GRID_CONFIG = { rows: 3, cols: 5, gap: 20 };

interface GridItem {
  id: string;
  row: number;
  col: number;
  x: number;
  y: number;
  isPlatform: boolean;
  data: DSAPlatform | DSAConcept;
}

interface DSADesktopProps {
  platforms: DSAPlatform[];
}

export default function DSADesktop({ platforms = [] }: DSADesktopProps) {
  const router = useRouter();
  const mounted = useMounted();
  const [isExiting, setIsExiting] = useState(false);

  const viewport = useViewportSize();
  const layout = useMemo(() => {
    if (!viewport) return null;
    return computeHexLayout(viewport.width, viewport.height, GRID_CONFIG);
  }, [viewport]);

  const gridItems = useMemo((): GridItem[] => {
    if (!layout) return [];
    const items: GridItem[] = [];
    const { hexSpacingX, hexSpacingY, startY, hexWidth } = layout;

    for (let row = 0; row < GRID_CONFIG.rows; row++) {
      for (let col = 0; col < GRID_CONFIG.cols; col++) {
        let data: DSAPlatform | DSAConcept | undefined;
        let isPlatform = false;

        if (row === 1) {
          const platformsCount = platforms.length;
          const startCol = Math.max(0, Math.floor((GRID_CONFIG.cols - platformsCount) / 2));
          const platformIndex = col - startCol;
          
          if (platformIndex >= 0 && platformIndex < platformsCount) {
            data = platforms[platformIndex];
            isPlatform = true;
          }
        } else if (row === 0) {
          if (col < 5 && DSA_CONCEPTS[col]) {
            data = DSA_CONCEPTS[col];
          }
        } else if (row === 2) {
          const conceptIndex = col + 5;
          if (col < 5 && DSA_CONCEPTS[conceptIndex]) {
            data = DSA_CONCEPTS[conceptIndex];
          }
        }

        if (data) {
          items.push({
            id: `${row}-${col}`, row, col,
            x: calculateHexX(row, col, hexSpacingX, 0, layout.setWidth),
            y: calculateHexY(row, hexSpacingY, startY),
            isPlatform, data
          });
        }
      }
    }
    
    // Centering logic: Match the original gridWidth calculation
    const windowWidth = viewport?.width ?? 1200;
    const gridContentWidth = (GRID_CONFIG.cols - 1) * hexSpacingX + hexWidth;
    const shiftX = (windowWidth - gridContentWidth) / 2;

    items.forEach(item => { item.x += shiftX; });

    return items;
  }, [layout, platforms, viewport]);

  // The exit wave's length: when to navigate
  const lastStep = lastStepOf(gridItems);

  const handleBack = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsExiting(true);
    setTimeout(() => router.push('/'), exitDurationMs(lastStep));
  }, [router, lastStep]);

  if (!mounted || !layout) return null;

  const { hexWidth, hexHeight } = layout;

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
        <div className="back-button-glass">
          <Link href="/" onClick={handleBack}>← Back to Home</Link>
        </div>
      </header>

      <div className="absolute inset-0">
        {gridItems.map((item) => {
          return (
            <Hexagon
              key={item.id} isExiting={isExiting}
              delay={enterDelay(item.row, item.col)}
              exitDelay={exitDelay(item.row, item.col)}
              style={{ position: 'absolute', left: item.x, top: item.y, width: hexWidth, height: hexHeight }}
            >
              {item.isPlatform ? (
                <DSAPlatformHex
                  platform={item.data as DSAPlatform}
                  onVisit={(e) => {
                    e.stopPropagation();
                    window.open((item.data as DSAPlatform).url, '_blank', 'noopener,noreferrer');
                  }}
                />
              ) : (
                <DSAConceptHex concept={item.data as DSAConcept} />
              )}
            </Hexagon>
          );
        })}
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
