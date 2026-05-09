'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { adjustColor } from '@/lib/utils';
import { DSAPlatform } from './DSAClient';

interface DSAMobileProps {
  platforms: DSAPlatform[];
}

export default function DSAMobile({ platforms }: DSAMobileProps) {
  const router = useRouter();

  const handleBack = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/');
  }, [router]);

  return (
    <main className="relative w-full min-h-screen">
      <div className="mobile-header">
        <a href="/" onClick={handleBack} className="mobile-back">← Back</a>
        <h1 className="text-white font-bold text-xl mt-3" style={{ fontFamily: "'Inter', sans-serif" }}>
          DSA Stats
        </h1>
      </div>

      <div className="mobile-scroll" style={{ gap: '16px' }}>
        {/* Platforms */}
        {platforms.map((platform, index) => {
          return (
            <div
              key={platform.id}
              className="mobile-glass-card"
              onClick={() => window.open(platform.url, '_blank')}
              style={{ padding: '24px 20px', animation: `fadeInUp 0.4s ease-out forwards ${index * 80}ms`, opacity: 0 }}
            >
              <div
                className="mobile-icon"
                style={{ width: '56px', height: '56px', minWidth: '56px', background: `linear-gradient(135deg, ${platform.color} 0%, ${adjustColor(platform.color, -20)} 100%)` }}
              >
                <span className="text-2xl font-bold text-white">{platform.name.charAt(0)}</span>
              </div>
              <div className="mobile-card-text">
                <div className="mobile-card-title" style={{ fontSize: '17px' }}>{platform.name}</div>
                <div className="mobile-card-desc" style={{ fontSize: '13px', marginTop: '2px' }}>View profile →</div>
              </div>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 opacity-40">
                <path d="M7.5 4L13.5 10L7.5 16" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          );
        })}
      </div>

      <footer className="w-full text-center py-6 mt-4 opacity-70">
        <p className="text-[11px] text-white/50 m-0">© 2025 - 2026 Vatsal Goyal. All rights reserved.</p>
      </footer>
    </main>
  );
}
