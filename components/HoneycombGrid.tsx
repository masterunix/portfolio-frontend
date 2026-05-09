'use client';

import React, { ReactNode } from 'react';

interface HoneycombGridProps {
  children: ReactNode;
  className?: string;
}

export default function HoneycombGrid({ children, className = '' }: HoneycombGridProps) {
  return (
    <div className={`relative w-full h-screen overflow-hidden vignette ${className}`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="grid grid-cols-8 gap-4 relative">
          {children}
        </div>
      </div>
    </div>
  );
}
