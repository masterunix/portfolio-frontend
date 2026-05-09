'use client';

import React from 'react';
import Hexagon from './Hexagon';
import { adjustColor } from '@/lib/utils';

interface NavHexagonProps {
  /** SVG icon as JSX ReactNode — fill="currentColor" icons inherit white */
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  delay?: number;
  style?: React.CSSProperties;
  isExiting?: boolean;
}

/**
 * NavHexagon — a navigation tile for the home grid.
 *
 * Pure presentational component with no Link/a wrapper.
 * Navigation is owned by the consumer (HomeClient) so exit animations
 * can run before the route changes.
 */
export default function NavHexagon({
  icon,
  title,
  description,
  color,
  delay = 0,
  style,
  isExiting = false
}: NavHexagonProps) {
  return (
    <Hexagon 
      delay={delay} 
      className="transition-all duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:scale-105 hover:z-10 hover:brightness-110" 
      style={style} 
      isExiting={isExiting}
    >
      {/*
        Content centered within the hex — mirrors legacy hex-content:
        position:absolute;inset:0;display:flex;flex-direction:column;
        align-items:center;justify-content:center;gap:8px;padding:16px
      */}
      {/* Content wrapper — centered flex column */}
      <div className="hex-content pointer-events-none group">

        {/* Icon box — 62×62px gradient rounded square */}
        <div
          className="w-[62px] h-[62px] rounded-[12px] flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:scale-110 shrink-0"
          style={{
            background: `linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -20)} 100%)`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}
        >
          <div className="w-[38px] h-[38px] flex items-center justify-center" style={{ width: '38px', height: '38px' }}>
            {React.isValidElement(icon) 
              ? React.cloneElement(icon as React.ReactElement<any>, {
                  style: { width: '100%', height: '100%', display: 'block' }
                })
              : icon
            }
          </div>
        </div>

        {/* Title — 13px bold */}
        <div className="text-[13px] font-bold text-white text-center leading-[1.2] shrink-0">
          {title}
        </div>

        {/* Description — 10px muted */}
        <div className="text-[10px] text-white/80 text-center leading-[1.3] max-w-[140px] shrink-0">
          {description}
        </div>

      </div>
    </Hexagon>
  );
}
