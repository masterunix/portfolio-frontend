'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { adjustColor } from '@/lib/utils';
import { computeHexLayout, calculateHexX, calculateHexY } from '@/lib/layoutUtils';
import { useCarousel } from '@/hooks/useCarousel';
import CarouselHex from '@/components/CarouselHex';
import CareerSkillHex from '@/components/CareerSkillHex';
import SkillTechHex from '@/components/SkillTechHex';
import { Skill, DEFAULT_TOP_SKILLS, DEFAULT_BOTTOM_SKILLS } from './SkillsClient';

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
  data: Skill | typeof DEFAULT_TOP_SKILLS[0];
}

interface SkillsDesktopProps {
  careerSkills: Skill[];
  topSkills: Skill[];
  bottomSkills: Skill[];
}

export default function SkillsDesktop({ careerSkills, topSkills, bottomSkills }: SkillsDesktopProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const topTech = topSkills.length > 0 ? topSkills : DEFAULT_TOP_SKILLS;
  const bottomTech = bottomSkills.length > 0 ? bottomSkills : DEFAULT_BOTTOM_SKILLS;

  const layout = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return computeHexLayout(window.innerWidth, window.innerHeight, GRID_CONFIG);
  }, [mounted]);

  const { carouselOffset, navigateToItem } = useCarousel({
    itemCount: careerSkills.length,
    itemSpacing: layout?.hexSpacingX || 0,
    setWidth: layout?.setWidth || 0,
    autoScrollSpeed: 0.39,
    onIndexChange: setActiveIndex
  });

  useEffect(() => { setMounted(true); }, []);

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

    for (let setIndex = 0; setIndex < NUM_SETS; setIndex++) {
      for (let row = 0; row < GRID_CONFIG.rows; row++) {
        for (let col = 0; col < GRID_CONFIG.cols; col++) {
          let data: Skill | typeof DEFAULT_TOP_SKILLS[0];
          let isCareer = false;
          if (row === 1) { data = careerSkills[col % careerSkills.length]; isCareer = true; }
          else if (row === 0) { data = topTech[col % topTech.length]; }
          else { data = bottomTech[col % bottomTech.length]; }

          items.push({
            id: `${setIndex}-${row}-${col}`, row, col, setIndex,
            x: calculateHexX(row, col, hexSpacingX, setIndex, setWidth),
            y: calculateHexY(row, hexSpacingY, startY),
            isCareer, data
          });
        }
      }
    }
    return items;
  }, [layout, careerSkills, topTech, bottomTech]);

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
          Experience and Skills
        </h1>
        <div className="back-button-glass"><a href="/" onClick={handleBack}>← Back to Home</a></div>
      </header>

      <div className="absolute inset-0">
        {gridItems.map((item) => (
          <CarouselHex key={item.id} baseX={item.x} y={item.y} width={hexWidth} height={hexHeight}
            row={item.row} col={item.col} setIndex={item.setIndex}
            carouselOffset={carouselOffset} totalWidth={totalWidth}
            hexSpacing={hexSpacingX} isExiting={isExiting}>
            {item.isCareer ? (
              <CareerSkillHex skill={item.data as Skill} isExiting={isExiting} />
            ) : (
              <SkillTechHex tech={item.data} isExiting={isExiting} />
            )}
          </CarouselHex>
        ))}
      </div>

      <nav className="fixed left-1/2 -translate-x-1/2 flex items-center rounded-[25px] z-[1000]"
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
        aria-label="Skills navigation"
      >
        {careerSkills.map((skill, index) => (
          <button key={skill.id} onClick={() => navigateToItem(index)} title={skill.name}
            aria-label={`Navigate to ${skill.name}`} aria-current={index === activeIndex ? 'true' : 'false'}
            className="relative flex items-center justify-center text-base transition-all duration-300 group"
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: index === activeIndex ? '2px solid rgba(255,255,255,0.5)' : '2px solid rgba(255,255,255,0.2)',
              background: `linear-gradient(135deg,${skill.color} 0%,${adjustColor(skill.color, -20)} 100%)`,
              boxShadow: index === activeIndex
                ? `0 0 20px ${skill.color}80,0 0 40px ${skill.color}40,0 4px 12px rgba(0,0,0,0.4),inset 0 1px 0 0 rgba(255,255,255,0.2)`
                : '0 2px 8px rgba(0,0,0,0.3)',
              transform: index === activeIndex ? 'scale(1.15)' : 'scale(1)', cursor: 'pointer'
            }}
          >
            <span>{skill.icon}</span>
            <div className="absolute bottom-full mb-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap bg-black/90 text-white left-1/2 -translate-x-1/2 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
              {skill.name}
            </div>
          </button>
        ))}
      </nav>

      <div className="fixed left-1/2 -translate-x-1/2 px-3 py-1 rounded-xl text-white/80 bg-black/50 z-[1001]"
        style={{ bottom: 80, opacity: isExiting ? undefined : 0,
          animation: isExiting ? 'fadeOut 0.5s ease-out forwards' : 'fadeIn 0.5s ease-out forwards 800ms',
          fontSize: '12px', letterSpacing: '0.5px', fontWeight: 400, textAlign: 'center' }}>
        Use arrow keys to control the skills carousel
      </div>

      <footer className="fixed left-1/2 -translate-x-1/2 z-50 text-center"
        style={{ bottom: 10, opacity: isExiting ? undefined : 0,
          animation: isExiting ? 'fadeOut 0.5s ease-out forwards' : 'fadeIn 0.5s ease-out forwards 1000ms' }}>
        <p className="text-[12px] text-white/50 m-0 mb-1">© 2025 - 2026 Vatsal Goyal. All rights reserved.</p>
        <p className="text-[10px] text-white/40 m-0">This website uses Strapi, managed by <a href="https://github.com/masterunix/gleck" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/60 transition-colors">Gleck</a>, my Personal AI Agent.</p>
      </footer>
    </main>
  );
}
