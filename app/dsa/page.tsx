import type { Metadata } from 'next';
import DSAClient from './DSAClient';
import { getDSAPlatforms } from '@/lib/content';

export const metadata: Metadata = {
  title: 'DSA Stats | Vatsal Goyal',
  description: 'My competitive programming profiles and data structures & algorithms achievements across Codeforces, LeetCode, and more.',
};

export default function DSAPage() {
  return <DSAClient platforms={getDSAPlatforms()} />;
}
