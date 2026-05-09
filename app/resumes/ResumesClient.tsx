/**
 * ResumesClient.tsx — Resumes page with hex grid (desktop)
 * and scrollable card list (mobile).
 *
 * Desktop: 4×8 static honeycomb grid with resume tiles and feedback tile.
 * Mobile:  Vertically scrollable glass cards with download buttons.
 */
'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/useIsMobile';
import { adjustColor } from '@/lib/utils';
import { skipList } from '@/lib/constants';
import Hexagon from '@/components/Hexagon';
import ResumeHex from '@/components/ResumeHex';
import FeedbackHex from '@/components/FeedbackHex';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Resume {
  id: number;
  domain: string;
  description: string;
  filename: string;
  color: string;
  icon: string;
  order: number;
  file?: { url: string; name: string; };
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

// ─── Component ───────────────────────────────────────────────────────────────

export default function ResumesClient({ resumes }: { resumes: Resume[] }) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);
  const isMobile = useIsMobile();
  
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string>('');

  const feedbackData = useMemo(() => ({
    domain: 'Feedback',
    description: 'Share your thoughts',
    email: 'vatsalgoyal9999@gmail.com',
    color: '#00d2d3',
    icon: '✉️'
  }), []);

  const layout = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const baseHexWidth = Math.floor(vw / 5.69);
    const hexHeight = Math.floor(baseHexWidth * 1.1547);
    const hexWidth = baseHexWidth;
    const gapPx = 19;
    const hexSpacingX = hexWidth + gapPx;
    const hexSpacingY = hexHeight * 0.75 + gapPx;
    const rows = 4;
    const cols = 8;
    const gridWidth = (cols - 1) * hexSpacingX + hexWidth;
    const gridHeight = (rows - 1) * hexSpacingY + hexHeight;
    const startX = (vw - gridWidth) / 2;
    const startY = (vh - gridHeight) / 2;
    return { hexWidth, hexHeight, hexSpacingX, hexSpacingY, startX, startY, rows, cols };
  }, [mounted]);

  useEffect(() => { setMounted(true); }, []);

  /** Download a resume file via blob URL */
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
      const blobUrl = URL.createObjectURL(blob);
      setDownloadUrl(blobUrl);
      setDownloadFilename(fileName);
      setTimeout(() => {
        downloadLinkRef.current?.click();
        setTimeout(() => { URL.revokeObjectURL(blobUrl); setDownloadUrl(null); }, 100);
      }, 0);
    } catch (error) {
      console.error('Download failed:', error);
      const fallbackUrl = resume.file?.url
        ? `${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${resume.file.url}`
        : `/Assets/Resumes/${resume.filename}`;
      window.open(fallbackUrl, '_blank');
    }
  }, []);

  const openFeedbackEmail = useCallback(() => {
    const emailBody = encodeURIComponent("I came from vatsalgoyal.me's resume section and I have feedback for you:\n\n");
    window.open(`mailto:${feedbackData.email}?subject=Portfolio Feedback&body=${emailBody}`, '_blank');
  }, [feedbackData.email]);

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
    if (isMobile) { router.push('/'); return; }
    setIsExiting(true);
    setTimeout(() => { router.push('/'); }, 650);
  }, [router, isMobile]);

  const shouldSkip = useCallback((row: number, col: number) => {
    return skipList.some(([r, c]) => r === row && c === col);
  }, []);

  const resumePositions: Record<string, number> = useMemo(() => ({
    '1-1': 0, '1-2': 1, '1-3': 2, '1-4': 3, '1-5': 4,
    '2-2': 5, '2-3': 6, '2-4': 7, '2-5': -1
  }), []);

  const gridItems = useMemo((): GridItem[] => {
    if (!layout) return [];
    const items: GridItem[] = [];
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
        if (resumeIndex === -1) { type = 'feedback'; data = feedbackData; }
        else if (resumeIndex !== undefined && resumeIndex < resumes.length) { type = 'resume'; data = resumes[resumeIndex]; }
        items.push({ id: hexId, row, col, x, y, delay: (col + row) * 0.05, type, data });
      }
    }
    return items;
  }, [layout, resumes, feedbackData, shouldSkip, resumePositions]);

  if (!mounted) return null;

  // ─── Mobile Layout ───────────────────────────────────────────────────────

  if (isMobile) {
    return (
      <main className="relative w-full min-h-screen">
        {downloadUrl && (
          <a ref={downloadLinkRef} href={downloadUrl} download={downloadFilename} className="hidden" aria-hidden="true" />
        )}

        <div className="mobile-header">
          <a href="/" onClick={handleNavigateOut} className="mobile-back">← Back</a>
          <h1 className="text-white font-bold text-lg mt-3" style={{ fontFamily: "'Inter', sans-serif" }}>
            Resumes
          </h1>
        </div>

        <div className="mobile-scroll">
          {resumes.map((resume, index) => (
            <div
              key={resume.id}
              className="mobile-glass-card"
              onClick={() => downloadResume(resume)}
              style={{ animation: `fadeInUp 0.4s ease-out forwards ${index * 60}ms`, opacity: 0 }}
            >
              <div
                className="mobile-icon"
                style={{ background: `linear-gradient(135deg, ${resume.color} 0%, ${adjustColor(resume.color, -20)} 100%)` }}
              >
                <span className="text-xl">{resume.icon}</span>
              </div>
              <div className="mobile-card-text">
                <div className="mobile-card-title">{resume.domain}</div>
                <div className="mobile-card-desc">{resume.description}</div>
              </div>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 opacity-50">
                <path d="M10 3V14M10 14L6 10M10 14L14 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 17H16" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          ))}

          {/* Feedback Card */}
          <div
            className="mobile-glass-card"
            onClick={openFeedbackEmail}
            style={{ animation: `fadeInUp 0.4s ease-out forwards ${resumes.length * 60}ms`, opacity: 0 }}
          >
            <div
              className="mobile-icon"
              style={{ background: `linear-gradient(135deg, ${feedbackData.color} 0%, ${adjustColor(feedbackData.color, -20)} 100%)` }}
            >
              <span className="text-xl">{feedbackData.icon}</span>
            </div>
            <div className="mobile-card-text">
              <div className="mobile-card-title">{feedbackData.domain}</div>
              <div className="mobile-card-desc">{feedbackData.description}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 opacity-40">
              <path d="M6 3L11 8L6 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <footer className="w-full text-center py-6 mt-4 opacity-70">
          <p className="text-[11px] text-white/50 m-0">© 2025 - 2026 Vatsal Goyal. All rights reserved.</p>
        </footer>
      </main>
    );
  }

  // ─── Desktop Layout ──────────────────────────────────────────────────────

  if (!layout) return null;

  return (
    <main className="relative w-full h-screen overflow-hidden">
      {downloadUrl && (
        <a ref={downloadLinkRef} href={downloadUrl} download={downloadFilename} className="hidden" aria-hidden="true" />
      )}

      <header
        className={`fixed left-1/2 -translate-x-1/2 text-center z-[100] transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}
        style={{ top: '20px', animation: isExiting ? undefined : 'fadeIn 0.5s ease-out forwards 200ms', opacity: 0 }}
      >
        <h1 className="text-white text-4xl font-bold tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] whitespace-nowrap"
          style={{ fontFamily: "'Inter', sans-serif", marginBottom: '12px' }}>
          Resumes
        </h1>
        <div className="back-button-glass"><a href="/" onClick={handleNavigateOut}>← Back to Home</a></div>
      </header>

      <div className="absolute inset-0">
        {gridItems.map((item) => {
          const style = {
            position: 'absolute' as const,
            left: `${item.x}px`, top: `${item.y}px`,
            width: `${layout.hexWidth}px`, height: `${layout.hexHeight}px`
          };
          const commonClassName = 'transition-all duration-300 cursor-pointer';

          if (item.type === 'feedback') {
            return (
              <Hexagon key={item.id} delay={item.delay} isExiting={isExiting}
                className={commonClassName} style={style} onClick={openFeedbackEmail}>
                <FeedbackHex feedbackData={item.data} onSendEmail={handleFeedbackButton} />
              </Hexagon>
            );
          }
          if (item.type === 'resume') {
            return (
              <Hexagon key={item.id} delay={item.delay} isExiting={isExiting}
                className={commonClassName} style={style} onClick={() => downloadResume(item.data)}>
                <ResumeHex resume={item.data} onDownload={(e) => handleDownloadButton(e, item.data)} />
              </Hexagon>
            );
          }
          return (
            <Hexagon key={item.id} delay={item.delay} isExiting={isExiting}
              style={style} className="pointer-events-none opacity-50" />
          );
        })}
      </div>

      <footer
        className={`fixed left-1/2 -translate-x-1/2 z-50 text-center transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}
        style={{ bottom: '10px', opacity: 0, animation: 'fadeIn 0.5s ease-out forwards', animationDelay: '400ms' }}>
        <p className="text-[12px] text-white/50 m-0 mb-1">© 2025 - 2026 Vatsal Goyal. All rights reserved.</p>
        <p className="text-[10px] text-white/40 m-0">This website uses Strapi, managed by <a href="https://github.com/masterunix/gleck" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/60 transition-colors">Gleck</a>, my Personal AI Agent.</p>
      </footer>
    </main>
  );
}
