'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { adjustColor } from '@/lib/utils';
import { computeHexLayout, calculateHexX, calculateHexY } from '@/lib/layoutUtils';
import { useCarousel } from '@/hooks/useCarousel';
import CarouselHex from '@/components/CarouselHex';
import ProjectHex from '@/components/ProjectHex';
import TechHex from '@/components/TechHex';

const GRID_CONFIG = {
  rows: 3,
  cols: 14,
  gap: 20
};

const NUM_SETS = 3; // Duplicate grid 3 times for seamless infinite scroll

interface Project {
  id: number;
  title: string;
  tech: string;
  description: string;
  icon?: string;
  logo?: { url: string };
  color: string;
  github?: string | null;
  visit?: string | null;
  order: number;
}

interface Skill {
  id: number;
  name: string;
  description: string;
  icon?: string;
  color: string;
  category?: string;
  type?: string;
  order: number;
}

interface GridItem {
  id: string;
  row: number;
  col: number;
  setIndex: number;
  x: number;
  y: number;
  isProject: boolean;
  data: Project | Skill;
}

interface ProjectsClientProps {
  projects: Project[];
  skills: Skill[];  // Single skills array used for BOTH top and bottom rows
}

/**
 * ProjectsClient — infinite horizontal carousel of projects and technologies.
 * 
 * Architecture:
 * - 3 rows: top (skills), middle (projects), bottom (skills - SAME as top)
 * - 14 columns per set, duplicated 3 times for seamless wrapping
 * - Auto-scrolls continuously, user can navigate with arrow keys or dots
 * - All layout calculations extracted to layoutUtils
 * - Carousel logic extracted to useCarousel hook
 * - Individual hex rendering delegated to ProjectHex/TechHex components
 */
export default function ProjectsClient({ projects, skills }: ProjectsClientProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  // Compute layout based on viewport size
  const layout = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return computeHexLayout(window.innerWidth, window.innerHeight, GRID_CONFIG);
  }, [mounted]);

  // Carousel state and controls
  const { carouselOffset, navigateToItem } = useCarousel({
    itemCount: projects.length,
    itemSpacing: layout?.hexSpacingX || 0,
    setWidth: layout?.setWidth || 0,
    autoScrollSpeed: 0.39,
    onIndexChange: setActiveIndex
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Exit animation then navigate home
  const handleBack = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsExiting(true);
    const maxDelay = (GRID_CONFIG.cols + GRID_CONFIG.rows) * 50;
    setTimeout(() => router.push('/'), maxDelay + 200);
  }, [router]);

  // Build grid items (3 sets for infinite scroll)
  const gridItems = useMemo((): GridItem[] => {
    if (!layout) return [];

    const items: GridItem[] = [];
    const { hexSpacingX, hexSpacingY, startY, setWidth } = layout;

    for (let setIndex = 0; setIndex < NUM_SETS; setIndex++) {
      for (let row = 0; row < GRID_CONFIG.rows; row++) {
        for (let col = 0; col < GRID_CONFIG.cols; col++) {
          let data: Project | Skill;
          let isProject = false;

          if (row === 1) {
            // Middle row - projects
            data = projects[col % projects.length];
            isProject = true;
          } else {
            // Top row (row === 0) and Bottom row (row === 2) - SAME skills array
            data = skills[col % skills.length];
          }

          items.push({
            id: `${setIndex}-${row}-${col}`,
            row,
            col,
            setIndex,
            x: calculateHexX(row, col, hexSpacingX, setIndex, setWidth),
            y: calculateHexY(row, hexSpacingY, startY),
            isProject,
            data
          });
        }
      }
    }

    return items;
  }, [layout, projects, skills]);

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
          className="text-white text-[32px] font-bold tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] whitespace-nowrap"
          style={{ fontFamily: "'Inter', sans-serif", marginBottom: '12px' }}
        >
          My Projects &amp; Work
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
            {item.isProject ? (
              <ProjectHex project={item.data as Project} isExiting={isExiting} />
            ) : (
              <TechHex skill={item.data as Skill} isExiting={isExiting} />
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
        aria-label="Project navigation"
      >
        {projects.map((project, index) => (
          <button
            key={project.id}
            onClick={() => navigateToItem(index)}
            title={project.title}
            aria-label={`Navigate to ${project.title}`}
            aria-current={index === activeIndex ? 'true' : 'false'}
            className="relative flex items-center justify-center text-base transition-all duration-300 group"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: index === activeIndex ? '2px solid rgba(255,255,255,0.5)' : '2px solid rgba(255,255,255,0.2)',
              background: `linear-gradient(135deg,${project.color} 0%,${adjustColor(project.color, -20)} 100%)`,
              boxShadow: index === activeIndex
                ? `0 0 20px ${project.color}80,0 0 40px ${project.color}40,0 4px 12px rgba(0,0,0,0.4),inset 0 1px 0 0 rgba(255,255,255,0.2)`
                : '0 2px 8px rgba(0,0,0,0.3)',
              transform: index === activeIndex ? 'scale(1.15)' : 'scale(1)',
              cursor: 'pointer'
            }}
          >
            <span>{project.icon}</span>
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap bg-black/90 text-white left-1/2 -translate-x-1/2 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
              {project.title}
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
        Use arrow keys to control the projects carousel
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
