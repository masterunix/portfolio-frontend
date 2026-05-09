'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { useGleckData } from '@/hooks/useGleckData';
import { useEyeTracking } from '@/hooks/useEyeTracking';
import { useNoticeCarousel } from '@/hooks/useNoticeCarousel';

// Constants
const AUTO_EXPAND_DELAY = 3000;
const AUTO_COLLAPSE_DELAY = 10000; // Auto-collapse after 10 seconds
const BLINK_DURATION = 350;

interface Notice {
  id: number;
  text: string;
  link?: string;
  order: number;
}

/**
 * AnimeEye — Simple anime-style eye component
 * Renders an oval sclera with a round iris/pupil that follows cursor
 * 
 * @param w - Width of the eye SVG
 * @param h - Height of the eye SVG
 * @param px - Normalized X position of pupil (-1 to 1)
 * @param py - Normalized Y position of pupil (-1 to 1)
 * @param closed - Whether the eye is closed (blinking)
 */
function AnimeEye({ 
  w, 
  h, 
  px, 
  py, 
  closed 
}: { 
  w: number; 
  h: number; 
  px: number; 
  py: number; 
  closed: boolean;
}) {
  const ballR = h * 0.2;
  const cx = w / 2 + px * (w * 0.15);
  const cy = h / 2 + py * (h * 0.12);

  if (closed) {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block">
        <path
          d={`M${w * 0.15},${h * 0.5} Q${w * 0.5},${h * 0.8} ${w * 0.85},${h * 0.5}`}
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
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

/**
 * EyePair — Renders two anime eyes side by side
 * 
 * @param size - Base size for each eye
 * @param px - Normalized X position of pupils
 * @param py - Normalized Y position of pupils
 * @param closed - Whether eyes are closed
 * @param onClick - Optional click handler for blink animation
 */
function EyePair({
  size,
  px,
  py,
  closed,
  onClick,
}: {
  size: number;
  px: number;
  py: number;
  closed: boolean;
  onClick?: () => void;
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

/**
 * Sanitizes HTML content to prevent XSS attacks
 * 
 * @param html - Raw HTML string from API
 * @returns Sanitized HTML safe for rendering
 */
function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p', 'span'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  });
}

/**
 * GleckNoticeWrapper — Persistent notification widget with anime eyes
 * 
 * Features:
 * - Fetches notices from Strapi
 * - Auto-expands after 3 seconds
 * - Eyes follow cursor
 * - Cycles through multiple notices
 * - Persists across page navigations (no flash)
 * - Can be collapsed/expanded/enlarged
 * - XSS protection with HTML sanitization
 */
export default function GleckNoticeWrapper() {
  const [mounted, setMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true); // Start expanded by default
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [blink, setBlink] = useState(false);
  const [userCollapsed, setUserCollapsed] = useState(false); // Track if user manually collapsed
  
  const widgetRef = useRef<HTMLDivElement>(null);
  const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Custom hooks for separated concerns
  const { notices, settings } = useGleckData();
  const eyePos = useEyeTracking(widgetRef);
  const { currentIndex, setCurrentIndex } = useNoticeCarousel(notices.length, isExpanded);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-collapse after being expanded for a while (only if user hasn't manually collapsed)
  useEffect(() => {
    if (!isExpanded || isEnlarged || userCollapsed) return;
    
    const timer = setTimeout(() => {
      setIsExpanded(false);
    }, AUTO_COLLAPSE_DELAY);

    return () => clearTimeout(timer);
  }, [isExpanded, isEnlarged, userCollapsed]);

  // Auto-expand when user hasn't manually collapsed
  useEffect(() => {
    if (!mounted || userCollapsed) return;
    
    // If collapsed and user hasn't manually closed it, expand after delay
    if (!isExpanded) {
      const timer = setTimeout(() => {
        setIsExpanded(true);
      }, AUTO_EXPAND_DELAY);

      return () => clearTimeout(timer);
    }
  }, [mounted, isExpanded, userCollapsed]);

  /**
   * Handles blink animation with proper cleanup
   * Also expands widget if collapsed
   */
  const handleBlink = useCallback(() => {
    setBlink(true);
    
    // If collapsed, expand and reset userCollapsed flag
    if (!isExpanded) {
      setIsExpanded(true);
      setUserCollapsed(false);
    }
    
    // Clear any existing timer
    if (blinkTimerRef.current) {
      clearTimeout(blinkTimerRef.current);
    }
    
    blinkTimerRef.current = setTimeout(() => {
      setBlink(false);
      blinkTimerRef.current = null;
    }, BLINK_DURATION);
  }, [isExpanded]);

  // Cleanup blink timer on unmount
  useEffect(() => {
    return () => {
      if (blinkTimerRef.current) {
        clearTimeout(blinkTimerRef.current);
      }
    };
  }, []);

  /**
   * Generates dynamic inline styles based on widget state
   * @returns Inline style object for container styling
   */
  const getContainerStyles = () => {
    const baseStyles = {
      boxSizing: 'border-box' as const,
      position: 'relative' as const,
      overflow: 'hidden' as const,
      display: 'flex',
      flexDirection: 'column' as const,
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      borderRadius: '16px'
    };
    
    if (isExpanded) {
      if (isEnlarged) {
        return {
          ...baseStyles,
          width: '33.333vw',
          height: '33.333vh',
          maxWidth: '33.333vw',
          padding: '12px',
          alignItems: 'flex-start'
        };
      }
      return {
        ...baseStyles,
        width: 'auto',
        height: 'auto',
        minWidth: '300px',
        maxWidth: '600px',
        minHeight: '60px',
        paddingTop: '12px',
        paddingBottom: '12px',
        paddingLeft: '16px',
        paddingRight: '16px',
        alignItems: 'center'
      };
    }
    return {
      ...baseStyles,
      width: '60px',
      height: '60px',
      minWidth: '60px',
      maxWidth: '60px',
      minHeight: '60px',
      padding: '0',
      alignItems: 'center',
      justifyContent: 'center'
    };
  };

  // Don't render on server or if no notices
  if (!mounted || notices.length === 0) {
    return null;
  }

  const currentNotice = notices[currentIndex];

  return (
    <div
      ref={widgetRef}
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '16px',
        zIndex: 9999
      }}
      className="transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] origin-bottom-left"
      role="complementary"
      aria-label="Gleck notification widget"
    >
      <div style={getContainerStyles()}>
        {/* Collapsed state - Eyes only */}
        {!isExpanded && (
          <div className="flex items-center justify-center w-full h-full">
            <EyePair size={14} px={eyePos.x} py={eyePos.y} closed={blink} onClick={handleBlink} />
          </div>
        )}

        {/* Expanded state - Notice content */}
        {isExpanded && (
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            width: '100%',
            minHeight: '36px',
            flexShrink: 0
          }}>
            <EyePair size={14} px={eyePos.x} py={eyePos.y} closed={blink} onClick={handleBlink} />

            <div className="flex-1 min-w-0 overflow-hidden flex items-center">
              {currentNotice?.link ? (
                <a
                  href={currentNotice.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: '14px',
                    lineHeight: '1.4',
                    display: 'block',
                    width: '100%',
                    whiteSpace: isEnlarged ? 'normal' : 'nowrap',
                    overflow: isEnlarged ? 'visible' : 'hidden',
                    textOverflow: 'ellipsis',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(currentNotice.text) }}
                />
              ) : (
                <div
                  style={{
                    color: 'white',
                    fontSize: '14px',
                    lineHeight: '1.4',
                    whiteSpace: isEnlarged ? 'normal' : 'nowrap',
                    overflow: isEnlarged ? 'visible' : 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(currentNotice?.text || 'No notices') }}
                />
              )}
            </div>

            {/* Enlarge/Shrink button */}
            <button
              onClick={() => setIsEnlarged(!isEnlarged)}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.2s',
                padding: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              }}
              title={isEnlarged ? 'Shrink' : 'Expand'}
              aria-label={isEnlarged ? 'Shrink widget' : 'Expand widget'}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                {isEnlarged ? (
                  <path d="M3 5L7 9L11 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <path d="M3 9L7 5L11 9" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                )}
              </svg>
            </button>

            {/* Collapse button */}
            <button
              onClick={() => {
                setIsExpanded(false);
                setIsEnlarged(false);
                setUserCollapsed(true);
              }}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.2s',
                padding: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              }}
              title="Collapse"
              aria-label="Collapse widget"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2L10 10M10 2L2 10" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}

        {/* Enlarged view - All notices */}
        {isExpanded && isEnlarged && (
          <div style={{
            flex: 1,
            width: '100%',
            paddingTop: '12px',
            overflowY: 'auto',
            overflowX: 'hidden',
            boxSizing: 'border-box'
          }}>
            <div style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '12px'
            }}>
              <h3 style={{
                margin: 0,
                marginBottom: '12px',
                fontSize: '14px',
                fontWeight: 600,
                color: 'white'
              }}>All Updates</h3>
              {notices.map((notice: Notice, idx: number) => (
                <div
                  key={notice.id}
                  style={{
                    padding: '10px',
                    marginBottom: '8px',
                    borderRadius: '8px',
                    border: idx === currentIndex ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: idx === currentIndex ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                    boxSizing: 'border-box'
                  }}
                  onClick={() => setCurrentIndex(idx)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = idx === currentIndex ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = idx === currentIndex ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)';
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setCurrentIndex(idx);
                    }
                  }}
                  aria-label={`Select notice ${idx + 1}`}
                >
                  {notice.link ? (
                    <a
                      href={notice.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '13px',
                        lineHeight: '1.6',
                        color: 'white',
                        wordBreak: 'break-word',
                        textDecoration: 'none',
                        display: 'block',
                        transition: 'color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
                      dangerouslySetInnerHTML={{ __html: sanitizeHTML(notice.text) }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div
                      style={{
                        fontSize: '13px',
                        lineHeight: '1.6',
                        color: 'white',
                        wordBreak: 'break-word'
                      }}
                      dangerouslySetInnerHTML={{ __html: sanitizeHTML(notice.text) }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expand button (when collapsed) */}
        {!isExpanded && (
          <button
            onClick={() => {
              setIsExpanded(true);
              setUserCollapsed(false);
            }}
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s',
              padding: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
            title="Expand"
            aria-label="Expand widget"
          >
            +
          </button>
        )}
      </div>

      {/* Know more link - Always visible */}
      <a
        href={settings.knowMoreLink}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'block',
          marginTop: '8px',
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.6)',
          textDecoration: 'none',
          paddingLeft: '8px',
          transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
      >
        {settings.knowMoreText}
      </a>
    </div>
  );
}
