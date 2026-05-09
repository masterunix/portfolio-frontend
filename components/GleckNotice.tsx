'use client';

import { useEffect, useState, useRef } from 'react';

interface Notice {
  id: number;
  text: string;
  link?: string;
  order: number;
}

interface GleckNoticeProps {
  notices: Notice[];
  knowMoreText: string;
  knowMoreLink: string;
}

export default function GleckNotice({ notices, knowMoreText, knowMoreLink }: GleckNoticeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentNoticeIndex, setCurrentNoticeIndex] = useState(0);
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);

  // Debug log
  useEffect(() => {
    console.log('GleckNotice mounted with notices:', notices);
  }, [notices]);

  // Auto-expand after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExpanded(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Shuffle through notices every 5 seconds when expanded
  useEffect(() => {
    if (!isExpanded || notices.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentNoticeIndex((prev) => (prev + 1) % notices.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isExpanded, notices.length]);

  // Eye follows cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!widgetRef.current) return;

      const rect = widgetRef.current.getBoundingClientRect();
      const eyeCenterX = rect.left + 30; // Center of the eye icon
      const eyeCenterY = rect.top + 30;

      const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);
      const distance = Math.min(8, Math.hypot(e.clientX - eyeCenterX, e.clientY - eyeCenterY) / 50);

      setEyePosition({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const currentNotice = notices[currentNoticeIndex];

  return (
    <div
      ref={widgetRef}
      className="fixed bottom-4 left-4 z-50 transition-all duration-500 ease-out"
      style={{
        width: isExpanded ? '50vw' : '60px',
        minWidth: isExpanded ? '400px' : '60px',
        maxWidth: isExpanded ? '800px' : '60px'
      }}
    >
      {/* Main widget */}
      <div
        className="relative overflow-hidden transition-all duration-500"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          borderRadius: isExpanded ? '16px' : '12px',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.1), 0 0 20px rgba(255, 255, 255, 0.1)',
          height: isExpanded ? 'auto' : '60px',
          padding: isExpanded ? '16px' : '0'
        }}
      >
        {/* Collapsed state - Eye emoji */}
        {!isExpanded && (
          <div className="flex items-center justify-center h-full relative">
            <span className="text-3xl">👁️</span>
            <div
              className="absolute w-2 h-2 bg-black rounded-full transition-transform duration-100 pointer-events-none"
              style={{
                left: `calc(50% + ${eyePosition.x}px)`,
                top: `calc(50% + ${eyePosition.y}px)`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          </div>
        )}

        {/* Expanded state - Notice content */}
        {isExpanded && (
          <div className="flex items-start gap-3">
            {/* Eye icon (static when expanded) */}
            <div className="flex-shrink-0 text-2xl mt-1">
              👁️
            </div>

            {/* Notice content */}
            <div className="flex-1 min-w-0">
              {currentNotice ? (
                currentNotice.link ? (
                  <a
                    href={currentNotice.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-white hover:text-gray-200 transition-colors"
                  >
                    <div
                      className="text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: currentNotice.text }}
                    />
                  </a>
                ) : (
                  <div
                    className="text-white text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: currentNotice.text }}
                  />
                )
              ) : (
                <p className="text-white text-sm">No notices available</p>
              )}

              {/* Pagination dots */}
              {notices.length > 1 && (
                <div className="flex gap-1.5 mt-3">
                  {notices.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentNoticeIndex(index)}
                      className="w-2 h-2 rounded-full transition-all duration-300"
                      style={{
                        background: index === currentNoticeIndex
                          ? 'rgba(255, 255, 255, 0.9)'
                          : 'rgba(255, 255, 255, 0.3)'
                      }}
                      aria-label={`Go to notice ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Collapse button */}
            <button
              onClick={() => setIsExpanded(false)}
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              aria-label="Collapse"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8L4 8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        )}

        {/* Expand button (when collapsed) */}
        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            aria-label="Expand"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 4V12M4 8H12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Know more link */}
      {isExpanded && (
        <a
          href={knowMoreLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-2 text-xs text-white/60 hover:text-white/80 transition-colors px-2"
        >
          {knowMoreText}
        </a>
      )}
    </div>
  );
}
