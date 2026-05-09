'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adjustColor } from '@/lib/utils';
import Hexagon from '@/components/Hexagon';

interface DSAPlatform {
  id: number;
  name: string;
  url: string;
  color: string;
  logoPath?: string;
  logo?: {
    url: string;
  };
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
  data: any;
}

export default function DSAClient({ platforms }: { platforms: DSAPlatform[] }) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  const dsaConcepts = useMemo(() => [
    { title: 'Arrays', icon: '📊', description: 'Linear data structures', color: '#3498db' },
    { title: 'Linked Lists', icon: '🔗', description: 'Dynamic data structures', color: '#9b59b6' },
    { title: 'Stacks', icon: '📚', description: 'LIFO data structure', color: '#e74c3c' },
    { title: 'Queues', icon: '🚶', description: 'FIFO data structure', color: '#f39c12' },
    { title: 'Trees', icon: '🌳', description: 'Hierarchical structures', color: '#27ae60' },
    { title: 'Graphs', icon: '🕸️', description: 'Network structures', color: '#2c3e50' },
    { title: 'Hashing', icon: '#️⃣', description: 'Key-value mapping', color: '#8e44ad' },
    { title: 'Sorting', icon: '🔢', description: 'Ordering algorithms', color: '#d35400' },
    { title: 'Searching', icon: '🔍', description: 'Finding algorithms', color: '#16a085' },
    { title: 'Dynamic Programming', icon: '🧮', description: 'Optimization technique', color: '#c0392b' }
  ], []);

  const layout = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const baseHexWidth = Math.floor(viewportWidth / 4.27);
    const hexHeight = Math.floor(baseHexWidth * 1.1547);
    const hexWidth = baseHexWidth;
    const gapPx = 20;
    const hexSpacingX = hexWidth + gapPx;
    const hexSpacingY = hexHeight * 0.75 + gapPx;

    const rows = 3;
    const evenRowWidth = (4 - 1) * hexSpacingX + hexWidth;
    const gridHeight = (rows - 1) * hexSpacingY + hexHeight;
    const startX = (viewportWidth - evenRowWidth) / 2 - hexSpacingX / 2;
    const startY = (viewportHeight - gridHeight) / 2;

    return { hexWidth, hexHeight, hexSpacingX, hexSpacingY, startX, startY, rows };
  }, [mounted]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNavigateOut = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsExiting(true);
    setTimeout(() => {
      router.push('/');
    }, 650);
  }, [router]);

  if (!mounted || !layout) return null;

  const gridItems: GridItem[] = [];
  for (let row = 0; row < layout.rows; row++) {
    const colsInRow = (row === 1) ? 4 : 5;
    
    for (let col = 0; col < colsInRow; col++) {
      const offsetX = (row % 2 === 1) ? layout.hexSpacingX / 2 : 0;
      const x = layout.startX + col * layout.hexSpacingX + offsetX;
      const y = layout.startY + row * layout.hexSpacingY;
      
      let type: 'platform' | 'concept';
      let data: any;

      if (row === 1) {
        type = 'platform';
        data = platforms[col];
        if (!data) continue;
      } else {
        type = 'concept';
        const conceptIndex = row === 0 ? col : (col + 5);
        data = dsaConcepts[conceptIndex];
      }

      gridItems.push({
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

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black">
      <div className="vignette" />

      <header 
        className={`fixed left-1/2 -translate-x-1/2 text-center z-[100] transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}
        style={{ top: '20px', animation: 'fadeIn 0.5s ease-out forwards 200ms', opacity: 0 }}
      >
        <h1 className="text-white text-3xl font-bold mb-2 tracking-wide drop-shadow-md whitespace-nowrap font-['Inter']">
          DSA Stats
        </h1>
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-full px-4 py-1 text-sm inline-block">
          <Link href="/" onClick={handleNavigateOut} className="text-white/80 hover:text-white transition-colors">
            ← Back to Home
          </Link>
        </div>
      </header>

      <div className="absolute inset-0">
        {gridItems.map((item) => (
          <Hexagon
            key={item.id}
            delay={item.delay}
            className={`absolute transition-all duration-300 hover:scale-[1.05] hover:z-10 hover:brightness-120 ${item.type === 'platform' ? 'cursor-pointer' : ''} ${isExiting ? 'opacity-0 scale-95 pointer-events-none' : ''}`}
            style={{
              left: `${item.x}px`,
              top: `${item.y}px`,
              width: `${layout.hexWidth}px`,
              height: `${layout.hexHeight}px`,
              transitionDelay: isExiting ? `${(item.col + item.row) * 50}ms` : '0ms'
            }}
            onClick={() => {
              if (item.type === 'platform') {
                window.open(item.data.url, '_blank');
              }
            }}
          >
            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center gap-1.5 p-3 z-10 pointer-events-auto">
              {item.type === 'platform' ? (
                <>
                  <div 
                    className="w-[50px] h-[50px] rounded-xl flex items-center justify-center shadow-lg shrink-0"
                    style={{ background: `linear-gradient(135deg, ${item.data.color} 0%, ${adjustColor(item.data.color, -20)} 100%)` }}
                  >
                    <img 
                      src={item.data.logo?.url ? `${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${item.data.logo.url}` : `/${item.data.logoPath}`}
                      alt={item.data.name}
                      className="w-[30px] h-[30px] object-contain"
                    />
                  </div>
                  <div className="text-[14px] font-bold text-white text-center mt-1 shrink-0">{item.data.name}</div>
                  <div className="text-[12px] text-white/90 font-semibold text-center shrink-0">DSA Languages</div>
                  <div className="text-[10px] text-white/80 text-center mb-1 shrink-0">Python, C, C++</div>
                  
                  <button 
                    className="bg-gradient-to-br from-[#4CAF50] to-[#45a049] text-white border-none px-3 py-1.5 rounded-md text-[10px] font-semibold cursor-pointer shadow-md transition-all duration-300 shrink-0 hover:brightness-110"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(item.data.url, '_blank');
                    }}
                  >
                    Visit Profile
                  </button>
                </>
              ) : (
                <>
                  <div 
                    className="w-[45px] h-[45px] rounded-xl flex items-center justify-center text-xl shadow-lg shrink-0"
                    style={{ background: `linear-gradient(135deg, ${item.data.color} 0%, ${adjustColor(item.data.color, -20)} 100%)` }}
                  >
                    {item.data.icon}
                  </div>
                  <div className="text-[13px] font-bold text-white text-center mt-1 shrink-0">{item.data.title}</div>
                  <div className="text-[9px] text-white/70 text-center leading-[1.2] shrink-0">{item.data.description}</div>
                </>
              )}
            </div>
          </Hexagon>
        ))}
      </div>

      <footer 
        className={`fixed left-1/2 -translate-x-1/2 z-50 text-center transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}
        style={{ bottom: '10px', animation: 'fadeIn 0.5s ease-out forwards 400ms', opacity: 0 }}
      >
        <p className="text-[12px] text-white/50 m-0 mb-1">© 2025 - 2026 Vatsal Goyal. All rights reserved.</p>
        <p className="text-[10px] text-white/40 m-0">This website uses Strapi, managed by Gleck, my Personal AI Agent.</p>
      </footer>
    </main>
  );
}
