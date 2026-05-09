'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { adjustColor } from '@/lib/utils';
import { computeHexLayout, calculateHexX, calculateHexY } from '@/lib/layoutUtils';
import { useCarousel } from '@/hooks/useCarousel';
import CarouselHex from '@/components/CarouselHex';
import CareerSkillHex from '@/components/CareerSkillHex';
import SkillTechHex from '@/components/SkillTechHex';

const GRID_CONFIG = {
  rows: 3,
  cols: 14, // Fixed columns like Projects page for consistent animations
  gap: 20
};

const NUM_SETS = 3; // Duplicate grid 3 times for seamless infinite scroll

// Fallback data for top/bottom rows if Strapi is down
const DEFAULT_TOP_SKILLS = [
  { name: 'JavaScript', description: 'Web development', icon: '⚡', color: '#f7df1e' },
  { name: 'HTML/CSS', description: 'Frontend markup & styling', icon: '🎨', color: '#e34f26' },
  { name: 'Express.js', description: 'Node.js web framework', icon: '🚀', color: '#000000' },
  { name: 'Dart', description: 'Flutter development', icon: '🎯', color: '#0175c2' },
  { name: 'Nginx', description: 'Reverse proxy server', icon: '🌐', color: '#009639' },
];

const DEFAULT_BOTTOM_SKILLS = [
  { name: 'Ubuntu Server', description: 'Server operating system', icon: '🐧', color: '#e95420' },
  { name: 'GraphQL', description: 'API query language', icon: '📊', color: '#e10098' },
  { name: 'Redis', description: 'In-memory data store', icon: '🔴', color: '#dc382d' },
  { name: 'Kubernetes', description: 'Container orchestration', icon: '☸️', color: '#326ce5' },
  { name: 'Jenkins', description: 'Automation server', icon: '🔧', color: '#d24939' },
];

interface Skill {
  id: number;
  name: string;
  description: string;
  type?: 'skills_top' | 'skills_bottom' | 'career';
  category?: string;
  color: string;
  icon?: string;
  logo?: { url: string };
  attachments?: Array<{
    id: number;
    label: string;
    file: { url: string };
  }>;
  order: number;
}

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

interface SkillsClientProps {
  skills: Skill[];
}

/**
 * SkillsClient — infinite horizontal carousel of career skills and technologies.
 * 
 * Architecture:
 * - 3 rows: top (tech skills), middle (career/experience), bottom (tech skills)
 * - Dynamic columns based on career skills count
 * - Auto-scrolls continuously, user can navigate with arrow keys or dots
 * - All layout calculations extracted to layoutUtils
 * - Carousel logic extracted to useCarousel hook
 * - Individual hex rendering delegated to CareerSkillHex/SkillTechHex components
 */
export default function SkillsClient({ skills }: SkillsClientProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  // Separate skills by type
  const careerSkills = useMemo(
    () => skills.filter(s => !s.type || s.type === 'career'),
    [skills]
  );
  
  const topSkills = useMemo(
    () => skills.filter(s => s.type === 'skills_top'),
    [skills]
  );
  
  const bottomSkills = useMemo(
    () => skills.filter(s => s.type === 'skills_bottom'),
    [skills]
  );

  // Use Strapi skills or fallback to defaults
  const topTech = topSkills.length > 0 ? topSkills : DEFAULT_TOP_SKILLS;
  const bottomTech = bottomSkills.length > 0 ? bottomSkills : DEFAULT_BOTTOM_SKILLS;

  // Compute layout based on viewport size (fixed 14 columns like Projects)
  const layout = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return computeHexLayout(window.innerWidth, window.innerHeight, GRID_CONFIG);
  }, [mounted]);

  // Carousel state and controls
  const { carouselOffset, navigateToItem } = useCarousel({
    itemCount: careerSkills.length,
    itemSpacing: layout?.hexSpacingX || 0,
    setWidth: layout?.setWidth || 0,
    autoScrollSpeed: 0.39,
    onIndexChange: setActiveIndex
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Handle navigation back to home with exit animation.
   */
  const handleBack = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsExiting(true);
    const maxDelay = (GRID_CONFIG.cols + GRID_CONFIG.rows) * 50;
    setTimeout(() => router.push('/'), maxDelay + 200);
  }, [router]);

  /**
   * Build grid items (3 sets for infinite scroll).
   * Fixed 14 columns like Projects page for consistent animations.
   * Memoized to prevent recalculation on every render.
   */
  const gridItems = useMemo((): GridItem[] => {
    if (!layout) return [];

    const items: GridItem[] = [];
    const { hexSpacingX, hexSpacingY, startY, setWidth } = layout;

    for (let setIndex = 0; setIndex < NUM_SETS; setIndex++) {
      for (let row = 0; row < GRID_CONFIG.rows; row++) {
        for (let col = 0; col < GRID_CONFIG.cols; col++) {
          let data: Skill | typeof DEFAULT_TOP_SKILLS[0];
          let isCareer = false;

          if (row === 1) {
            // Middle row - career skills
            data = careerSkills[col % careerSkills.length];
            isCareer = true;
          } else if (row === 0) {
            // Top row - tech skills
            data = topTech[col % topTech.length];
          } else {
            // Bottom row - tech skills
            data = bottomTech[col % bottomTech.length];
          }

          items.push({
            id: `${setIndex}-${row}-${col}`,
            row,
            col,
            setIndex,
            x: calculateHexX(row, col, hexSpacingX, setIndex, setWidth),
            y: calculateHexY(row, hexSpacingY, startY),
            isCareer,
            data
          });
        }
      }
    }

    return items;
  }, [layout, careerSkills, topTech, bottomTech]);

  // Early return AFTER all hooks
  if (!mounted || !layout) return null;

  const { hexWidth, hexHeight, hexSpacingX, setWidth } = layout;
  const totalWidth = setWidth * NUM_SETS;

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black">
      {/* Header */}
      <header
        className={`fixed left-1/2 -translate-x-1/2 text-center z-[100] ${isExiting ? '' : ''}`}
        style={{ 
          top: 20, 
          opacity: isExiting ? undefined : 0,
          animation: isExiting ? 'fadeOut 0.5s ease-out forwards' : 'fadeIn 0.5s ease-out forwards 200ms'
        }}
      >
        <h1
          className="text-white text-[32px] font-bold mb-2.5 tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] whitespace-nowrap"
          style={{ fontFamily: "'Inter', sans-serif", marginBottom: '12px' }}
        >
          Experience and Skills
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
            boxShadow: '0 8px 32px 0 rgba(0,0,0,0.37),inset 0 1px 0 0 rgba(255,255,255,0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg,rgba(255,255,255,0.15) 0%,rgba(255,255,255,0.08) 100%)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg,rgba(255,255,255,0.1) 0%,rgba(255,255,255,0.05) 100%)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          ← Back to Home
        </a>
      </header>

      {/* Carousel Grid */}
      <div className="absolute inset-0">
        {gridItems.map((item) => (
          <CarouselHex
            key={item.id}
            baseX={item.x}
            y={item.y}
            width={hexWidth}
            height={hexHeight}
            row={item.row}
            col={item.col}
            setIndex={item.setIndex}
            carouselOffset={carouselOffset}
            totalWidth={totalWidth}
            hexSpacing={hexSpacingX}
            isExiting={isExiting}
          >
            {item.isCareer ? (
              <CareerSkillHex skill={item.data as Skill} isExiting={isExiting} />
            ) : (
              <SkillTechHex tech={item.data} isExiting={isExiting} />
            )}
          </CarouselHex>
        ))}
      </div>

      {/* Navigation Dots */}
      <nav
        className={`fixed left-1/2 -translate-x-1/2 flex items-center rounded-[25px] z-[1000] ${isExiting ? '' : ''}`}
        style={{
          bottom: 125,
          gap: '8px',
          padding: '12px 24px',
          opacity: isExiting ? undefined : 0,
          animation: isExiting ? 'fadeOut 0.5s ease-out forwards' : 'fadeIn 0.5s ease-out forwards 600ms',
          background: 'linear-gradient(135deg,rgba(255,255,255,0.1) 0%,rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: '0 8px 32px 0 rgba(0,0,0,0.37),inset 0 1px 0 0 rgba(255,255,255,0.1),0 0 20px rgba(255,255,255,0.1)',
          justifyContent: 'center',
          alignItems: 'center'
        }}
        aria-label="Skills navigation"
      >
        {careerSkills.map((skill, index) => (
          <button
            key={skill.id}
            onClick={() => navigateToItem(index)}
            title={skill.name}
            aria-label={`Navigate to ${skill.name}`}
            aria-current={index === activeIndex ? 'true' : 'false'}
            className="relative flex items-center justify-center text-base transition-all duration-300 group"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: index === activeIndex ? '2px solid rgba(255,255,255,0.5)' : '2px solid rgba(255,255,255,0.2)',
              background: `linear-gradient(135deg,${skill.color} 0%,${adjustColor(skill.color, -20)} 100%)`,
              boxShadow: index === activeIndex
                ? `0 0 20px ${skill.color}80,0 0 40px ${skill.color}40,0 4px 12px rgba(0,0,0,0.4),inset 0 1px 0 0 rgba(255,255,255,0.2)`
                : '0 2px 8px rgba(0,0,0,0.3)',
              transform: index === activeIndex ? 'scale(1.15)' : 'scale(1)',
              cursor: 'pointer'
            }}
          >
            <span>{skill.icon}</span>
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap bg-black/90 text-white left-1/2 -translate-x-1/2 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
              {skill.name}
            </div>
          </button>
        ))}
      </nav>

      {/* Instructions */}
      <div
        className={`fixed left-1/2 -translate-x-1/2 px-3 py-1 rounded-xl text-white/80 bg-black/50 z-[1001] ${isExiting ? '' : ''}`}
        style={{ 
          bottom: 80, 
          opacity: isExiting ? undefined : 0,
          animation: isExiting ? 'fadeOut 0.5s ease-out forwards' : 'fadeIn 0.5s ease-out forwards 800ms',
          fontSize: '12px',
          letterSpacing: '0.5px',
          fontWeight: 400,
          textAlign: 'center'
        }}
      >
        Use arrow keys to control the skills carousel
      </div>

      {/* Footer */}
      <footer
        className={`fixed left-1/2 -translate-x-1/2 z-50 text-center ${isExiting ? '' : ''}`}
        style={{ 
          bottom: 10, 
          opacity: isExiting ? undefined : 0,
          animation: isExiting ? 'fadeOut 0.5s ease-out forwards' : 'fadeIn 0.5s ease-out forwards 1000ms'
        }}
      >
        <p className="text-[12px] text-white/50 m-0 mb-1">© 2025 - 2026 Vatsal Goyal. All rights reserved.</p>
        <p className="text-[10px] text-white/40 m-0">This website uses Strapi, managed by Gleck, my Personal AI Agent.</p>
      </footer>
    </main>
  );
}
