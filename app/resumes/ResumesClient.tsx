'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useIsMobile } from '@/hooks/useIsMobile';
import { useViewportSize } from '@/hooks/useViewportSize';
import { useMounted } from '@/hooks/useMounted';
import { computeHexLayout, calculateHexX, calculateHexY } from '@/lib/layoutUtils';
import Hexagon from '@/components/Hexagon';
import ResumeHex from '@/components/ResumeHex';
import Footer from '@/components/Footer';
import type { Resume } from '@/types';

const GRID_CONFIG = { rows: 4, cols: 8, gap: 20, scaleDivisor: 5.69 };

interface GridItem {
  id: string;
  row: number;
  col: number;
  x: number;
  y: number;
  data: Resume | null;
}

interface ResumesClientProps {
  resumes: Resume[];
}

export default function ResumesClient({ resumes = [] }: ResumesClientProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const mounted = useMounted();
  const [isExiting, setIsExiting] = useState(false);

  const viewport = useViewportSize();
  const layout = useMemo(() => {
    if (!viewport) return null;
    return computeHexLayout(viewport.width, viewport.height, GRID_CONFIG);
  }, [viewport]);

  const handleBack = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsExiting(true);
    const maxDelay = (GRID_CONFIG.cols + GRID_CONFIG.rows) * 50;
    setTimeout(() => router.push('/'), maxDelay + 200);
  }, [router]);

  const shouldSkip = useCallback((row: number, col: number) => {
    const skipList = [[0, 0], [2, 0], [0, 7], [2, 7], [1, 7], [3, 7]];
    return skipList.some(([r, c]) => r === row && c === col);
  }, []);

  const resumePositions = useMemo(() => {
    return [
      [1, 1], [1, 2], [1, 3], [1, 4], [1, 5],
      [2, 2], [2, 3], [2, 4], [2, 5],
      [3, 2], [3, 3], [3, 4] // Added [3, 4] back for resumes since feedback is gone
    ];
  }, []);

  const gridItems = useMemo((): GridItem[] => {
    if (!layout) return [];
    const items: GridItem[] = [];
    const { hexSpacingX, hexSpacingY, startY, hexWidth } = layout;

    let resumeIndex = 0;

    for (let row = 0; row < GRID_CONFIG.rows; row++) {
      for (let col = 0; col < GRID_CONFIG.cols; col++) {
        if (shouldSkip(row, col)) continue;

        let data: Resume | null = null;

        const isResumePos = resumePositions.some(([r, c]) => r === row && c === col);

        if (isResumePos && resumeIndex < resumes.length) {
          data = resumes[resumeIndex];
          resumeIndex++;
        }

        items.push({
          id: `${row}-${col}`, row, col,
          x: calculateHexX(row, col, hexSpacingX, 0, layout.setWidth),
          y: calculateHexY(row, hexSpacingY, startY),
          data
        });
      }
    }
    
    // Centering logic: Match the original gridWidth calculation
    const windowWidth = viewport?.width ?? 1200;
    const gridContentWidth = (GRID_CONFIG.cols - 1) * hexSpacingX + hexWidth;
    const shiftX = (windowWidth - gridContentWidth) / 2;

    items.forEach(item => { item.x += shiftX; });

    return items;
  }, [layout, resumes, shouldSkip, resumePositions, viewport]);

  /** Downloads the resume's file (same origin, so `download` names it), or opens its link */
  const openResume = (resume: Resume) => {
    if (resume.file) {
      const a = document.createElement('a');
      a.href = resume.file.url;
      a.download = resume.filename ?? resume.file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else if (resume.link) {
      if (/^(mailto|tel):/i.test(resume.link)) window.location.assign(resume.link);
      else window.open(resume.link, '_blank', 'noopener,noreferrer');
    }
  };

  if (!mounted) return null;

  // ─── Mobile Layout ───────────────────────────────────────────────────────

  if (isMobile) {
    return (
      <main className="relative w-full min-h-screen">
        <div className="mobile-header">
          <Link href="/" onClick={handleBack} className="mobile-back">← Back</Link>
          <h1 className="text-white font-bold text-lg mt-3" style={{ fontFamily: "'Inter', sans-serif" }}>
            Explore Resumes
          </h1>
        </div>

        <div className="mobile-scroll">
          {resumes.map((resume, index) => (
            <div
              key={resume.id}
              className="mobile-glass-card"
              onClick={() => openResume(resume)}
              style={{
                animation: `fadeInUp 0.4s ease-out forwards ${index * 60}ms`, opacity: 0,
                cursor: resume.file || resume.link ? 'pointer' : 'default'
              }}
            >
              <div
                className="mobile-icon"
                style={{ backgroundColor: resume.color }}
              >
                <span className="text-xl">{resume.icon}</span>
              </div>
              <div className="mobile-card-text">
                <div className="mobile-card-title">{resume.domain}</div>
                <div className="mobile-card-desc">{resume.description}</div>
              </div>
              {resume.file ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 opacity-50">
                  <path d="M10 3V14M10 14L6 10M10 14L14 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 17H16" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              ) : resume.link ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 opacity-40">
                  <path d="M7.5 4L13.5 10L7.5 16" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : null}
            </div>
          ))}
        </div>

        <footer className="w-full text-center py-6 mt-4 opacity-70">
          <p className="text-[11px] text-white/50 m-0">© 2025 - 2026 Vatsal Goyal. All rights reserved.</p>
        </footer>
      </main>
    );
  }

  // ─── Desktop Layout ──────────────────────────────────────────────────────

  if (!layout) return null;

  const { hexWidth, hexHeight } = layout;

  return (
    <main className="relative w-full h-screen overflow-hidden">
      <header
        className={`fixed left-1/2 -translate-x-1/2 text-center z-[100] transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}
        style={{ top: '20px', animation: isExiting ? undefined : 'fadeIn 0.5s ease-out forwards 200ms', opacity: 0 }}
      >
        <h1 className="text-white text-4xl font-bold tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] whitespace-nowrap"
          style={{ fontFamily: "'Inter', sans-serif", marginBottom: '12px' }}>
          Explore Resumes
        </h1>
        <div className="back-button-glass">
          <Link href="/" onClick={handleBack}>← Back to Home</Link>
        </div>
      </header>

      <div className="absolute inset-0">
        {gridItems.map((item) => {
          const delay = (item.col + item.row) * 0.05;
          return (
            <Hexagon
              key={item.id} isExiting={isExiting} delay={delay}
              style={{ position: 'absolute', left: item.x, top: item.y, width: hexWidth, height: hexHeight }}
            >
              {item.data ? (
                <ResumeHex resume={item.data as Resume} onOpen={() => openResume(item.data as Resume)} />
              ) : null}
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
