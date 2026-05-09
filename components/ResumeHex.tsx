'use client';

import React from 'react';
import { adjustColor } from '@/lib/utils';

interface ResumeHexProps {
  resume: {
    id: number;
    domain: string;
    description: string;
    filename: string;
    color: string;
    icon: string;
    order: number;
    file?: {
      url: string;
      name: string;
    };
  };
  onDownload: (e: React.MouseEvent) => void;
}

/**
 * ResumeHex — displays a single resume tile with download button.
 * 
 * Pure presentational component that receives data and callbacks.
 * No business logic - just renders the UI.
 */
export default function ResumeHex({ resume, onDownload }: ResumeHexProps) {
  return (
    <div className="hex-content pointer-events-auto transition-transform duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ">
      {/* Resume Icon */}
      <div 
        className="w-[50px] h-[50px] rounded-[12px] flex items-center justify-center text-2xl shadow-lg shrink-0 transition-transform duration-300 group-hover:scale-110"
        style={{ 
          background: `linear-gradient(135deg, ${resume.color} 0%, ${adjustColor(resume.color, -20)} 100%)`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
      >
        {resume.icon}
      </div>

      {/* Resume Domain */}
      <div className="text-[13px] font-bold text-white text-center mt-1 shrink-0">
        {resume.domain}
      </div>

      {/* Description */}
      <div className="text-[10px] text-white/80 text-center mb-0.5 shrink-0">
        {resume.description}
      </div>

      {/* Download Button */}
      <button 
        className="hex-button mt-2"
        onClick={onDownload}
        aria-label={`Download ${resume.domain} resume`}
      >
        Download
      </button>
    </div>
  );
}
