/**
 * ResumeHex.tsx — Resume tile with a download (or open) button.
 *
 * Used on the Resumes page inside a parent <Hexagon> component.
 * Displays resume domain info and one button: Download when the resume has a file,
 * Open when it has a link instead, and none when it has neither.
 *
 * Pure presentational — receives data and callbacks, no business logic.
 * The actual download/open is handled by ResumesClient.
 */
'use client';

import React from 'react';

import type { Resume } from '@/types';

// ─── Props ───────────────────────────────────────────────────────────────────

interface ResumeHexProps {
  resume: Resume;
  /** Click handler for the Download/Open button */
  onOpen: (e: React.MouseEvent) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ResumeHex({ resume, onOpen }: ResumeHexProps) {
  const action = resume.file ? 'Download' : resume.link ? 'Open' : null;

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

      {/* Download/Open Button */}
      {action && (
        <button
          className="hex-button mt-2"
          onClick={onOpen}
          aria-label={`${action} ${resume.domain}${resume.file ? ' resume' : ''}`}
        >
          {action}
        </button>
      )}
    </div>
  );
}
