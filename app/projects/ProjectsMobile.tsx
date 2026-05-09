'use client';

import React, { useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


import Footer from '@/components/Footer';
import type { Project } from '@/types';
import { isPlaceholderLink } from '@/types';

interface ProjectsMobileProps {
  projects: Project[];
}

export default function ProjectsMobile({ projects = [] }: ProjectsMobileProps) {
  const router = useRouter();

  const handleBack = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/');
  }, [router]);

  return (
    <main className="relative w-full min-h-screen">
      <div className="mobile-header">
        <Link href="/" onClick={handleBack} className="mobile-back">← Back</Link>
        <h1 className="text-white font-bold text-xl mt-3" style={{ fontFamily: "'Inter', sans-serif" }}>
          My Projects & Work
        </h1>
      </div>

      <div className="mobile-scroll">
        {projects.map((project, index) => (
          <div
            key={project.id}
            className="mobile-glass-card"
            style={{
              flexDirection: 'column',
              alignItems: 'flex-start',
              animation: `fadeInUp 0.4s ease-out forwards ${index * 60}ms`,
              opacity: 0
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
              <div
                className="mobile-icon"
                style={{ backgroundColor: project.color }}
              >
                <span className="text-xl">{project.icon || '📦'}</span>
              </div>
              <div className="mobile-card-text">
                <div className="mobile-card-title">{project.title}</div>
                <div className="mobile-card-meta">{project.tech}</div>
              </div>
            </div>

            <div className="mobile-card-desc" style={{ marginTop: '8px' }}>{project.description}</div>

            <div className="mobile-card-actions">
              {!isPlaceholderLink(project.github) && (
                <button className="hex-button pointer-events-auto" onClick={(e) => {
                  e.stopPropagation();
                  window.open(project.github!, '_blank', 'noopener,noreferrer');
                }}>
                  GitHub
                </button>
              )}
              {!isPlaceholderLink(project.visit) && (
                <button className="hex-button pointer-events-auto" onClick={(e) => {
                  e.stopPropagation();
                  const url = project.visit!;
                  if (url.startsWith('/')) router.push(url);
                  else window.open(url.startsWith('http') ? url : `https://${url}`, '_blank', 'noopener,noreferrer');
                }}>
                  Visit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Footer variant="minimal" className="w-full text-center py-6 mt-4 opacity-70" />
    </main>
  );
}
