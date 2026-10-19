/**
 * Gleck.tsx — Gleck, my AI agent, in the bottom-left corner of every page. His eyes
 * follow the cursor and blink now and then.
 *
 * On the home page, on wide screens: a glass widget with Gleck's notices
 * (content/gleck.md), cycling every 5s. It expands 3s after collapsing and collapses
 * after 10s, until you close it yourself; ↑ shows every notice.
 * Everywhere else, and on phones: just the eyes, linking to Gleck's repository.
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

import { useBlink } from '@/hooks/useBlink';

import { useEyeTracking } from '@/hooks/useEyeTracking';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { useNoticeCarousel } from '@/hooks/useNoticeCarousel';
import type { Gleck as GleckContent } from '@/types';

type Notice = GleckContent['notices'][number];

const EXPAND_AFTER_MS = 3000;
const COLLAPSE_AFTER_MS = 10000;

export default function Gleck({ gleck }: { gleck: GleckContent }) {
  const isDesktop = useIsDesktop();
  const isHome = usePathname() === '/';
  if (isDesktop && isHome) return <GleckWidget gleck={gleck} />;
  return <GleckEyes link={gleck.moreLink} size={isDesktop ? 14 : 12} />;
}

/** Just the eyes, in a glass square: every page but home, and phones */
function GleckEyes({ link, size }: { link: string; size: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const look = useEyeTracking(ref);
  const { shut, blink } = useBlink();
  return (
    <a ref={ref} href={link} target="_blank" rel="noopener noreferrer" className="gleck gleck-mini"
      aria-label="Gleck, my AI agent" title="Gleck, my AI agent" onMouseEnter={blink}>
      <Eyes size={size} look={look} closed={shut} />
    </a>
  );
}

function GleckWidget({ gleck }: { gleck: GleckContent }) {
  const { notices } = gleck;
  const ref = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(true);
  const [enlarged, setEnlarged] = useState(false);
  const [closedByUser, setClosedByUser] = useState(false);
  const { shut, blink } = useBlink();
  const look = useEyeTracking(ref);
  const { index, setIndex } = useNoticeCarousel(notices.length, expanded);

  // Collapse after a while, and pop back open a little later, until closed by hand
  useEffect(() => {
    if (closedByUser || enlarged) return;
    const timer = setTimeout(() => setExpanded(!expanded), expanded ? COLLAPSE_AFTER_MS : EXPAND_AFTER_MS);
    return () => clearTimeout(timer);
  }, [expanded, enlarged, closedByUser]);

  const open = () => { setExpanded(true); setClosedByUser(false); };
  const close = () => { setExpanded(false); setEnlarged(false); setClosedByUser(true); };
  const notice = notices[index];

  return (
    <div ref={ref} className="gleck" role="complementary" aria-label="Gleck's notices">
      <div className={`gleck-widget glass ${expanded ? (enlarged ? 'is-enlarged' : '') : 'is-collapsed'}`}>
        <div className="gleck-row">
          <button className="gleck-eyes" onClick={() => { blink(); open(); }} aria-label="Blink">
            <Eyes size={14} look={look} closed={shut} />
          </button>
          {expanded && (
            <>
              <div className="gleck-text">
                {notice ? <Notice notice={notice} /> : <span className="gleck-hello">Hi! I&apos;m Gleck.</span>}
              </div>
              <button className="gleck-button" onClick={() => setEnlarged(!enlarged)}
                aria-label={enlarged ? 'Show less' : 'Show all notices'}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={enlarged ? 'M3 5L7 9L11 5' : 'M3 9L7 5L11 9'} />
                </svg>
              </button>
              <button className="gleck-button gleck-button-danger" onClick={close} aria-label="Close">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M2 2L10 10M10 2L2 10" />
                </svg>
              </button>
            </>
          )}
        </div>

        {expanded && enlarged && notices.length > 0 && (
          <div className="gleck-all">
            <h3>All Updates</h3>
            {notices.map((n, i) => (
              <div key={i} className={`gleck-notice-item ${i === index ? 'active' : ''}`}>
                <button onClick={() => setIndex(i)} aria-label={`Show notice ${i + 1}`} className="gleck-notice-pick" />
                <Notice notice={n} />
              </div>
            ))}
          </div>
        )}

        {!expanded && <button className="gleck-expand" onClick={open} aria-label="Open">+</button>}
      </div>

      <a href={gleck.moreLink} target="_blank" rel="noopener noreferrer" className="gleck-know-more">
        {gleck.moreText}
      </a>
    </div>
  );
}

/** A notice's text (HTML rendered from Markdown at build time), linked when it has a link */
function Notice({ notice }: { notice: Notice }) {
  const html = { __html: notice.html };
  return notice.link
    ? <a href={notice.link} target="_blank" rel="noopener noreferrer" className="gleck-notice" dangerouslySetInnerHTML={html} />
    : <span className="gleck-notice" dangerouslySetInnerHTML={html} />;
}

/** Two anime eyes; the pupils follow `look` (−1…1 on each axis) */
function Eyes({ size, look = { x: 0, y: 0 }, closed = false }: {
  size: number; look?: { x: number; y: number }; closed?: boolean;
}) {
  const w = size;
  const h = size * 1.3;
  const eye = closed ? (
    <path d={`M${w * 0.15},${h * 0.5} Q${w * 0.5},${h * 0.8} ${w * 0.85},${h * 0.5}`}
      stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
  ) : (
    <>
      <ellipse cx={w / 2} cy={h / 2} rx={w * 0.42} ry={h * 0.45} fill="white" />
      <circle cx={w / 2 + look.x * w * 0.15} cy={h / 2 + look.y * h * 0.12} r={h * 0.2} fill="black" />
    </>
  );
  return (
    <span className="gleck-eye-pair" style={{ gap: size * 0.12 }} aria-hidden="true">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>{eye}</svg>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>{eye}</svg>
    </span>
  );
}
