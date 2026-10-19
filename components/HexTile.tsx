/**
 * HexTile.tsx: A Tile (lib/tiles) inside a glass hexagon.
 *
 * A tile with a `link` is one big link, with its label shown as a button; a tile
 * with `actions` has a button for each; a tile with `details` opens them in a popup
 * when clicked (TileDialog).
 */
import type { CSSProperties } from 'react';

import { DetailsTile, ReadMore } from '@/components/TileDialog';
import { SmartLink } from '@/components/transition';
import type { Tile } from '@/lib/tiles';

export default function HexTile({ tile }: { tile: Tile }) {
  const size = tile.size ?? 'md';
  const content = (
    <>
      {tile.icon && <div className={tile.pulse ? 'tile-icon is-pulsing' : 'tile-icon'} style={{ '--bg': tile.color } as CSSProperties}>{tile.icon}</div>}
      <div className="tile-title">{tile.title}</div>
      {tile.meta && <div className="tile-meta">{tile.meta}</div>}
      {tile.description && <div className="tile-desc">{tile.description}</div>}
      {tile.details && <ReadMore label={tile.details.label} />}
      {tile.badge && (
        <div className="tile-badge" style={{ '--badge': tile.badge.color } as CSSProperties}>{tile.badge.label}</div>
      )}
      {tile.link && size !== 'lg' && <div className="hex-button">{tile.link.label}</div>}
      {!!tile.actions?.length && (
        <div className="tile-actions">
          {tile.actions.map(({ label, ...action }) => (
            <SmartLink key={action.href} {...action} className="hex-button">{label}</SmartLink>
          ))}
        </div>
      )}
    </>
  );

  const className = `hex-content tile tile-${size}`;
  if (tile.details) return <DetailsTile tile={tile} className={className}>{content}</DetailsTile>;
  if (!tile.link) return <div className={className}>{content}</div>;
  const { label, ...link } = tile.link;
  return <SmartLink {...link} className={className} aria-label={label === tile.title ? undefined : `${label}: ${tile.title}`}>{content}</SmartLink>;
}
