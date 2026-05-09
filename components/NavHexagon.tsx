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
  style
}: NavHexagonProps) {
  return (
    <Hexagon delay={delay} className="group cursor-pointer" style={style}>
      {/*
        Content centered within the hex — mirrors legacy hex-content:
        position:absolute;inset:0;display:flex;flex-direction:column;
        align-items:center;justify-content:center;gap:8px;padding:16px
      */}
      <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center gap-2 p-4 z-10">

        {/*
          Icon box — 56×56px gradient rounded square.
          text-white ensures SVG fill="currentColor" paths render white.
          Matches legacy: width:56px;height:56px;border-radius:12px
        */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:scale-110 shrink-0"
          style={{
            background: `linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -20)} 100%)`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}
        >
          {icon}
        </div>

        {/* Title — 13px semibold, matches legacy font-size:13px;font-weight:600 */}
        <span className="text-[13px] font-semibold text-white text-center leading-tight">
          {title}
        </span>

        {/* Description — 10px muted, matches legacy font-size:10px;opacity:0.8 */}
        <span className="text-[10px] text-white/80 text-center leading-snug">
          {description}
        </span>

      </div>
    </Hexagon>
  );
}
