/**
 * FeedbackHex.tsx — Feedback tile with email button.
 *
 * Used on the Resumes page as a special tile that lets visitors
 * send feedback via email. Renders inside a parent <Hexagon> component
 * (the hex shell is provided by the parent).
 *
 * Pure presentational — receives data and callbacks, no business logic.
 */
'use client';

import React from 'react';


// ─── Props ───────────────────────────────────────────────────────────────────

interface FeedbackHexProps {
  feedbackData: {
    domain: string;
    description: string;
    email: string;
    color: string;
    icon: string;
  };
  /** Click handler for the "Send Email" button — opens mail client */
  onSendEmail: (e: React.MouseEvent) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function FeedbackHex({ feedbackData, onSendEmail }: FeedbackHexProps) {
  return (
    <div className="hex-content pointer-events-auto">
      {/* Feedback Icon — gradient rounded square */}
      <div 
        className="w-[50px] h-[50px] rounded-[12px] flex items-center justify-center text-2xl shadow-lg shrink-0 transition-transform duration-300 group-hover:scale-110"
        style={{ 
          backgroundColor: feedbackData.color,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
      >
        {feedbackData.icon}
      </div>

      {/* Feedback Title */}
      <div className="text-[13px] font-bold text-white text-center mt-1 shrink-0">
        {feedbackData.domain}
      </div>

      {/* Description */}
      <div className="text-[10px] text-white/80 text-center mb-1 shrink-0">
        {feedbackData.description}
      </div>

      {/* Email Button */}
      <button 
        className="hex-button mt-2"
        onClick={onSendEmail}
        aria-label="Send feedback email"
      >
        Send Email
      </button>
    </div>
  );
}
