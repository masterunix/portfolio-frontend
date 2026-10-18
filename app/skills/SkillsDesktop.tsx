'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { computeHexLayout, calculateHexX, calculateHexY } from '@/lib/layoutUtils';
import { useCarousel } from '@/hooks/useCarousel';
import { useViewportSize } from '@/hooks/useViewportSize';
import { useMounted } from '@/hooks/useMounted';
import CarouselHex from '@/components/CarouselHex';
import HexShell from '@/components/HexShell';
import CareerSkillHex from '@/components/CareerSkillHex';
import SkillTechHex from '@/components/SkillTechHex';
import Footer from '@/components/Footer';
import type { Skill, TechSkill } from '@/types';

const GRID_CONFIG = { rows: 3, cols: 14, gap: 20 };
const NUM_SETS = 3;

interface GridItem {
  id: string;
  row: number;
  col: number;
  setIndex: number;
  x: number;
  y: number;
  isCareer: boolean;
  data: Skill | TechSkill;
}

interface SkillsDesktopProps {
  careerSkills: Skill[];
  techSkills: TechSkill[];
}

export default function SkillsDesktop({ careerSkills = [], techSkills = [] }: SkillsDesktopProps) {
  const router = useRouter();
  const mounted = useMounted();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const viewport = useViewportSize();
  const layout = useMemo(() => {
    if (!viewport) return null;
    return computeHexLayout(viewport.width, viewport.height, GRID_CONFIG);
  }, [viewport]);

  const { carouselOffset, navigateToItem } = useCarousel({
    itemCount: careerSkills.length || 1,
    itemSpacing: layout?.hexSpacingX || 0,
    setWidth: layout?.setWidth || 0,
    autoScrollSpeed: 0.39,
    onIndexChange: setActiveIndex
  });

  const handleBack = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsExiting(true);
    const maxDelay = (GRID_CONFIG.cols + GRID_CONFIG.rows) * 50;
    setTimeout(() => router.push('/'), maxDelay + 200);
  }, [router]);

  const gridItems = useMemo((): GridItem[] => {
    if (!layout) return [];
    const items: GridItem[] = [];
    const { hexSpacingX, hexSpacingY, startY, setWidth } = layout;
    const careerLen = careerSkills.length || 1;
    const techLen = techSkills.length || 1;

    for (let setIndex = 0; setIndex < NUM_SETS; setIndex++) {
      for (let row = 0; row < GRID_CONFIG.rows; row++) {
        for (let col = 0; col < GRID_CONFIG.cols; col++) {
          let data: Skill | TechSkill;
          let isCareer = false;
          
          if (row === 1) {
            data = careerSkills[col % careerLen] || careerSkills[0];
            isCareer = true;
          } else {
            data = techSkills[col % techLen] || techSkills[0];
          }
          
          if (data) {
            items.push({
              id: `${setIndex}-${row}-${col}`, row, col, setIndex,
              x: calculateHexX(row, col, hexSpacingX, setIndex, setWidth) - hexSpacingX,
              y: calculateHexY(row, hexSpacingY, startY),
              isCareer, data
            });
          }
        }
      }
    }
    return items;
  }, [layout, careerSkills, techSkills]);

  if (!mounted || !layout) return null;

  const { hexWidth, hexHeight, hexSpacingX, setWidth } = layout;
  const totalWidth = setWidth * NUM_SETS;

  return (
    <main className="relative w-full h-screen overflow-hidden">
      <header
        className={`fixed left-1/2 -translate-x-1/2 text-center z-[100] transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}
        style={{ top: '20px', animation: isExiting ? undefined : 'fadeIn 0.5s ease-out forwards 200ms', opacity: 0 }}
      >
        <h1 className="text-white text-4xl font-bold tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] whitespace-nowrap"
          style={{ fontFamily: "'Inter', sans-serif", marginBottom: '12px' }}>
          Experience &amp; Skills
        </h1>
        <div className="back-button-glass">
          <Link href="/" onClick={handleBack}>← Back to Home</Link>
        </div>
      </header>

      <div className="absolute inset-0">
        {gridItems.map((item) => (
          <CarouselHex
            key={item.id} baseX={item.x} y={item.y} width={hexWidth} height={hexHeight}
            row={item.row} col={item.col} setIndex={item.setIndex}
            carouselOffset={carouselOffset} totalWidth={totalWidth}
            hexSpacing={hexSpacingX} isExiting={isExiting}
          >
            <HexShell isExiting={isExiting}>
              {item.isCareer ? (
                <CareerSkillHex skill={item.data as Skill} />
              ) : (
                <SkillTechHex tech={item.data as TechSkill} />
              )}
            </HexShell>
          </CarouselHex>
        ))}
      </div>

      <nav
        className="fixed left-1/2 -translate-x-1/2 flex items-center rounded-[25px] z-[1000]"
        style={{
          bottom: 125, gap: '8px', padding: '12px 24px',
          opacity: isExiting ? undefined : 0,
          animation: isExiting ? 'fadeOut 0.5s ease-out forwards' : 'fadeIn 0.5s ease-out forwards 600ms',
          background: 'linear-gradient(135deg,rgba(255,255,255,0.1) 0%,rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: '0 8px 32px 0 rgba(0,0,0,0.37),inset 0 1px 0 0 rgba(255,255,255,0.1),0 0 20px rgba(255,255,255,0.1)',
          justifyContent: 'center', alignItems: 'center'
        }}
        aria-label="Skill navigation"
      >
        {careerSkills.map((skill, index) => (
          <button key={skill.id} onClick={() => navigateToItem(index)} title={skill.name}
            aria-label={`Navigate to ${skill.name}`} aria-current={index === activeIndex ? 'true' : 'false'}
            className="relative flex items-center justify-center text-base transition-all duration-300 group"
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: index === activeIndex ? '2px solid rgba(255,255,255,0.5)' : '2px solid rgba(255,255,255,0.2)',
              backgroundColor: skill.color,
              boxShadow: index === activeIndex
                ? `0 0 20px ${skill.color}80,0 0 40px ${skill.color}40,0 4px 12px rgba(0,0,0,0.4),inset 0 1px 0 0 rgba(255,255,255,0.2)`
                : '0 2px 8px rgba(0,0,0,0.3)',
              transform: index === activeIndex ? 'scale(1.15)' : 'scale(1)', cursor: 'pointer'
            }}
          >
            <span>{skill.icon}</span>
            <div
              className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 group-hover:-translate-y-1"
              style={{
                minWidth: '140px', maxWidth: '200px', padding: '10px 14px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 16px ${skill.color}20`
              }}
            >
              <div style={{ width: '100%', height: '2px', borderRadius: '1px', backgroundColor: skill.color, marginBottom: '6px', opacity: 0.7 }} />
              <div className="text-[11px] font-bold text-white whitespace-nowrap text-center">{skill.name}</div>
              <div className="text-[9px] text-white/60 text-center mt-0.5 leading-tight">{skill.description}</div>
            </div>
          </button>
        ))}
      </nav>

      <div className="fixed left-1/2 -translate-x-1/2 px-3 py-1 rounded-xl text-white/80 bg-black/50 z-[1001]"
        style={{ bottom: 80, opacity: isExiting ? undefined : 0,
          animation: isExiting ? 'fadeOut 0.5s ease-out forwards' : 'fadeIn 0.5s ease-out forwards 800ms',
          fontSize: '12px', letterSpacing: '0.5px', fontWeight: 400, textAlign: 'center' }}>
        Use arrow keys to navigate experiences
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
