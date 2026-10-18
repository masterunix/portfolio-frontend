'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import Footer from '@/components/Footer';
import ItemIcon from '@/components/ItemIcon';
import type { Skill } from '@/types';

interface SkillsMobileProps {
  careerSkills: Skill[];
  topSkills: Skill[];
  bottomSkills: Skill[];
}

export default function SkillsMobile({ careerSkills, topSkills, bottomSkills }: SkillsMobileProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<'experience' | 'skills'>('experience');

  const handleBack = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/');
  }, [router]);

  const experienceItems = careerSkills;
  const skillItems = [...topSkills, ...bottomSkills];
  const hasSubSections = experienceItems.length > 0 && skillItems.length > 0;

  const renderSkillCard = (skill: Skill, index: number) => (
    <div
      key={skill.id}
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
          style={{ backgroundColor: skill.color }}
        >
          <ItemIcon logo={skill.logo} icon={<span className="text-xl">{skill.icon || '📦'}</span>} alt={skill.name} size={28} />
        </div>
        <div className="mobile-card-text">
          <div className="mobile-card-title">{skill.name}</div>
          {skill.category && <div className="mobile-card-meta capitalize">{skill.category}</div>}
        </div>
      </div>

      <div className="mobile-card-desc" style={{ marginTop: '8px' }}>{skill.description}</div>

      {skill.attachments.length > 0 && (
        <div className="mobile-card-actions">
          {skill.attachments
            .map((att) => (
              <button key={att.id} className="hex-button"
                onClick={() => window.open(att.file.url, '_blank')}>
                {att.label}
              </button>
            ))}
        </div>
      )}
    </div>
  );

  return (
    <main className="relative w-full min-h-screen">
      <div className="mobile-header">
        <Link href="/" onClick={handleBack} className="mobile-back">← Back</Link>
        <h1 className="text-white font-bold text-xl mt-3" style={{ fontFamily: "'Inter', sans-serif" }}>
          {activeCategory === 'experience' ? 'Experience' : 'Skills'}
        </h1>
        {hasSubSections && (
          <div className="flex gap-4 mt-4 w-full">
            <button
              className={`hex-button flex-1 py-2 text-sm ${activeCategory === 'experience' ? 'bg-white text-black' : 'bg-transparent text-white'}`}
              onClick={() => setActiveCategory('experience')}
            >
              Experience
            </button>
            <button
              className={`hex-button flex-1 py-2 text-sm ${activeCategory === 'skills' ? 'bg-white text-black' : 'bg-transparent text-white'}`}
              onClick={() => setActiveCategory('skills')}
            >
              Skills
            </button>
          </div>
        )}
      </div>

      <div className="mobile-scroll" style={{ paddingTop: hasSubSections ? '140px' : '100px' }}>
        {activeCategory === 'experience' ? (
          experienceItems.map((skill, i) => renderSkillCard(skill, i))
        ) : (
          skillItems.map((skill, i) => renderSkillCard(skill, i))
        )}
      </div>

      <Footer variant="minimal" className="w-full text-center py-6 mt-4 opacity-70" />
    </main>
  );
}
