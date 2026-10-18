'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { navigationContent } from '@/lib/constants';

import { useTypewriter } from '@/hooks/useTypewriter';

import Footer from '@/components/Footer';
import type { HomeMessage } from '@/types';

export default function HomeMobile({ messages }: { messages: HomeMessage[] }) {
  const router = useRouter();
  const { text, currentMessage } = useTypewriter(messages || []);

  const handleNavigate = (e: React.MouseEvent, href: string, external: boolean) => {
    e.preventDefault();
    if (external) {
      window.open(href, '_blank');
      return;
    }
    router.push(href);
  };

  const navItems = Object.entries(navigationContent).map(([key, nav]) => ({
    key,
    ...nav
  }));

  return (
    <main className="relative w-full min-h-screen">
      {/* Mobile Header — typewriter title */}
      <div className="mobile-header">
        <h1
          onClick={() => {
            if (currentMessage?.link) window.open(currentMessage.link, '_blank');
          }}
          className={`text-white font-bold text-xl ${currentMessage?.link ? 'cursor-pointer' : ''}`}
          style={{
            fontFamily: "'Inter', sans-serif",
            textShadow: '0 2px 8px rgba(0,0,0,0.7)',
            borderRight: '2px solid white',
            animation: 'blink-cursor 0.75s step-end infinite',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
          }}
        >
          {text}
        </h1>
      </div>

      {/* Mobile Nav Cards */}
      <div className="mobile-scroll">
        {navItems.map((nav, index) => (
          <div
            key={nav.key}
            className="mobile-glass-card"
            onClick={(e) => handleNavigate(e, nav.href, nav.external)}
            style={{
              animation: `fadeInUp 0.4s ease-out forwards ${index * 60}ms`,
              opacity: 0
            }}
          >
            {/* Icon */}
            <div
              className="mobile-icon"
              style={{
                backgroundColor: nav.color
              }}
            >
              <div className="w-6 h-6 text-white flex items-center justify-center">
                {nav.svg}
              </div>
            </div>

            {/* Text */}
            <div className="mobile-card-text">
              <div className="mobile-card-title">{nav.text}</div>
              <div className="mobile-card-desc">{nav.description}</div>
            </div>

            {/* Arrow */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 opacity-40">
              <path d="M6 3L11 8L6 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        ))}
      </div>

      {/* Mobile Footer */}
      <Footer variant="minimal" className="w-full text-center py-6 mt-4 opacity-70" />
    </main>
  );
}
