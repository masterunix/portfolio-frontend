/**
 * MobileList.tsx: The narrow-screen layout: a header and a list of glass cards, one
 * per Tile. Rendered on the server, so it's also what search engines read.
 *
 * With more than one section (Experience / Skills), tabs switch between them.
 */
'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';

import BackArrow from '@/components/BackArrow';
import Footer from '@/components/Footer';
import { DetailsTile, ReadMore } from '@/components/TileDialog';
import { SmartLink } from '@/components/transition';
import type { Tile } from '@/lib/tiles';

interface MobileListProps {
  /** The page title; `header` replaces it */
  title?: string;
  header?: ReactNode;
  /** Where ← Back goes; null for no back link */
  back?: string | null;
  sections: Array<{ label?: string; tiles: Tile[] }>;
}

export default function MobileList({ title, header, back = '/', sections }: MobileListProps) {
  const [active, setActive] = useState(0);
  const tiles = sections[active]?.tiles ?? [];
  const tabbed = sections.length > 1;

  return (
    <main className="mobile-page">
      <div className="mobile-header">
        {back !== null && <Link href={back} className="mobile-back"><BackArrow />Back</Link>}
        {header ?? <h1 className="mobile-title">{tabbed ? sections[active].label : title}</h1>}
        {tabbed && (
          <div className="mobile-tabs" role="tablist">
            {sections.map((section, i) => (
              <button key={section.label} role="tab" aria-selected={i === active} onClick={() => setActive(i)}>
                {section.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <ul className="mobile-list">
        {tiles.map((tile, i) => <MobileCard key={tile.key} tile={tile} index={i} />)}
      </ul>

      <Footer short className="mobile-footer" />
    </main>
  );
}

function MobileCard({ tile, index }: { tile: Tile; index: number }) {
  // A link card is one compact row; other cards give the description its own line
  const description = tile.description && <div className="mobile-card-desc">{tile.description}</div>;
  const content = (
    <>
      <div className="mobile-card-row">
        {tile.icon && <div className={tile.pulse ? 'tile-icon is-pulsing' : 'tile-icon'} style={{ '--bg': tile.color } as CSSProperties}>{tile.icon}</div>}
        <div className="mobile-card-text">
          <div className="mobile-card-title">{tile.title}</div>
          {tile.meta && <div className="mobile-card-meta">{tile.meta}</div>}
          {tile.badge && <div className="mobile-card-meta capitalize">{tile.badge.label}</div>}
          {tile.link && description}
            </div>
        {tile.link && <span className="mobile-card-arrow" aria-hidden="true">{tile.link.download ? '↓' : '›'}</span>}
      </div>
      {!tile.link && description}
      {(tile.details || !!tile.actions?.length) && (
        <div className="mobile-card-actions">
          {tile.details && <ReadMore label={tile.details.label} />}
          {tile.actions?.map(({ label, ...action }) => (
            <SmartLink key={action.href} {...action} className="hex-button">{label}</SmartLink>
          ))}
        </div>
      )}
    </>
  );

  const style = { '--i': index } as CSSProperties;
  if (tile.details) return <li style={style} className="mobile-card-item"><DetailsTile tile={tile} className="mobile-card">{content}</DetailsTile></li>;
  if (!tile.link) return <li className="mobile-card" style={style}>{content}</li>;
  const { label, ...link } = tile.link;
  return (
    <li style={style} className="mobile-card-item">
      <SmartLink {...link} className="mobile-card" aria-label={label === tile.title ? undefined : `${label}: ${tile.title}`}>
        {content}
      </SmartLink>
    </li>
  );
}
