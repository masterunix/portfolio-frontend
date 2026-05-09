'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { getGleckNotices, getGleckSettings } from '@/lib/api';

interface Notice {
  id: number;
  text: string;
  link?: string;
  order: number;
}

interface GleckSettings {
  knowMoreLink: string;
  knowMoreText: string;
}

/* ------------------------------------------------------------------ */
/*  Simple anime-style eye: oval sclera + round iris/pupil + highlight */
/* ------------------------------------------------------------------ */
function AnimeEye({ w, h, px, py, closed }: { w: number; h: number; px: number; py: number; closed: boolean }) {
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

/* ================================================================== */
/*  Main wrapper                                                       */
/* ================================================================== */
export default function GleckNoticeWrapper() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [settings, setSettings] = useState<GleckSettings>({
    knowMoreLink: '#',
    knowMoreText: 'Updates are managed by my AI Assistant, Gleck. Click here to know more.',
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [eyePos, setEyePos] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getGleckNotices()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setNotices(data);
      })
      .catch((err) => console.warn('Could not load Gleck notices:', err));

    getGleckSettings()
      .then((data) => {
        if (data) {
          setSettings({
            knowMoreLink: data.knowMoreLink || '#',
            knowMoreText: data.knowMoreText || 'Updates are managed by my AI Assistant, Gleck. Click here to know more.',
          });
        }
      })
      .catch((err) => console.warn('Could not load Gleck settings:', err));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setIsExpanded(true), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!widgetRef.current) return;
      const r = widgetRef.current.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const norm = Math.min(dist / 300, 1);
      const angle = Math.atan2(dy, dx);
      setEyePos({ x: Math.cos(angle) * norm, y: Math.sin(angle) * norm });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useEffect(() => {
    if (!isExpanded || notices.length <= 1) return;
    const iv = setInterval(() => setCurrentIndex((p) => (p + 1) % notices.length), 5000);
    return () => clearInterval(iv);
  }, [isExpanded, notices.length]);

  const handleBlink = useCallback(() => {
    setBlink(true);
    setTimeout(() => setBlink(false), 350);
  }, []);

  const currentNotice = notices[currentIndex];

  const getContainerClasses = () => {
    let classes = "box-border relative overflow-hidden flex flex-col transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] backdrop-blur-[20px] shadow-[0_8px_32px_0_rgba(0,0,0,0.37),inset_0_1px_0_0_rgba(255,255,255,0.1)] border border-white/20 bg-gradient-to-br from-white/10 to-white/5 ";
    
    if (isExpanded) {
      if (isEnlarged) {
        classes += "w-[33.333vw] h-[33.333vh] max-w-[33.333vw] rounded-2xl p-3 items-start scale-102";
      } else {
        classes += "w-auto h-auto min-w-[300px] max-w-[600px] min-h-[60px] rounded-2xl py-3 px-4 items-center scale-100";
      }
    } else {
      classes += "w-[60px] h-[60px] min-w-[60px] max-w-[60px] min-h-[60px] rounded-xl p-0 items-center justify-center scale-100";
    }
    
    return classes;
  };

  return (
    <div
      ref={widgetRef}
      className="fixed bottom-4 left-4 z-[9999] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] origin-bottom-left"
    >
      <div className={getContainerClasses()}>
        {!isExpanded && (
          <div className="flex items-center justify-center w-full h-full">
            <EyePair size={14} px={eyePos.x} py={eyePos.y} closed={blink} onClick={handleBlink} />
          </div>
        )}

        {isExpanded && (
          <div className="flex gap-3 items-center w-full min-h-[36px] shrink-0">
            <EyePair size={14} px={eyePos.x} py={eyePos.y} closed={blink} onClick={handleBlink} />

            <div className="flex-1 min-w-0 overflow-hidden flex items-center">
              {currentNotice?.link ? (
                <a
                  href={currentNotice.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-white text-sm leading-[1.4] no-underline block w-full ${isEnlarged ? 'whitespace-normal overflow-visible' : 'whitespace-nowrap overflow-hidden text-ellipsis'}`}
                  dangerouslySetInnerHTML={{ __html: currentNotice.text }}
                />
              ) : (
                <div
                  className={`text-white text-sm leading-[1.4] ${isEnlarged ? 'whitespace-normal overflow-visible' : 'whitespace-nowrap overflow-hidden text-ellipsis'}`}
                  dangerouslySetInnerHTML={{ __html: currentNotice?.text || 'No notices' }}
                />
              )}
            </div>

            <button
              onClick={() => setIsEnlarged(!isEnlarged)}
              className="w-7 h-7 rounded-lg border border-white/15 bg-white/10 text-white cursor-pointer flex items-center justify-center shrink-0 transition-all duration-200 hover:bg-white/20 hover:border-white/30"
              title={isEnlarged ? 'Shrink' : 'Expand'}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                {isEnlarged ? (
                  <path d="M3 5L7 9L11 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <path d="M3 9L7 5L11 9" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                )}
              </svg>
            </button>

            <button
              onClick={() => {
                setIsExpanded(false);
                setIsEnlarged(false);
              }}
              className="w-7 h-7 rounded-lg border border-white/15 bg-white/10 text-white cursor-pointer flex items-center justify-center shrink-0 transition-all duration-200 hover:bg-red-500/25 hover:border-red-500/50"
              title="Collapse"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2L10 10M10 2L2 10" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}

        {isExpanded && isEnlarged && (
          <div className="flex-1 w-full pt-3 overflow-y-auto overflow-x-hidden box-border">
            <div className="border-t border-white/10 pt-3">
              <h3 className="m-0 mb-3 text-sm font-semibold text-white">All Updates</h3>
              {notices.map((notice, idx) => (
                <div
                  key={notice.id}
                  className={`p-2.5 mb-2 rounded-lg border transition-all duration-300 cursor-pointer box-border hover:bg-white/15 hover:border-white/25 ${idx === currentIndex ? 'bg-white/10 border-white/10' : 'bg-white/5 border-white/10'}`}
                  onClick={() => setCurrentIndex(idx)}
                >
                  {notice.link ? (
                    <a
                      href={notice.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] leading-relaxed text-white break-words no-underline block"
                      dangerouslySetInnerHTML={{ __html: notice.text }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div
                      className="text-[13px] leading-relaxed text-white break-words"
                      dangerouslySetInnerHTML={{ __html: notice.text }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="absolute top-1 right-1 w-5 h-5 rounded-full border-none bg-white/10 text-white cursor-pointer text-xs flex items-center justify-center transition-all duration-300 hover:bg-white/20"
            title="Expand"
          >
            +
          </button>
        )}
      </div>

      <a
        href={settings.knowMoreLink}
        className={`block mt-2 text-[11px] text-white/60 no-underline pl-2 transition-colors duration-200 hover:text-white/90 ${isExpanded ? 'opacity-100' : 'opacity-70'}`}
      >
        {settings.knowMoreText}
      </a>
    </div>
  );
}
