/**
 * NavHexagon.tsx — Navigation tile for the home page grid.
 *
 * Pure presentational component with no Link/a wrapper of its own.
 * Navigation is owned by the consumer (HomeClient) so exit animations
 * can run before the route changes.
 *
 * Renders inside <Hexagon> which provides the glass shell.
 * This component only provides the inner content (icon, title, description).
 */
'use client';

import React from 'react';
import Hexagon from './Hexagon';


// ─── Props ───────────────────────────────────────────────────────────────────

interface NavHexagonProps {
  /** SVG icon as JSX ReactNode — use fill="currentColor" to inherit white */
  icon: React.ReactNode;
  /** Primary label displayed below the icon */
  title: string;
  /** Short subtitle displayed below the title */
  description: string;
  /** Gradient base color (hex string, e.g. '#667eea') */
  color: string;
  /** Intro delay in seconds */
  delay?: number;
  /** Outro delay in seconds */
  exitDelay?: number;
  /** Inline positioning styles from the grid calculator */
  style?: React.CSSProperties;
  /** When true, plays the exit animation */
  isExiting?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function NavHexagon({
  icon,
  title,
  description,
  color,
  delay = 0,
  exitDelay = 0,
  style,
  isExiting = false
}: NavHexagonProps) {
  return (
    <Hexagon
      delay={delay}
      exitDelay={exitDelay}
      className="transition-all duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]" 
      style={style} 
      isExiting={isExiting}
    >
      {/* Content centered within the hex — flex column with icon, title, description */}
      <div className="hex-content pointer-events-none group">

        {/* Icon box — gradient rounded square with hover scale */}
        <div
          className="w-[62px] h-[62px] rounded-[12px] flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:scale-110 shrink-0"
          style={{
            backgroundColor: color,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}
        >
          {/* Clone icon element to force full-size rendering */}
          <div className="w-[38px] h-[38px] flex items-center justify-center" style={{ width: '38px', height: '38px' }}>
            {React.isValidElement(icon)
              ? React.cloneElement(icon as React.ReactElement<{ style?: React.CSSProperties }>, {
                  style: { width: '100%', height: '100%', display: 'block' }
                })
              : icon
            }
          </div>
        </div>

        {/* Title — 13px bold white */}
        <div className="text-[13px] font-bold text-white text-center leading-[1.2] shrink-0">
          {title}
        </div>

        {/* Description — 10px muted white */}
        <div className="text-[10px] text-white/80 text-center leading-[1.3] max-w-[140px] shrink-0">
          {description}
        </div>

      </div>
    </Hexagon>
  );
}
