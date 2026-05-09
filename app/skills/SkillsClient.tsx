'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useAnimationFrame, animate, useTransform } from 'framer-motion';
import { adjustColor } from '@/lib/utils';
import Hexagon from '@/components/Hexagon';
import Link from 'next/link';

interface Skill {
  id: number;
  name: string;
  description: string;
  type?: 'skills_top' | 'skills_bottom' | 'career';
  category?: string;
  color: string;
  icon?: string;
  logo?: {
    url: string;
  };
  attachments?: Array<{
    id: number;
    label: string;
    file: {
      url: string;
    };
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
  delay: number;
  type: 'career' | 'top' | 'bottom';
  data: any;
}

export default function SkillsClient({ skills }: { skills: Skill[] }) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  const [activeIndex, setActiveIndex] = useState(0);
  const isNavigatingRef = useRef(false);
  const [isExiting, setIsExiting] = useState(false);

  const careerSkills = useMemo(() => skills.filter(s => !s.type || s.type === 'career'), [skills]);
  const topSkills = useMemo(() => skills.filter(s => s.type === 'skills_top'), [skills]);
  const bottomSkills = useMemo(() => skills.filter(s => s.type === 'skills_bottom'), [skills]);

  const topTechnologies = useMemo(() => topSkills.length > 0 ? topSkills : [
    { name: 'JavaScript', description: 'Web development', icon: '⚡', color: '#f7df1e' },
    { name: 'HTML/CSS', description: 'Frontend markup & styling', icon: '🎨', color: '#e34f26' },
    { name: 'Express.js', description: 'Node.js web framework', icon: '🚀', color: '#000000' },
    { name: 'Dart', description: 'Flutter development', icon: '🎯', color: '#0175c2' },
    { name: 'Nginx', description: 'Reverse proxy server', icon: '🌐', color: '#009639' }
  ], [topSkills]);
  
  const bottomTechnologies = useMemo(() => bottomSkills.length > 0 ? bottomSkills : [
    { name: 'Ubuntu Server', description: 'Server operating system', icon: '🐧', color: '#e95420' },
    { name: 'GraphQL', description: 'API query language', icon: '📊', color: '#e10098' },
    { name: 'Redis', description: 'In-memory data store', icon: '🔴', color: '#dc382d' },
    { name: 'Kubernetes', description: 'Container orchestration', icon: '☸️', color: '#326ce5' },
    { name: 'Jenkins', description: 'Automation server', icon: '🔧', color: '#d24939' }
  ], [bottomSkills]);

  // Layout math
  const layout = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const baseHexWidth = Math.floor(viewportWidth / 4.27);
    const hexWidth = baseHexWidth;
    const hexHeight = Math.floor(baseHexWidth * 1.1547);
    const gapPx = 20;
    const hexSpacingX = hexWidth + gapPx;
    const hexSpacingY = hexHeight * 0.75 + gapPx;

    const rows = 3;
    const cols = 14;
    const totalSkills = cols;

    const gridHeight = (rows - 1) * hexSpacingY + hexHeight;
    const startY = (viewportHeight - gridHeight) / 2;
    const setWidth = totalSkills * hexSpacingX;
    const totalWidth = setWidth * 3;

    return { hexWidth, hexHeight, hexSpacingX, hexSpacingY, startY, setWidth, totalWidth, rows, cols, totalSkills };
  }, [mounted, careerSkills.length]);

  const carouselOffset = useMotionValue(0);
  
  const wrappedX = useTransform(carouselOffset, (offset) => {
    if (!layout) return 0;
    const setW = layout.setWidth;
    let wrapped = ((offset % setW) + setW) % setW;
    return -wrapped;
  });

  useAnimationFrame((time, delta) => {
    if (!isNavigatingRef.current && layout) {
      const speed = 0.39 * (delta / 16);
      carouselOffset.set(carouselOffset.get() + speed);
    }
  });

  const navigateToSkill = useCallback((skillIndex: number) => {
    if (!layout) return;
    const viewportCenter = window.innerWidth / 2;
    const skillPosition = skillIndex * layout.hexSpacingX;
    
    const targetOffset = skillPosition + layout.setWidth - viewportCenter + (layout.hexSpacingX / 2);
    
    isNavigatingRef.current = true;
    
    animate(carouselOffset, targetOffset, {
      duration: 0.6,
      ease: "easeInOut",
      onComplete: () => {
        isNavigatingRef.current = false;
      }
    });
  }, [carouselOffset, layout]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const newIndex = (activeIndex - 1 + careerSkills.length) % careerSkills.length;
        setActiveIndex(newIndex);
        navigateToSkill(newIndex);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const newIndex = (activeIndex + 1) % careerSkills.length;
        setActiveIndex(newIndex);
        navigateToSkill(newIndex);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [careerSkills.length, activeIndex, navigateToSkill]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNavigateOut = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsExiting(true);
    setTimeout(() => {
      router.push('/');
    }, 800);
  }, [router]);

  if (!mounted || !layout) return null;

  const gridItems: GridItem[] = [];
  for (let setIndex = 0; setIndex < 3; setIndex++) {
    for (let row = 0; row < layout.rows; row++) {
      for (let col = 0; col < layout.cols; col++) {
        const offsetX = (row % 2 === 1) ? layout.hexSpacingX / 2 : 0;
        const x = (col * layout.hexSpacingX) + offsetX + (setIndex * layout.setWidth);
        const y = layout.startY + (row * layout.hexSpacingY);
        
        let type: 'career' | 'top' | 'bottom';
        let data: any;

        if (row === 1 && careerSkills.length > 0) {
          type = 'career';
          data = careerSkills[col % careerSkills.length];
        } else if (row === 0) {
          type = 'top';
          data = topTechnologies[col % topTechnologies.length];
        } else {
          type = 'bottom';
          data = bottomTechnologies[col % bottomTechnologies.length];
        }

        gridItems.push({
          id: `${setIndex}-${row}-${col}`,
          row,
          col,
          setIndex,
          x,
          y,
          delay: setIndex === 0 ? (col + row) * 0.05 : 0,
          type,
          data
        });
      }
    }
  }

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black">
      <div className="vignette" />

      <header 
        className={`fixed left-1/2 -translate-x-1/2 text-center z-[100] transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}
        style={{ top: '20px', animation: 'fadeIn 0.5s ease-out forwards 200ms', opacity: 0 }}
      >
        <h1 className="text-white text-3xl font-bold mb-2 tracking-wide drop-shadow-md whitespace-nowrap font-['Inter']">
          Experience and Skills
        </h1>
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-full px-4 py-1 text-sm inline-block">
          <a href="/" onClick={handleNavigateOut} className="text-white/80 hover:text-white transition-colors">
            ← Back to Home
          </a>
        </div>
      </header>

      <motion.div className="absolute inset-0" style={{ x: wrappedX }}>
        {gridItems.map((item) => (
          <Hexagon
            key={item.id}
            delay={item.delay}
            animateY={false}
            className={`absolute transition-all duration-300 hover:scale-105 hover:z-10 hover:brightness-110 ${isExiting ? 'opacity-0 scale-95 pointer-events-none' : ''}`}
            style={{
              left: `${item.x}px`,
              top: `${item.y}px`,
              width: `${layout.hexWidth}px`,
              height: `${layout.hexHeight}px`,
              transitionDelay: isExiting ? `${(item.col + item.row) * 30}ms` : '0ms'
            }}
          >
            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center gap-1.5 p-3 z-10 pointer-events-auto">
              {item.type === 'career' ? (
                <>
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg shrink-0"
                    style={{ background: `linear-gradient(135deg, ${item.data.color} 0%, ${adjustColor(item.data.color, -20)} 100%)` }}
                  >
                    {item.data.logo?.url ? (
                      <img 
                        src={`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${item.data.logo.url}`} 
                        alt={item.data.name} 
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      item.data.icon || '📦'
                    )}
                  </div>
                  <div className="text-[13px] font-bold text-white text-center mt-1 shrink-0">{item.data.name}</div>
                  <div className="text-[10px] text-white/90 text-center leading-[1.2] max-h-[40px] overflow-hidden shrink-0">{item.data.description}</div>
                  
                  {item.data.category && (
                    <div className="text-[9px] text-white/70 text-center leading-[1.3] max-w-[140px] uppercase shrink-0">
                      {item.data.category}
                    </div>
                  )}

                  {item.data.attachments && item.data.attachments.length > 0 && (
                    <div className="flex flex-col gap-[3px] mt-0.5 w-full items-center shrink-0">
                      {item.data.attachments.map((attachment: any, idx: number) => (
                        <button
                          key={idx}
                          className="bg-white/10 text-white border border-white/30 px-2 py-1 rounded text-[9px] cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px] hover:bg-white/20 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${attachment.file.url}`, '_blank');
                          }}
                        >
                          📎 {attachment.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div 
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-lg shrink-0"
                    style={{ background: `linear-gradient(135deg, ${item.data.color} 0%, ${adjustColor(item.data.color, -20)} 100%)` }}
                  >
                    {item.data.logo?.url ? (
                      <img 
                        src={`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${item.data.logo.url}`} 
                        alt={item.data.name} 
                        className="w-6 h-6 object-contain"
                      />
                    ) : (
                      item.data.icon || '⚡'
                    )}
                  </div>
                  <div className="text-[12px] font-bold text-white text-center mt-1 shrink-0">{item.data.name}</div>
                  <div className="text-[9px] text-white/70 text-center leading-[1.2] shrink-0">{item.data.description}</div>
                </>
              )}
            </div>
          </Hexagon>
        ))}
      </motion.div>

      <div 
        className={`fixed left-1/2 -translate-x-1/2 flex gap-2 rounded-full p-3 px-6 z-[1000] backdrop-blur-[20px] bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37),inset_0_1px_0_0_rgba(255,255,255,0.1)] transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}
        style={{ bottom: '125px', animation: 'fadeIn 0.5s ease-out forwards 600ms', opacity: 0 }}
      >
        {careerSkills.map((skill, index) => (
          <button
            key={skill.id}
            onClick={() => {
              setActiveIndex(index);
              navigateToSkill(index);
            }}
            className="group relative flex items-center justify-center w-8 h-8 rounded-lg text-white transition-all duration-300 cursor-pointer"
            style={{
              border: index === activeIndex ? '2px solid rgba(255,255,255,0.5)' : '2px solid rgba(255,255,255,0.2)',
              background: `linear-gradient(135deg, ${skill.color} 0%, ${adjustColor(skill.color, -20)} 100%)`,
              boxShadow: index === activeIndex 
                ? `0 0 20px ${skill.color}80, 0 0 40px ${skill.color}40, 0 4px 12px rgba(0,0,0,0.4)` 
                : '0 2px 8px rgba(0,0,0,0.3)',
              transform: index === activeIndex ? 'scale(1.15)' : 'scale(1)'
            }}
          >
            <span>{skill.icon}</span>
            <div className="absolute bottom-full mb-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 bg-black/90 text-white left-1/2 -translate-x-1/2">
              {skill.name}
            </div>
          </button>
        ))}
      </div>

      <div 
        className={`fixed left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-xl text-white/80 bg-black/50 z-[1001] tracking-wide transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}
        style={{ bottom: '80px', animation: 'fadeIn 0.5s ease-out forwards 800ms', opacity: 0 }}
      >
        Use arrow keys to control the skills carousel
      </div>

      <footer 
        className={`fixed left-1/2 -translate-x-1/2 z-50 text-center transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}
        style={{ bottom: '10px', animation: 'fadeIn 0.5s ease-out forwards 1000ms', opacity: 0 }}
      >
        <p className="text-[12px] text-white/50 m-0 mb-1">© 2025 - 2026 Vatsal Goyal. All rights reserved.</p>
        <p className="text-[10px] text-white/40 m-0">This website uses Strapi, managed by Gleck, my Personal AI Agent.</p>
      </footer>
    </main>
  );
}
