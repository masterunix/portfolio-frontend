/**
 * HexShell.tsx — The glass hexagon: a frosted blur layer, the outline, and a slot for
 * the tile's content. Hexagon and CarouselHex wrap it with position and animation.
 *
 * An ancestor with opacity < 1 switches off the glass blur until the fade ends. So a
 * hex fades in by animating `--hex-fade` (0–1) on a wrapper, which the blur, outline
 * and .hex-content each read (globals.css): the glass fades in with the outline. It
 * fades out with real `opacity` on purpose: the blur drops off the moment it starts
 * leaving, which makes the exit sweep. Timing: lib/hexTransition.ts.
 */
'use client';

import type { ReactNode } from 'react';

import { useIsExiting } from '@/components/transition';

/** The rounded hexagon, in a 190 × 212 viewBox; the blur's clip-path traces it (globals.css) */
const HEX_PATH =
  'M85.5 3.63965C91.3786 0.245625 98.6214 0.245625 104.5 3.63965L178.896 46.5928C184.775 49.9868 188.396 56.2589 188.396 63.0469V148.953C188.396 155.741 184.775 162.013 178.896 165.407L104.5 208.36C98.805 211.648 91.8296 211.751 86.0547 208.669L85.5 208.36L11.1035 165.407C5.22494 162.013 1.60356 155.741 1.60352 148.953V63.0469C1.60356 56.2589 5.22493 49.9868 11.1035 46.5928L85.5 3.63965Z';

export default function HexShell({ children }: { children?: ReactNode }) {
  // While the outro plays, nothing in the hex can be clicked or focused
  const inert = useIsExiting();

  return (
    <div className="hex-shell group" inert={inert}>
      <div className="hex-glass-blur" />
      <svg viewBox="0 0 190 212" preserveAspectRatio="none" className="hex-outline" aria-hidden="true">
        <path d={HEX_PATH} />
      </svg>
      {children}
    </div>
  );
}
