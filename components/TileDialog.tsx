/**
 * TileDialog.tsx — A tile with details opens them in a popup when it's clicked
 * anywhere (except on its own links), or from its Read more button, which is what
 * keyboards and screen readers use. The popup grows out of the tile's hexagon (or card,
 * on phones): it starts as a hexagon the size of the tile and opens up into the panel;
 * closing runs it back.
 *
 * A native <dialog>, so focus stays inside it, Esc closes it and the page behind is
 * inert. It's portalled to <body>, out of the hexagon's clipping and fading.
 */
'use client';

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { SmartLink } from '@/components/transition';
import type { Tile } from '@/lib/tiles';

/** A pointy-top hexagon, and the panel's rectangle as the same six points, so one morphs into the other */
const HEXAGON = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
const RECTANGLE = 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%, 0% 100%, 0% 0%)';
const OPEN_MS = 460;
const CLOSE_MS = 320;

/**
 * A tile's content that opens its details when clicked. Clicks on its links (GitHub,
 * Visit…) go to the link instead.
 */
export function DetailsTile({ tile, className, children }: { tile: Tile; className: string; children: ReactNode }) {
  const [origin, setOrigin] = useState<DOMRect | null>(null);

  // Grow out of the hexagon (or the phone card) that was clicked
  const open = (from: Element) => setOrigin((from.closest('.hex, .mobile-card') ?? from).getBoundingClientRect());

  return (
    <div
      className={`${className} has-details`}
      onClick={(e) => {
        if ((e.target as Element).closest('a')) return;
        open(e.currentTarget);
      }}
    >
      {children}
      {origin && createPortal(<TileDialog tile={tile} origin={origin} onClosed={() => setOrigin(null)} />, document.body)}
    </div>
  );
}

/**
 * The Read more button inside a DetailsTile: a hint for mouse users (the whole tile
 * opens) and the way in for keyboards and screen readers. Its click reaches the tile.
 */
export function ReadMore({ label = 'Read more' }: { label?: string }) {
  return (
    <button type="button" className="tile-more" aria-haspopup="dialog">
      {label}<span aria-hidden="true">→</span>
    </button>
  );
}

function TileDialog({ tile, origin, onClosed }: { tile: Tile; origin: DOMRect; onClosed: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const closing = useRef(false);
  const details = tile.details!;
  const links = [...(tile.actions ?? []), ...(details.links ?? [])];

  // From the tile's box to the panel's: where the panel starts, as a transform. The
  // panel is measured with no animation running, or it would measure its own transform.
  const fromTile = (dialog: HTMLDialogElement) => {
    for (const animation of dialog.getAnimations({ subtree: true })) animation.cancel();
    const panel = dialog.getBoundingClientRect();
    const dx = origin.left + origin.width / 2 - (panel.left + panel.width / 2);
    const dy = origin.top + origin.height / 2 - (panel.top + panel.height / 2);
    return `translate(${dx}px, ${dy}px) scale(${origin.width / panel.width}, ${origin.height / panel.height})`;
  };
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useLayoutEffect(() => {
    const dialog = ref.current!;
    if (!dialog.open) dialog.showModal();
    if (reducedMotion()) {
      dialog.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
      return;
    }
    const from = fromTile(dialog);
    dialog.animate(
      [
        { transform: from, clipPath: HEXAGON, opacity: 0.5 },
        { transform: 'none', clipPath: RECTANGLE, opacity: 1 },
      ],
      { duration: OPEN_MS, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
    );
    // The text fades in once the panel has mostly opened, so it's never seen squashed
    dialog.querySelector('.dialog-content')?.animate(
      [{ opacity: 0 }, { opacity: 0, offset: 0.45 }, { opacity: 1 }],
      { duration: OPEN_MS, easing: 'ease-out' },
    );
    // Opening is once per mount; the origin doesn't change while it's open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => {
    const dialog = ref.current;
    if (!dialog || closing.current) return;
    closing.current = true;
    dialog.classList.add('is-closing');
    const finish = () => { dialog.close(); onClosed(); };
    if (reducedMotion()) {
      dialog.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150 }).onfinish = finish;
      return;
    }
    const to = fromTile(dialog);
    dialog.querySelector('.dialog-content')?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: CLOSE_MS * 0.4, fill: 'forwards' });
    dialog.animate(
      [
        { transform: 'none', clipPath: RECTANGLE, opacity: 1 },
        { transform: to, clipPath: HEXAGON, opacity: 0 },
      ],
      { duration: CLOSE_MS, easing: 'cubic-bezier(0.5, 0, 0.75, 0)', fill: 'forwards' },
    ).onfinish = finish;
  };

  // Esc runs the closing animation instead of closing at once (handled on keydown: the
  // browser doesn't always let a page cancel the dialog's own Esc). If the browser closes
  // the dialog anyway, it's cleaned up all the same.
  useEffect(() => {
    const dialog = ref.current!;
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); close(); } };
    const onCancel = (e: Event) => { e.preventDefault(); close(); };
    const onClose = () => { if (!closing.current) onClosed(); };
    dialog.addEventListener('keydown', onKeyDown);
    dialog.addEventListener('cancel', onCancel);
    dialog.addEventListener('close', onClose);
    return () => {
      dialog.removeEventListener('keydown', onKeyDown);
      dialog.removeEventListener('cancel', onCancel);
      dialog.removeEventListener('close', onClose);
    };
  });

  return (
    <dialog
      ref={ref}
      className={`tile-dialog ${details.wide ? 'is-wide' : ''}`}
      aria-labelledby="tile-dialog-title"
      // A click on the dimmed backdrop lands on the dialog itself; inside, on its content
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div className="dialog-content">
        <button type="button" className="dialog-close" onClick={close} aria-label="Close">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
        <header className="dialog-header">
          {tile.icon && <div className="tile-icon" style={{ '--bg': tile.color, '--icon': '56px' } as CSSProperties}>{tile.icon}</div>}
          <div>
            <h2 id="tile-dialog-title" className="dialog-title">{tile.title}</h2>
            {details.facts.map((fact) => <p key={fact} className="dialog-fact">{fact}</p>)}
          </div>
        </header>
        {tile.badge && (
          <p className="tile-badge dialog-badge" style={{ '--badge': tile.badge.color } as CSSProperties}>{tile.badge.label}</p>
        )}
        <div className="prose dialog-body" dangerouslySetInnerHTML={{ __html: details.html }} />
        {links.length > 0 && (
          <div className="dialog-links">
            {links.map(({ label, ...link }) => <SmartLink key={link.href} {...link} className="hex-button">{label}</SmartLink>)}
          </div>
        )}
      </div>
    </dialog>
  );
}
