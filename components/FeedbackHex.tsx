'use client';

import React from 'react';
import { adjustColor } from '@/lib/utils';

interface FeedbackHexProps {
  feedbackData: {
    domain: string;
    description: string;
    email: string;
    color: string;
    icon: string;
  };
  onSendEmail: (e: React.MouseEvent) => void;
}

/**
 * FeedbackHex — displays a feedback tile with email button.
 * 
 * Pure presentational component that receives data and callbacks.
 * No business logic - just renders the UI.
 */
export default function FeedbackHex({ feedbackData, onSendEmail }: FeedbackHexProps) {
  return (
    <div className="hex-content pointer-events-auto transition-transform duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ">
      {/* Feedback Icon */}
      <div 
        className="w-[50px] h-[50px] rounded-[12px] flex items-center justify-center text-2xl shadow-lg shrink-0 transition-transform duration-300 group-hover:scale-110"
        style={{ 
          background: `linear-gradient(135deg, ${feedbackData.color} 0%, ${adjustColor(feedbackData.color, -20)} 100%)`,
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
        className="bg-gradient-to-br from-[#00d2d3] to-[#00a8a9] text-white border-none px-3.5 py-1.5 rounded-md text-[10px] font-semibold cursor-pointer shadow-md transition-all duration-300 mt-1 shrink-0 hover:brightness-110 active:scale-95"
        onClick={onSendEmail}
        aria-label="Send feedback email"
      >
        Send Email
      </button>
    </div>
  );
}
