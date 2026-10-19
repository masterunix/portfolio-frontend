/**
 * Hexagon.tsx: A glass hexagon at a fixed spot, waving in after `delay` seconds and
 * out after `exitDelay` once the page leaves (CSS: .hex in globals.css).
 */
import type { CSSProperties, ReactNode } from 'react';

import HexShell from '@/components/HexShell';

interface HexagonProps {
  delay: number;
  exitDelay: number;
  /** left, top, width, height */
  style: CSSProperties;
  children?: ReactNode;
}

export default function Hexagon({ delay, exitDelay, style, children }: HexagonProps) {
  return (
    <div className="hex" style={{ ...style, '--in-delay': `${delay}s`, '--out-delay': `${exitDelay}s` } as CSSProperties}>
      <HexShell>{children}</HexShell>
    </div>
  );
}
