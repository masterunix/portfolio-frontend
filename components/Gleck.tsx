/**
 * Gleck.tsx — Gleck, my AI agent, in the bottom-left corner of every page.
 *
 * Wide screens: a glass widget with eyes that follow the cursor and Gleck's notices
 * (content/gleck-notices.yaml), cycling every 5s. It expands 3s after collapsing and
 * collapses after 10s, until you close it yourself; ↑ shows every notice.
 * Narrow screens: just the eyes, linking to Gleck's repository.
 */
'use client';

import { useEffect, useRef, useState } from 'react';

import { useEyeTracking } from '@/hooks/useEyeTracking';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { useNoticeCarousel } from '@/hooks/useNoticeCarousel';
import type { GleckNotice, GleckSettings } from '@/types';

const EXPAND_AFTER_MS = 3000;
const COLLAPSE_AFTER_MS = 10000;
const BLINK_MS = 350;

interface GleckProps {
  notices: GleckNotice[];
  settings: GleckSettings;
}

export default function Gleck({ notices, settings }: GleckProps) {
  const isDesktop = useIsDesktop();
  return (
    <>
      <a href={settings.knowMoreLink} target="_blank" rel="noopener noreferrer" className="gleck gleck-mini mobile-only"
        aria-label="Gleck, my AI agent">
        <Eyes size={12} />
      </a>
      {isDesktop && <GleckWidget notices={notices} settings={settings} />}
    </>
  );
}

function GleckWidget({ notices, settings }: GleckProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(true);
  const [enlarged, setEnlarged] = useState(false);
  const [closedByUser, setClosedByUser] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const look = useEyeTracking(ref);
  const { index, setIndex } = useNoticeCarousel(notices.length, expanded);

  // Collapse after a while, and pop back open a little later, until closed by hand
  useEffect(() => {
    if (closedByUser || enlarged) return;
    const timer = setTimeout(() => setExpanded(!expanded), expanded ? COLLAPSE_AFTER_MS : EXPAND_AFTER_MS);
    return () => clearTimeout(timer);
  }, [expanded, enlarged, closedByUser]);

  useEffect(() => {
    if (!blinking) return;
    const timer = setTimeout(() => setBlinking(false), BLINK_MS);
    return () => clearTimeout(timer);
  }, [blinking]);

  const open = () => { setExpanded(true); setClosedByUser(false); };
  const close = () => { setExpanded(false); setEnlarged(false); setClosedByUser(true); };
  const notice = notices[index];

  return (
    <div ref={ref} className="gleck" role="complementary" aria-label="Gleck's notices">
      <div className={`gleck-widget glass ${expanded ? (enlarged ? 'is-enlarged' : '') : 'is-collapsed'}`}>
        <div className="gleck-row">
          <button className="gleck-eyes" onClick={() => { setBlinking(true); open(); }} aria-label="Blink">
            <Eyes size={14} look={look} closed={blinking} />
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
              <div key={n.id} className={`gleck-notice-item ${i === index ? 'active' : ''}`}>
                <button onClick={() => setIndex(i)} aria-label={`Show notice ${i + 1}`} className="gleck-notice-pick" />
                <Notice notice={n} />
              </div>
            ))}
          </div>
        )}

        {!expanded && <button className="gleck-expand" onClick={open} aria-label="Open">+</button>}
      </div>

      <a href={settings.knowMoreLink} target="_blank" rel="noopener noreferrer" className="gleck-know-more">
        {settings.knowMoreText}
      </a>
    </div>
  );
}

/** A notice's text (HTML rendered from Markdown at build time), linked when it has a link */
function Notice({ notice }: { notice: GleckNotice }) {
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
