'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Hexagon from '@/components/Hexagon';
import ResumeHex from '@/components/ResumeHex';
import FeedbackHex from '@/components/FeedbackHex';
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

/**
 * ResumesClient — displays a grid of downloadable resumes organized by domain.
 * 
 * Architecture:
 * - Static honeycomb grid layout (4 rows × 8 cols)
 * - Resume tiles with download functionality
 * - Feedback tile for user communication
 * - Empty tiles for visual balance
 * - No DOM manipulation - uses hidden React link for downloads
 */
export default function ResumesClient({ resumes }: { resumes: Resume[] }) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);
  
  // Download state - React way, no DOM manipulation
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

  /**
   * Download a resume file without DOM manipulation.
   * Uses React state to trigger a hidden <a> element.
   */
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

      // Set state to trigger download via hidden React link
      setDownloadUrl(blobUrl);
      setDownloadFilename(fileName);
      
      // Trigger click on next render
      setTimeout(() => {
        downloadLinkRef.current?.click();
        // Cleanup blob URL after download
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
          setDownloadUrl(null);
        }, 100);
      }, 0);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      const fallbackUrl = resume.file?.url
        ? `${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${resume.file.url}`
        : `/Assets/Resumes/${resume.filename}`;
      window.open(fallbackUrl, '_blank');
    }
  }, []);

  /**
   * Open feedback email in default mail client.
   */
  const openFeedbackEmail = useCallback(() => {
    const emailBody = encodeURIComponent("I came from vatsalgoyal.me's resume section and I have feedback for you:\n\n");
    window.open(`mailto:${feedbackData.email}?subject=Portfolio Feedback&body=${emailBody}`, '_blank');
  }, [feedbackData.email]);

  /**
   * Handle download button click with event propagation stop.
   */
  const handleDownloadButton = useCallback((e: React.MouseEvent, resume: Resume) => {
    e.stopPropagation();
    downloadResume(resume);
  }, [downloadResume]);

  /**
   * Handle feedback button click with event propagation stop.
   */
  const handleFeedbackButton = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    openFeedbackEmail();
  }, [openFeedbackEmail]);

  /**
   * Handle navigation back to home with exit animation.
   */
  const handleNavigateOut = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsExiting(true);
    setTimeout(() => {
      router.push('/');
    }, 650);
  }, [router]);

  /**
   * Check if a grid position should be skipped (empty space).
   */
  const shouldSkip = useCallback((row: number, col: number) => {
    return skipList.some(([r, c]) => r === row && c === col);
  }, []);

  /**
   * Map of grid positions to resume indices.
   * Position '2-5' is reserved for feedback tile (-1).
   */
  const resumePositions: Record<string, number> = useMemo(() => ({
    '1-1': 0, '1-2': 1, '1-3': 2, '1-4': 3, '1-5': 4,
    '2-2': 5, '2-3': 6, '2-4': 7, '2-5': -1 
  }), []);

  /**
   * Build grid items with positions and types.
   * Memoized to prevent recalculation on every render.
   */
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
        if (resumeIndex === -1) {
          type = 'feedback';
          data = feedbackData;
        } else if (resumeIndex !== undefined && resumeIndex < resumes.length) {
          type = 'resume';
          data = resumes[resumeIndex];
        }

        items.push({
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
    
    return items;
  }, [layout, resumes, feedbackData, shouldSkip, resumePositions]);

  // Early return AFTER all hooks
  if (!mounted || !layout) return null;

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black">
      {/* Hidden download link - React way, no DOM manipulation */}
      {downloadUrl && (
        <a
          ref={downloadLinkRef}
          href={downloadUrl}
          download={downloadFilename}
          className="hidden"
          aria-hidden="true"
        />
      )}

      <header
        className={`fixed left-1/2 -translate-x-1/2 text-center z-[100] transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}
        style={{ 
          top: '20px', 
          animation: isExiting ? undefined : 'fadeIn 0.5s ease-out forwards 200ms',
          opacity: 0
        }}
      >
        <h1
          className="text-white text-4xl font-bold tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] whitespace-nowrap"
          style={{ fontFamily: "'Inter', sans-serif", marginBottom: '12px' }}
        >
          Different Domains, Different Resumes
        </h1>

        <div className="back-button-glass">
          <a href="/" onClick={handleNavigateOut}>
            ← Back to Home
          </a>
        </div>
      </header>

      <div className="absolute inset-0">
        {gridItems.map((item) => {
          const style = {
            position: 'absolute' as const,
            left: `${item.x}px`,
            top: `${item.y}px`,
            width: `${layout.hexWidth}px`,
            height: `${layout.hexHeight}px`
          };

          const commonClassName = `transition-all duration-300 hover:scale-[1.05] hover:z-10 hover:brightness-120 cursor-pointer`;

          // Feedback tile
          if (item.type === 'feedback') {
            return (
              <Hexagon
                key={item.id}
                delay={item.delay}
                isExiting={isExiting}
                className={commonClassName}
                style={style}
                onClick={openFeedbackEmail}
              >
                <FeedbackHex 
                  feedbackData={item.data}
                  onSendEmail={handleFeedbackButton}
                />
              </Hexagon>
            );
          }

          // Resume tile
          if (item.type === 'resume') {
            return (
              <Hexagon
                key={item.id}
                delay={item.delay}
                isExiting={isExiting}
                className={commonClassName}
                style={style}
                onClick={() => downloadResume(item.data)}
              >
                <ResumeHex 
                  resume={item.data}
                  onDownload={(e) => handleDownloadButton(e, item.data)}
                />
              </Hexagon>
            );
          }

          // Empty tile
          return (
            <Hexagon 
              key={item.id} 
              delay={item.delay}
              isExiting={isExiting}
              style={style}
              className="pointer-events-none opacity-50" 
            />
          );
        })}
      </div>

      <footer 
        className={`fixed left-1/2 -translate-x-1/2 z-50 text-center transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}
        style={{ bottom: '10px', opacity: 0, animation: 'fadeIn 0.5s ease-out forwards', animationDelay: '400ms' }}
      >
        <p className="text-[12px] text-white/50 m-0 mb-1">© 2025 - 2026 Vatsal Goyal. All rights reserved.</p>
        <p className="text-[10px] text-white/40 m-0">This website uses Strapi, managed by Gleck, my Personal AI Agent.</p>
      </footer>
    </main>
  );
}
