import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';
import Gleck from '@/components/Gleck';
import ShaderBackground from '@/components/ShaderBackground';
import { getBackgroundTheme, getGleckNotices, getGleckSettings } from '@/lib/content';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Vatsal Goyal - Portfolio',
  description: 'Full-stack developer, AI/ML enthusiast, and problem solver. Explore my projects, skills, and journey.',
  icons: { icon: '/icon.png' },
};

export const viewport: Viewport = {
  themeColor: '#000000',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <ShaderBackground theme={getBackgroundTheme()} />
        <Gleck notices={getGleckNotices()} settings={getGleckSettings()} />
        <div className="page">{children}</div>
      </body>
    </html>
  );
}
