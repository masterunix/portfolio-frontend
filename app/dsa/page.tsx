import type { Metadata } from 'next';
import DSAClient from './DSAClient';
import { getDSAPlatforms } from '@/lib/api';

export const metadata: Metadata = {
  title: 'DSA Stats | Vatsal Goyal',
  description: 'My competitive programming profiles and data structures & algorithms achievements across Codeforces, LeetCode, and more.',
};

export default async function DSAPage() {
  let platforms = [];
  
  try {
    platforms = await getDSAPlatforms();
    if (!platforms || platforms.length === 0) {
      throw new Error('No platforms found in Strapi');
    }
  } catch (error) {
    console.warn('Failed to fetch DSA platforms (Strapi might be down):', error);
    // Fallback data
    platforms = [
      { id: 1, name: 'Codeforces', url: 'https://codeforces.com/profile/vatsalgoyal05', color: '#1f8dd6', logoPath: '/logos/codeforces.png', order: 0 },
      { id: 2, name: 'LeetCode', url: 'https://leetcode.com/u/vatsalgoyal05/', color: '#ffa116', logoPath: '/logos/leetcode.png', order: 1 },
      { id: 3, name: 'HackerRank', url: 'https://www.hackerrank.com/profile/vatsalgoyal05', color: '#00ea64', logoPath: '/logos/hackerank.png', order: 2 },
      { id: 4, name: 'AtCoder', url: 'https://atcoder.jp/users/vatsalgoyal05', color: '#3f51b5', logoPath: '/logos/atcoder.png', order: 3 }
    ];
  }

  return <DSAClient platforms={platforms} />;
}
