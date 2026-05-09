'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMotionValue, useAnimationFrame, animate } from 'framer-motion';
import { technologies } from '@/lib/constants';
import { adjustColor } from '@/lib/utils';
import Hexagon from '@/components/Hexagon';

const STRAPI = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const ROWS = 3;
const COLS = 14;
const GAP = 20;

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

/** Hex dimensions derived from viewport width — matches the legacy projects-script.js */
function computeLayout(vw: number, vh: number) {
  const hexWidth  = Math.floor(vw / 4.27);
  const hexHeight = Math.floor(hexWidth * 1.1547);
  const hexSpacingX = hexWidth + GAP;
  const hexSpacingY = hexHeight * 0.75 + GAP;
  const gridHeight  = (ROWS - 1) * hexSpacingY + hexHeight;
  const startY      = (vh - gridHeight) / 2;
  const setWidth    = COLS * hexSpacingX;
  return { hexWidth, hexHeight, hexSpacingX, hexSpacingY, startY, setWidth };
}

export default function ProjectsClient({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [mounted, setMounted]     = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  // Monotonically growing offset; framer-motion moves it, RAF reads it
  const carouselOffset = useMotionValue(0);
  const isNavigatingRef = useRef(false);

  const layout = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return computeLayout(window.innerWidth, window.innerHeight);
  }, [mounted]); // recompute after mount so window is available

  useEffect(() => { setMounted(true); }, []);

  // Auto-scroll — speed matches legacy (0.39 px/frame @ 60fps)
  useAnimationFrame((_t, delta) => {
    if (!layout || isNavigatingRef.current) return;
    carouselOffset.set(carouselOffset.get() + 0.39 * (delta / 16));
  });

  // Jump carousel to center the selected project
  const navigateToProject = useCallback((index: number) => {
    if (!layout) return;
    const { hexSpacingX, setWidth } = layout;
    const target = index * hexSpacingX + setWidth - window.innerWidth / 2 + hexSpacingX / 2;
    isNavigatingRef.current = true;
    animate(carouselOffset, target, {
      duration: 0.6,
      ease: 'easeInOut',
      onComplete: () => { isNavigatingRef.current = false; },
    });
  }, [carouselOffset, layout]);

  // Arrow-key navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const next = (activeIndex - 1 + projects.length) % projects.length;
        setActiveIndex(next); navigateToProject(next);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const next = (activeIndex + 1) % projects.length;
        setActiveIndex(next); navigateToProject(next);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIndex, projects.length, navigateToProject]);

  // Exit animation then navigate
  const handleBack = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsExiting(true);
    const maxDelay = (COLS + ROWS) * 50;
    setTimeout(() => router.push('/'), maxDelay + 200);
  }, [router]);

  if (!mounted || !layout) return null;

  const { hexWidth, hexHeight, hexSpacingX, hexSpacingY, startY, setWidth } = layout;

  // Build items for 3 identical sets — gives the carousel enough runway
  const gridItems = [];
  for (let setIdx = 0; setIdx < 3; setIdx++) {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const rowOffsetX = row % 2 === 1 ? hexSpacingX / 2 : 0;
        // baseX starts at -hexSpacingX so col 0 is slightly off-screen left (matches legacy)
        const baseX = col * hexSpacingX + rowOffsetX - hexSpacingX;
        const x = baseX + setIdx * setWidth;
        const y = startY + row * hexSpacingY;
        const isCenter = row === 1;
        const data = isCenter
          ? projects[col % projects.length]
          : technologies[col % technologies.length];
        gridItems.push({ id: `${setIdx}-${row}-${col}`, row, col, setIdx, x, y, isCenter, data });
      }
    }
  }

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black">
      <div className="vignette" />

      {/* Header */}
      <header
        className={`fixed left-1/2 -translate-x-1/2 text-center z-[100] transition-opacity duration-500 ${isExiting ? 'opacity-0' : ''}`}
        style={{ top: 20, opacity: 0, animation: 'fadeIn 0.5s ease-out forwards 200ms' }}
      >
        <h1 className="text-white text-[32px] font-bold mb-2.5 tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] whitespace-nowrap" style={{ fontFamily: "'Inter', sans-serif" }}>
          My Projects &amp; Work
        </h1>

        {/* Back button — liquid glass pill matching legacy exactly */}
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

      {/* Carousel — each item is absolutely positioned, translateX driven by carouselOffset */}
      <div className="absolute inset-0">
        {gridItems.map(({ id, row, col, setIdx, x, y, isCenter, data }) => {
          // Per-frame position: the parent doesn't translate; instead each item's
          // left is static. The carousel scrolling is handled by a CSS variable
          // approach — we use a simple CSS animation class + direct style.
          // Actually we drive each item via the motion value in a useAnimationFrame.
          // For declarative, we pre-render with initial x and let the RAF update them.
          // NOTE: Items are rendered with fixed left positions. The carousel movement
          // is achieved by the CarouselItem wrapper below that reads carouselOffset.
          return (
            <CarouselItem
              key={id}
              setIdx={setIdx}
              row={row}
              col={col}
              baseX={x}
              y={y}
              hexWidth={hexWidth}
              hexHeight={hexHeight}
              setWidth={setWidth}
              hexSpacingX={hexSpacingX}
              isExiting={isExiting}
              carouselOffset={carouselOffset}
            >
              {isCenter ? (
                <ProjectContent project={data} />
              ) : (
                <TechContent tech={data} />
              )}
            </CarouselItem>
          );
        })}
      </div>

      {/* Navigation dots */}
      <div
        id="project-nav-dots"
        className={`fixed left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-[25px] px-6 py-3 z-[1000] transition-opacity duration-500 ${isExiting ? 'opacity-0' : ''}`}
        style={{
          bottom: 125,
          opacity: 0,
          animation: 'fadeIn 0.5s ease-out forwards 600ms',
          background: 'linear-gradient(135deg,rgba(255,255,255,0.1) 0%,rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: '0 8px 32px 0 rgba(0,0,0,0.37),inset 0 1px 0 0 rgba(255,255,255,0.1)',
        }}
      >
        {projects.map((project, index) => (
          <button
            key={project.id}
            onClick={() => { setActiveIndex(index); navigateToProject(index); }}
            title={project.title}
            className="relative flex items-center justify-center text-base transition-all duration-300"
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: index === activeIndex ? '2px solid rgba(255,255,255,0.5)' : '2px solid rgba(255,255,255,0.2)',
              background: `linear-gradient(135deg,${project.color} 0%,${adjustColor(project.color,-20)} 100%)`,
              boxShadow: index === activeIndex
                ? `0 0 20px ${project.color}80,0 4px 12px rgba(0,0,0,0.4)`
                : '0 2px 8px rgba(0,0,0,0.3)',
              transform: index === activeIndex ? 'scale(1.15)' : 'scale(1)',
              cursor: 'pointer',
            }}
          >
            <span>{project.icon}</span>
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap bg-black/90 text-white left-1/2 -translate-x-1/2 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
              {project.title}
            </div>
          </button>
        ))}
      </div>

      {/* Instructions */}
      <div
        className={`fixed left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-xl text-white/80 bg-black/50 z-[1001] transition-opacity duration-500 ${isExiting ? 'opacity-0' : ''}`}
        style={{ bottom: 80, opacity: 0, animation: 'fadeIn 0.5s ease-out forwards 800ms' }}
      >
        Use arrow keys to control the projects carousel
      </div>

      {/* Footer */}
      <footer
        className={`fixed left-1/2 -translate-x-1/2 z-50 text-center transition-opacity duration-500 ${isExiting ? 'opacity-0' : ''}`}
        style={{ bottom: 10, opacity: 0, animation: 'fadeIn 0.5s ease-out forwards 1000ms' }}
      >
        <p className="text-[12px] text-white/50 m-0 mb-1">© 2025 - 2026 Vatsal Goyal. All rights reserved.</p>
        <p className="text-[10px] text-white/40 m-0">This website uses Strapi, managed by Gleck, my Personal AI Agent.</p>
      </footer>
    </main>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

/**
 * CarouselItem — renders one hexagon whose left position is updated every
 * animation frame to produce the seamless wrap-around effect.
 * This replicates the legacy per-hex RAF position update in pure React.
 */
function CarouselItem({
  setIdx, row, col, baseX, y, hexWidth, hexHeight, setWidth, hexSpacingX,
  isExiting, carouselOffset, children,
}: {
  setIdx: number; row: number; col: number;
  baseX: number; y: number;
  hexWidth: number; hexHeight: number;
  setWidth: number; hexSpacingX: number;
  isExiting: boolean;
  carouselOffset: ReturnType<typeof useMotionValue<number>>;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const totalWidth = setWidth * 3;

  useAnimationFrame(() => {
    if (!ref.current) return;
    const offset = carouselOffset.get();
    const x = baseX - offset;
    // Wrap so the item teleports seamlessly from right when it exits left
    let wrapped = ((x % totalWidth) + totalWidth) % totalWidth;
    // Shift left by one hexSpacingX so initial position matches legacy
    wrapped = wrapped - hexSpacingX;
    ref.current.style.left = `${wrapped}px`;
  });

  const entranceDelay = setIdx === 0 ? (col + row) * 50 : 0;

  return (
    <div
      ref={ref}
      className={`absolute transition-[filter,transform] duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:scale-105 hover:z-10 hover:brightness-110 ${isExiting ? 'opacity-0 !scale-95 pointer-events-none' : ''}`}
      style={{
        left: baseX,
        top: y,
        width: hexWidth,
        height: hexHeight,
        opacity: 0,
        willChange: 'transform, filter',
        animation: `fadeInUp 0.15s ease-out forwards ${entranceDelay}ms`,
        transitionDelay: isExiting ? `${(col + row) * 30}ms` : '0ms',
      }}
    >
      {/* Glass hex SVG */}
      <svg
        viewBox="0 0 190 212"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        <path
          d="M85.5 3.63965C91.3786 0.245625 98.6214 0.245625 104.5 3.63965L178.896 46.5928C184.775 49.9868 188.396 56.2589 188.396 63.0469V148.953C188.396 155.741 184.775 162.013 178.896 165.407L104.5 208.36C98.805 211.648 91.8296 211.751 86.0547 208.669L85.5 208.36L11.1035 165.407C5.22494 162.013 1.60356 155.741 1.60352 148.953V63.0469C1.60356 56.2589 5.22493 49.9868 11.1035 46.5928L85.5 3.63965Z"
          fill="rgba(255,255,255,0.05)"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
          style={{ transition: 'fill 400ms ease, stroke 400ms ease' }}
        />
      </svg>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-3 z-10">
        {children}
      </div>
    </div>
  );
}

function ProjectContent({ project }: { project: Project }) {
  const isPrivate = (s: string | null | undefined) =>
    !s || ['Coming Soon', 'In Development', 'Private', 'Available on request'].includes(s);

  return (
    <>
      <div
        className="w-[50px] h-[50px] rounded-xl flex items-center justify-center text-2xl shadow-lg shrink-0"
        style={{ background: `linear-gradient(135deg,${project.color} 0%,${adjustColor(project.color,-20)} 100%)` }}
      >
        {project.logo?.url
          ? <img src={`${STRAPI}${project.logo.url}`} alt={project.title} className="w-[30px] h-[30px] object-contain" />
          : project.icon || '📦'}
      </div>
      <div className="text-[13px] font-bold text-white text-center mt-1 shrink-0">{project.title}</div>
      <div className="text-[11px] text-white/90 text-center shrink-0">{project.tech}</div>
      <div className="text-[9px] text-white/70 text-center leading-[1.3] max-w-[140px] shrink-0">{project.description}</div>
      <div className="flex gap-1.5 mt-1 shrink-0">
        {!isPrivate(project.github) && (
          <a href={project.github!} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
            className="px-2.5 py-1 text-[9px] rounded-md bg-white/10 text-white font-semibold border border-white/20 hover:bg-white/20 transition-colors">
            GitHub
          </a>
        )}
        {project.visit && project.visit !== 'Will be deployed soon' && (
          <a href={project.visit.startsWith('/') ? project.visit : `https://${project.visit}`}
            target={project.visit.startsWith('/') ? '_self' : '_blank'} rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="px-2.5 py-1 text-[9px] rounded-md bg-white/10 text-white font-semibold border border-white/20 hover:bg-white/20 transition-colors">
            Visit
          </a>
        )}
      </div>
    </>
  );
}

function TechContent({ tech }: { tech: { title: string; tech: string; description: string; icon: string; color: string } }) {
  return (
    <>
      <div
        className="w-[45px] h-[45px] rounded-xl flex items-center justify-center text-xl shadow-lg shrink-0"
        style={{ background: `linear-gradient(135deg,${tech.color} 0%,${adjustColor(tech.color,-20)} 100%)` }}
      >
        {tech.icon}
      </div>
      <div className="text-[12px] font-bold text-white text-center mt-1 shrink-0">{tech.title}</div>
      <div className="text-[10px] text-white/80 text-center shrink-0">{tech.tech}</div>
      <div className="text-[9px] text-white/60 text-center leading-[1.2] shrink-0">{tech.description}</div>
    </>
  );
}
