/**
 * GleckNoticeWrapper.tsx — Persistent AI assistant notification widget.
 *
 * Desktop: Full notice widget with eyes, expandable notices, enlarge view.
 * Mobile:  Eyes-only with a link to Gleck's GitHub repository.
 *
 * Features:
 * - Fetches notices from Strapi CMS
 * - Auto-expands after 3s, auto-collapses after 10s (desktop only)
 * - Eyes follow cursor position
 * - Cycles through multiple notices
 * - XSS protection via DOMPurify
 */
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { useGleckData } from '@/hooks/useGleckData';
import { useEyeTracking } from '@/hooks/useEyeTracking';
import { useNoticeCarousel } from '@/hooks/useNoticeCarousel';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useMounted } from '@/hooks/useMounted';

// ─── Constants ───────────────────────────────────────────────────────────────

/** Canonical URL for all Gleck references */
const GLECK_URL = 'https://github.com/masterunix/gleck';

const AUTO_EXPAND_DELAY = 3000;
const AUTO_COLLAPSE_DELAY = 10000;
const BLINK_DURATION = 350;

// ─── Types ───────────────────────────────────────────────────────────────────

interface Notice {
  id: number;
  text: string;
  link?: string;
  order: number;
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

/** Single anime-style eye — oval sclera with round iris/pupil that follows cursor */
function AnimeEye({ w, h, px, py, closed }: { w: number; h: number; px: number; py: number; closed: boolean }) {
  const ballR = h * 0.2;
  const cx = w / 2 + px * (w * 0.15);
  const cy = h / 2 + py * (h * 0.12);

  if (closed) {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block">
        <path
          d={`M${w * 0.15},${h * 0.5} Q${w * 0.5},${h * 0.8} ${w * 0.85},${h * 0.5}`}
          stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"
        />
      </svg>
    );
  }

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block">
      <ellipse cx={w / 2} cy={h / 2} rx={w * 0.42} ry={h * 0.45} fill="white" />
      <circle cx={cx} cy={cy} r={ballR} fill="black" />
    </svg>
  );
}

/** Renders two anime eyes side by side */
function EyePair({ size, px, py, closed, onClick }: {
  size: number; px: number; py: number; closed: boolean; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center shrink-0 ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
      style={{ gap: `${size * 0.12}px` }}
    >
      <AnimeEye w={size} h={size * 1.3} px={px} py={py} closed={closed} />
      <AnimeEye w={size} h={size * 1.3} px={px} py={py} closed={closed} />
    </div>
  );
}

/** Sanitize HTML to prevent XSS — only allow safe inline formatting */
function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p', 'span'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  });
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function GleckNoticeWrapper() {
  const mounted = useMounted();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [blink, setBlink] = useState(false);
  const [userCollapsed, setUserCollapsed] = useState(false);
  
  const widgetRef = useRef<HTMLDivElement>(null);
  const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMobile = useIsMobile();
  
  const { notices } = useGleckData();
  const eyePos = useEyeTracking(widgetRef);
  const { currentIndex, setCurrentIndex } = useNoticeCarousel(notices.length, isExpanded);

  // Auto-collapse after 10s (desktop only)
  useEffect(() => {
    if (isMobile || !isExpanded || isEnlarged || userCollapsed) return;
    const timer = setTimeout(() => setIsExpanded(false), AUTO_COLLAPSE_DELAY);
    return () => clearTimeout(timer);
  }, [isExpanded, isEnlarged, userCollapsed, isMobile]);

  // Auto-expand when user hasn't manually collapsed (desktop only)
  useEffect(() => {
    if (isMobile || !mounted || userCollapsed || isExpanded) return;
    const timer = setTimeout(() => setIsExpanded(true), AUTO_EXPAND_DELAY);
    return () => clearTimeout(timer);
  }, [mounted, isExpanded, userCollapsed, isMobile]);

  /** Blink animation + expand if collapsed */
  const handleBlink = useCallback(() => {
    setBlink(true);
    if (!isExpanded && !isMobile) {
      setIsExpanded(true);
      setUserCollapsed(false);
    }
    if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    blinkTimerRef.current = setTimeout(() => {
      setBlink(false);
      blinkTimerRef.current = null;
    }, BLINK_DURATION);
  }, [isExpanded, isMobile]);

  // Cleanup blink timer
  useEffect(() => {
    return () => { if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current); };
  }, []);

  /** Dynamic container styles based on widget state */
  const getContainerStyles = () => {
    const base = {
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)'
    };
    if (isExpanded) {
      if (isEnlarged) return { ...base, width: '33.333vw', height: '33.333vh', maxWidth: '33.333vw', padding: '12px', alignItems: 'flex-start' };
      return { ...base, width: 'auto', height: 'auto', minWidth: '300px', maxWidth: '600px', minHeight: '60px', paddingTop: '12px', paddingBottom: '12px', paddingLeft: '16px', paddingRight: '16px', alignItems: 'center' };
    }
    return { ...base, width: '60px', height: '60px', minWidth: '60px', maxWidth: '60px', minHeight: '60px', padding: '0', alignItems: 'center', justifyContent: 'center' };
  };

  if (!mounted) return null;

  // ─── Mobile: Eyes-only with link to Gleck GitHub ─────────────────────────

  if (isMobile) {
    return (
      <div
        ref={widgetRef}
        style={{ position: 'fixed', bottom: '16px', left: '16px', zIndex: 9999 }}
      >
        <a
          href={GLECK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="gleck-widget"
          style={{
            width: '52px',
            height: '52px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            padding: 0
          }}
          aria-label="Gleck — AI Assistant"
        >
          <EyePair size={12} px={eyePos.x} py={eyePos.y} closed={blink} onClick={handleBlink} />
        </a>
      </div>
    );
  }

  // ─── Desktop: Full notice widget ─────────────────────────────────────────

  // Don't show notices section if empty, but still show the eyes
  const currentNotice = notices[currentIndex];
  const hasNotices = notices.length > 0;

  return (
    <div
      ref={widgetRef}
      style={{ position: 'fixed', bottom: '16px', left: '16px', zIndex: 9999 }}
      className="transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] origin-bottom-left"
      role="complementary"
      aria-label="Gleck notification widget"
    >
      <div className="gleck-widget" style={getContainerStyles()}>
        {/* Collapsed — eyes only */}
        {!isExpanded && (
          <div className="flex items-center justify-center w-full h-full">
            <EyePair size={14} px={eyePos.x} py={eyePos.y} closed={blink} onClick={handleBlink} />
          </div>
        )}

        {/* Expanded — notice content */}
        {isExpanded && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%', minHeight: '36px', flexShrink: 0 }}>
            <EyePair size={14} px={eyePos.x} py={eyePos.y} closed={blink} onClick={handleBlink} />

            <div className="flex-1 min-w-0 overflow-hidden flex items-center">
              {hasNotices && currentNotice ? (
                currentNotice.link ? (
                  <a href={currentNotice.link} target="_blank" rel="noopener noreferrer"
                    className="gleck-link gleck-notice-content"
                    style={{ fontSize: '14px', lineHeight: '1.4', display: 'block', width: '100%',
                      whiteSpace: isEnlarged ? 'normal' : 'nowrap', overflow: isEnlarged ? 'visible' : 'hidden',
                      textOverflow: 'ellipsis', color: 'white' }}
                    dangerouslySetInnerHTML={{ __html: sanitizeHTML(currentNotice.text) }}
                  />
                ) : (
                  <div className="gleck-notice-content"
                    style={{ color: 'white', fontSize: '14px', lineHeight: '1.4',
                      whiteSpace: isEnlarged ? 'normal' : 'nowrap', overflow: isEnlarged ? 'visible' : 'hidden',
                      textOverflow: 'ellipsis' }}
                    dangerouslySetInnerHTML={{ __html: sanitizeHTML(currentNotice.text) }}
                  />
                )
              ) : (
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Hi! I&apos;m Gleck.</span>
              )}
            </div>

            {/* Enlarge/Shrink button */}
            <button onClick={() => setIsEnlarged(!isEnlarged)} className="gleck-button"
              title={isEnlarged ? 'Shrink' : 'Expand'} aria-label={isEnlarged ? 'Shrink widget' : 'Expand widget'}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                {isEnlarged ? (
                  <path d="M3 5L7 9L11 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <path d="M3 9L7 5L11 9" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                )}
              </svg>
            </button>

            {/* Collapse button */}
            <button onClick={() => { setIsExpanded(false); setIsEnlarged(false); setUserCollapsed(true); }}
              className="gleck-button gleck-button-danger" title="Collapse" aria-label="Collapse widget">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2L10 10M10 2L2 10" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}

        {/* Enlarged view — all notices */}
        {isExpanded && isEnlarged && hasNotices && (
          <div style={{ flex: 1, width: '100%', paddingTop: '12px', overflowY: 'auto', overflowX: 'hidden', boxSizing: 'border-box' }}>
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '12px' }}>
              <h3 style={{ margin: 0, marginBottom: '12px', fontSize: '14px', fontWeight: 600, color: 'white' }}>All Updates</h3>
              {notices.map((notice: Notice, idx: number) => (
                <div key={notice.id}
                  className={`gleck-notice-item ${idx === currentIndex ? 'active' : ''}`}
                  onClick={() => setCurrentIndex(idx)} role="button" tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCurrentIndex(idx); } }}
                  aria-label={`Select notice ${idx + 1}`}
                >
                  {notice.link ? (
                    <a href={notice.link} target="_blank" rel="noopener noreferrer"
                      className="gleck-link gleck-notice-content"
                      style={{ fontSize: '13px', lineHeight: '1.6', wordBreak: 'break-word', display: 'block', color: 'white' }}
                      dangerouslySetInnerHTML={{ __html: sanitizeHTML(notice.text) }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div className="gleck-notice-content"
                      style={{ fontSize: '13px', lineHeight: '1.6', color: 'white', wordBreak: 'break-word' }}
                      dangerouslySetInnerHTML={{ __html: sanitizeHTML(notice.text) }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expand button (collapsed state) */}
        {!isExpanded && (
          <button onClick={() => { setIsExpanded(true); setUserCollapsed(false); }}
            className="gleck-button"
            style={{ position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px',
              borderRadius: '50%', fontSize: '12px', background: 'rgba(255, 255, 255, 0.1)', border: 'none', color: 'white' }}
            title="Expand" aria-label="Expand widget"
          >+</button>
        )}
      </div>

      {/* Know more link — always points to Gleck GitHub */}
      <a
        href={GLECK_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="gleck-link"
        style={{ display: 'block', marginTop: '8px', fontSize: '11px', paddingLeft: '8px', color: 'rgba(255, 255, 255, 0.6)' }}
      >
        Updates are managed by Gleck, my AI Assistant. Click to learn more.
      </a>
    </div>
  );
}
