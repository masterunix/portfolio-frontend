'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import NavHexagon from '@/components/NavHexagon';
import Hexagon from '@/components/Hexagon';
import Footer from '@/components/Footer';
import { useTypewriter } from '@/hooks/useTypewriter';
import { useViewportSize } from '@/hooks/useViewportSize';
import { useMounted } from '@/hooks/useMounted';
import { navigationContent, skipList, NavigationItem } from '@/lib/constants';
import type { HomeMessage } from '@/types';

interface GridItem {
  id: string;
  row: number;
  col: number;
  x: number;
  y: number;
  width: number;
  height: number;
  delay: number;
  navData?: NavigationItem;
}

export default function HomeDesktop({ messages }: { messages: HomeMessage[] }) {
  const mounted = useMounted();
  const [isExiting, setIsExiting] = useState(false);

  const router = useRouter();
  const viewport = useViewportSize();
  const { text, currentMessage } = useTypewriter(messages || []);

  // Calculate desktop hex grid positions (recomputes on debounced resize)
  const gridItems = useMemo((): GridItem[] => {
    if (!viewport) return [];

    const viewportWidth = viewport.width;
    const viewportHeight = viewport.height;

    const baseHexWidth = Math.floor(viewportWidth / 5.69);
    const baseHexHeight = Math.floor(baseHexWidth * 1.1547);
    const gapPx = 19;
    const hexWidth = baseHexWidth;
    const hexHeight = baseHexHeight;
    const hexSpacingX = hexWidth + gapPx;
    const hexSpacingY = hexHeight * 0.75 + gapPx;

    const rows = 4;
    const cols = 8;

    const gridWidth = (cols - 1) * hexSpacingX + hexWidth;
    const gridHeight = (rows - 1) * hexSpacingY + hexHeight;
    const startX = (viewportWidth - gridWidth) / 2;
    const startY = (viewportHeight - gridHeight) / 2;

    const shouldSkip = (row: number, col: number) => {
      return skipList.some(([r, c]) => r === row && c === col);
    };

    const newGridItems: GridItem[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (shouldSkip(row, col)) continue;

        const offsetX = (row % 2 === 1) ? hexSpacingX / 2 : 0;
        const x = startX + col * hexSpacingX + offsetX;
        const y = startY + row * hexSpacingY;
        const hexId = `${row}-${col}`;
        const navData = navigationContent[hexId];
        const delay = (col + row) * 0.06;

        newGridItems.push({
          id: hexId, row, col, x, y,
          width: hexWidth, height: hexHeight, delay, navData
        });
      }
    }

    return newGridItems;
  }, [viewport]);

  const handleNavigate = useCallback((e: React.MouseEvent, href: string, external: boolean) => {
    e.preventDefault();
    if (external) {
      window.open(href, '_blank');
      return;
    }

    setIsExiting(true);
    const maxDelay = 600; 
    setTimeout(() => {
      router.push(href);
    }, maxDelay + 200);
  }, [router]);

  if (!mounted) return null;

  return (
    <main className="relative w-full h-screen overflow-hidden bg-transparent">
      {/* Header */}
      <header 
        className={`fixed left-1/2 -translate-x-1/2 text-center z-[100] transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}
        style={{ top: '20px' }}
      >
        <h1
          onClick={() => {
            if (currentMessage?.link) window.open(currentMessage.link, '_blank');
          }}
          className={`text-white font-bold text-4xl m-0 ${currentMessage?.link ? 'cursor-pointer hover:opacity-80' : 'cursor-default'} transition-opacity`}
          style={{
            fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
            textShadow: '0 2px 8px rgba(0,0,0,0.7)',
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap',
            borderRight: '3px solid white',
            animation: 'blink-cursor 0.75s step-end infinite'
          }}
        >
          {text}
        </h1>
      </header>

      {/* Honeycomb Grid */}
      <div className="absolute inset-0">
        {gridItems.map((item) => {
          const style = {
            position: 'absolute' as const,
            left: `${item.x}px`,
            top: `${item.y}px`,
            width: `${item.width}px`,
            height: `${item.height}px`,
            animation: isExiting ? `fadeOutDown 0.15s ease-in forwards ${(item.col + item.row) * 50}ms` : undefined
          };

          if (item.navData) {
            const nav = item.navData;
            return (
              <div
                key={item.id}
                className="cursor-pointer"
                onClick={(e) => handleNavigate(e, nav.href, nav.external)}
              >
                <NavHexagon
                  icon={nav.svg}
                  title={nav.text}
                  description={nav.description}
                  color={nav.color}
                  delay={item.delay}
                  style={style}
                />
              </div>
            );
          }

          return (
            <Hexagon 
              key={item.id} 
              delay={item.delay} 
              style={style}
              className="pointer-events-none" 
            />
          );
        })}
      </div>

      {/* Footer */}
      <Footer 
        variant="full"
        className={`fixed left-1/2 -translate-x-1/2 z-50 text-center transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}
        style={{ bottom: '10px' }}
      />
    </main>
  );
}
