/**
 * Gleck.tsx: Gleck, my AI agent, in the bottom-left corner of every page. His eyes
 * follow the cursor and blink now and then.
 *
 * Wide screens: one glass widget that stays put across pages, with the "Updates are
 * managed by Gleck" line under it everywhere. ^ is always next to the eyes: it opens the
 * widget to Gleck's notices (content/gleck.md), then shows every one. On the home page
 * the widget also opens by itself, cycling notices every 5s; it collapses after 10s and
 * opens again 3s later, until you close it. On other pages it stays closed until asked.
 * Phones: just the eyes, linking to Gleck's repository.
 *
 * The widget is never unmounted or re-laid out: it only changes width (and the
 * notice list its height), so every change is one smooth CSS transition.
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
  return (
    <>
      <GleckEyes link={gleck.moreLink} />
      {isDesktop && <GleckWidget gleck={gleck} />}
    </>
  );
}

/** Phones: just the eyes, in a glass square, linking to Gleck's repository */
function GleckEyes({ link }: { link: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const look = useEyeTracking(ref);
  const { shut } = useBlink();
  return (
    <a ref={ref} href={link} target="_blank" rel="noopener noreferrer" className="gleck gleck-mini mobile-only"
      aria-label="Gleck, my AI agent">
      <Eyes size={12} look={look} closed={shut} />
    </a>
  );
}

function GleckWidget({ gleck }: { gleck: GleckContent }) {
  const { notices } = gleck;
  const pathname = usePathname();
  const isHome = pathname === '/';
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(isHome);
  const [listOpen, setListOpen] = useState(false);
  const [closedByUser, setClosedByUser] = useState(false);
  const { shut, blink } = useBlink();
  const look = useEyeTracking(ref);
  const expanded = open;

  // A new page starts fresh: open on home, closed elsewhere
  const [page, setPage] = useState(pathname);
  if (page !== pathname) {
    setPage(pathname);
    setOpen(isHome);
    setListOpen(false);
    setClosedByUser(false);
  }
  const { index, setIndex } = useNoticeCarousel(notices.length, expanded);

  // On the home page: collapse after a while, and open again a little later, until closed by hand
  useEffect(() => {
    if (!isHome || closedByUser || listOpen) return;
    const timer = setTimeout(() => setOpen(!open), open ? COLLAPSE_AFTER_MS : EXPAND_AFTER_MS);
    return () => clearTimeout(timer);
  }, [isHome, open, listOpen, closedByUser]);

  const show = () => { setOpen(true); setClosedByUser(false); };
  const close = () => { setOpen(false); setListOpen(false); setClosedByUser(true); };
  const notice = notices[index];
  const state = !expanded ? 'collapsed' : listOpen ? 'list' : 'open';

  return (
    <div ref={ref} className="gleck" role="complementary" aria-label="Gleck's notices">
      <div className="gleck-widget glass" data-state={state}>
        <div className="gleck-row">
          <button className="gleck-eyes" onClick={() => { blink(); show(); }} aria-label="Open Gleck">
            <Eyes size={14} look={look} closed={shut} />
          </button>
          <div className="gleck-text" aria-live="polite" inert={!expanded}>
            {notice
              ? <Notice key={index} notice={notice} />
              : <span className="gleck-hello">Hi! I&apos;m Gleck.</span>}
          </div>
          <button className="gleck-button gleck-toggle"
            onClick={() => (expanded ? setListOpen(!listOpen) : show())}
            aria-label={!expanded ? 'Open Gleck' : listOpen ? 'Hide all notices' : 'Show all notices'} aria-expanded={listOpen}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 9L7 5L11 9" />
            </svg>
          </button>
          <button className="gleck-button gleck-button-danger gleck-close" onClick={close} inert={!expanded} aria-label="Close">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M2 2L10 10M10 2L2 10" />
            </svg>
          </button>
        </div>

        {notices.length > 0 && (
          <div className="gleck-all" inert={state !== 'list'}>
            <div className="gleck-all-inner">
              <h3>All updates</h3>
              {notices.map((n, i) => (
                <div key={i} className={`gleck-notice-item ${i === index ? 'active' : ''}`}>
                  <button onClick={() => setIndex(i)} aria-label={`Show notice ${i + 1}`} className="gleck-notice-pick" />
                  <Notice notice={n} />
                </div>
              ))}
            </div>
          </div>
        )}
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
