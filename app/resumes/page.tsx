import type { Metadata } from 'next';
import ResumesClient from './ResumesClient';
import { getResumes } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Resumes | Vatsal Goyal',
  description: 'Download domain-specific resumes — full-stack, software engineering, ML, mobile, embedded, and more.',
};

export default function ResumesPage() {
  return <ResumesClient resumes={getResumes()} />;
}
