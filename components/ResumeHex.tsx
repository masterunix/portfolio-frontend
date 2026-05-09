/**
 * ResumeHex.tsx — Resume tile with download button.
 *
 * Used on the Resumes page inside a parent <Hexagon> component.
 * Displays resume domain info and a download button.
 *
 * Pure presentational — receives data and callbacks, no business logic.
 * The actual download mechanism is handled by ResumesClient.
 */
'use client';

import React from 'react';


// ─── Props ───────────────────────────────────────────────────────────────────

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
  /** Click handler for the download button */
  onDownload: (e: React.MouseEvent) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ResumeHex({ resume, onDownload }: ResumeHexProps) {
  return (
    <div className="hex-content pointer-events-auto">
      {/* Resume Icon — gradient rounded square */}
      <div 
        className="w-[50px] h-[50px] rounded-[12px] flex items-center justify-center text-2xl shadow-lg shrink-0 transition-transform duration-300 group-hover:scale-110"
        style={{ 
          backgroundColor: resume.color,
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
