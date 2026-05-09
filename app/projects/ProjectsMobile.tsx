'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { adjustColor } from '@/lib/utils';

// ─── Constants ───────────────────────────────────────────────────────────────
const PLACEHOLDER_VALUES = ['Coming Soon', 'In Development', 'Private', 'Available on request', 'Will be deployed soon'];

interface Project {
  id: number;
  title: string;
  tech: string;
  description: string;
  icon?: string;
  color: string;
  github?: string | null;
  visit?: string | null;
}

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
        <a href="/" onClick={handleBack} className="mobile-back">← Back</a>
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
                style={{ background: `linear-gradient(135deg, ${project.color} 0%, ${adjustColor(project.color, -20)} 100%)` }}
              >
                <span className="text-xl">{project.icon || '📦'}</span>
              </div>
              <div className="mobile-card-text">
                <div className="mobile-card-title">{project.title}</div>
                <div className="mobile-card-meta">{project.tech}</div>
              </div>
            </div>

            <div className="mobile-card-desc" style={{ marginTop: '8px' }}>{project.description}</div>

            {/* Links matching Experience style */}
            {(project.github || project.visit) && (
              <div className="mobile-card-actions">
                {project.github && !PLACEHOLDER_VALUES.includes(project.github) && (
                  <button className="hex-button pointer-events-auto" onClick={() => window.open(project.github!, '_blank')}>
                    GitHub
                  </button>
                )}
                {project.visit && !PLACEHOLDER_VALUES.includes(project.visit) && (
                  <button className="hex-button pointer-events-auto" onClick={() => {
                    const url = project.visit!;
                    if (url.startsWith('/')) router.push(url);
                    else window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');
                  }}>
                    Visit
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <footer className="w-full text-center py-6 mt-4 opacity-70">
        <p className="text-[11px] text-white/50 m-0">© 2025 - 2026 Vatsal Goyal. All rights reserved.</p>
      </footer>
    </main>
  );
}
