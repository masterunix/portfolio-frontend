'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adjustColor } from '@/lib/utils';
import Hexagon from '@/components/Hexagon';
import { skipList } from '@/lib/constants';

interface Resume {
  id: number;
  domain: string;
  description: string;
  filename: string;
  color: string;
  icon: string;
  order: number;
  file?: {
    url: string;
    name: string;
  };
}

interface GridItem {
  id: string;
  row: number;
  col: number;
  x: number;
  y: number;
  delay: number;
  type: 'resume' | 'feedback' | 'empty';
  data?: any;
}

export default function ResumesClient({ resumes }: { resumes: Resume[] }) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  const feedbackData = useMemo(() => ({
    domain: 'Feedback',
    description: 'Share your thoughts',
    email: 'vatsalgoyal9999@gmail.com',
    color: '#00d2d3',
    icon: '✉️'
  }), []);

  const layout = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const baseHexWidth = Math.floor(viewportWidth / 5.69);
    const hexHeight = Math.floor(baseHexWidth * 1.1547);
    const hexWidth = baseHexWidth;
    const gapPx = 19;
    const hexSpacingX = hexWidth + gapPx;
    const hexSpacingY = hexHeight * 0.75 + gapPx;

    const rows = 4;
    const cols = 8;
    
    const gridWidth = (cols - 1) * hexSpacingX + hexWidth;
    const gridHeight = (rows - 1) * hexSpacingY + hexHeight;
    const startX = (viewportWidth - gridWidth) / 2;
    const startY = (viewportHeight - gridHeight) / 2;

    return { hexWidth, hexHeight, hexSpacingX, hexSpacingY, startX, startY, rows, cols };
  }, [mounted]);

  useEffect(() => {
    setMounted(true);
  }, []);

  /** Download a resume — can be called from either the tile or the inner button */
  const downloadResume = useCallback(async (resume: Resume) => {
    try {
      let fileUrl: string;
      let fileName: string;

      if (resume.file?.url) {
        const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
        fileUrl = `${strapiUrl}${resume.file.url}`;
        fileName = resume.file.name || resume.filename;
      } else {
        fileUrl = `/Assets/Resumes/${resume.filename}`;
        fileName = resume.filename;
      }

      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      const fallbackUrl = resume.file?.url
        ? `${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${resume.file.url}`
        : `/Assets/Resumes/${resume.filename}`;
      window.open(fallbackUrl, '_blank');
    }
  }, []);

  /** Open feedback email — can be called from either the tile or the inner button */
  const openFeedbackEmail = useCallback(() => {
    const emailBody = encodeURIComponent("I came from vatsalgoyal.me's resume section and I have feedback for you:\n\n");
    window.open(`mailto:${feedbackData.email}?subject=Portfolio Feedback&body=${emailBody}`, '_blank');
  }, [feedbackData.email]);

  // Wrappers for inner buttons that need stopPropagation
  const handleDownloadButton = useCallback((e: React.MouseEvent, resume: Resume) => {
    e.stopPropagation();
    downloadResume(resume);
  }, [downloadResume]);

  const handleFeedbackButton = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    openFeedbackEmail();
  }, [openFeedbackEmail]);


  const handleNavigateOut = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsExiting(true);
    setTimeout(() => {
      router.push('/');
    }, 650);
  }, [router]);

  if (!mounted || !layout) return null;

  const shouldSkip = (row: number, col: number) => {
    return skipList.some(([r, c]) => r === row && c === col);
  };

  const resumePositions: Record<string, number> = {
    '1-1': 0, '1-2': 1, '1-3': 2, '1-4': 3, '1-5': 4,
    '2-2': 5, '2-3': 6, '2-4': 7, '2-5': -1 
  };

  const gridItems: GridItem[] = [];
  for (let row = 0; row < layout.rows; row++) {
    for (let col = 0; col < layout.cols; col++) {
      if (shouldSkip(row, col)) continue;

      const offsetX = (row % 2 === 1) ? layout.hexSpacingX / 2 : 0;
      const x = layout.startX + col * layout.hexSpacingX + offsetX;
      const y = layout.startY + row * layout.hexSpacingY;
      const hexId = `${row}-${col}`;
      
      let type: 'resume' | 'feedback' | 'empty' = 'empty';
      let data = null;

      const resumeIndex = resumePositions[hexId];
      if (resumeIndex === -1) {
        type = 'feedback';
        data = feedbackData;
      } else if (resumeIndex !== undefined && resumeIndex < resumes.length) {
        type = 'resume';
        data = resumes[resumeIndex];
      }

      gridItems.push({
        id: hexId,
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
          Different Domains, Different Resumes
        </h1>
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-full px-4 py-1 text-sm inline-block">
          <Link href="/" onClick={handleNavigateOut} className="text-white/80 hover:text-white transition-colors">
            ← Back to Home
          </Link>
        </div>
      </header>

      <div className="absolute inset-0">
        {gridItems.map((item) => {
          const style = {
            position: 'absolute' as const,
            left: `${item.x}px`,
            top: `${item.y}px`,
            width: `${layout.hexWidth}px`,
            height: `${layout.hexHeight}px`,
            transitionDelay: isExiting ? `${(item.col + item.row) * 50}ms` : '0ms'
          };

          if (item.type === 'feedback') {
            return (
              <Hexagon
                key={item.id}
                delay={item.delay}
                className={`transition-all duration-300 hover:scale-[1.035] hover:z-10 hover:brightness-120 cursor-pointer ${isExiting ? 'opacity-0 scale-95 pointer-events-none' : ''}`}
                style={style}
                onClick={openFeedbackEmail}
              >
                <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center gap-1.5 p-3 z-10 pointer-events-auto">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg shrink-0"
                    style={{ background: `linear-gradient(135deg, ${item.data.color} 0%, ${adjustColor(item.data.color, -20)} 100%)` }}
                  >
                    {item.data.icon}
                  </div>
                  <div className="text-[13px] font-bold text-white text-center mt-1 shrink-0">{item.data.domain}</div>
                  <div className="text-[10px] text-white/80 text-center mb-1 shrink-0">{item.data.description}</div>
                  <button 
                    className="bg-gradient-to-br from-[#00d2d3] to-[#00a8a9] text-white border-none px-3.5 py-1.5 rounded-md text-[10px] font-semibold cursor-pointer shadow-md transition-all duration-300 mt-1 shrink-0 hover:brightness-110"
                    onClick={handleFeedbackButton}
                  >
                    Send Email
                  </button>
                </div>
              </Hexagon>
            );
          }

          if (item.type === 'resume') {
            return (
              <Hexagon
                key={item.id}
                delay={item.delay}
                className={`transition-all duration-300 hover:scale-[1.035] hover:z-10 hover:brightness-120 cursor-pointer ${isExiting ? 'opacity-0 scale-95 pointer-events-none' : ''}`}
                style={style}
                onClick={() => downloadResume(item.data)}
              >
                <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center gap-1.5 p-3 z-10 pointer-events-auto">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg shrink-0"
                    style={{ background: `linear-gradient(135deg, ${item.data.color} 0%, ${adjustColor(item.data.color, -20)} 100%)` }}
                  >
                    {item.data.icon}
                  </div>
                  <div className="text-[13px] font-bold text-white text-center mt-1 shrink-0">{item.data.domain}</div>
                  <div className="text-[10px] text-white/80 text-center mb-0.5 shrink-0">{item.data.description}</div>
                  <button 
                    className="bg-gradient-to-br from-[#4CAF50] to-[#45a049] text-white border-none px-3.5 py-1.5 rounded-md text-[10px] font-semibold cursor-pointer shadow-md transition-all duration-300 mt-1 shrink-0 hover:brightness-110"
                    onClick={(e) => handleDownloadButton(e, item.data)}
                  >
                    Download
                  </button>
                </div>
              </Hexagon>
            );
          }

          return (
            <Hexagon 
              key={item.id} 
              delay={item.delay} 
              style={style}
              className={`pointer-events-none opacity-50 ${isExiting ? 'opacity-0 scale-95' : ''}`} 
            />
          );
        })}
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
