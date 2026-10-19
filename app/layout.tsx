import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';
import './site.css';
import Gleck from '@/components/Gleck';
import ShaderBackground from '@/components/ShaderBackground';
import { SiteProvider } from '@/components/Footer';
import { getBackground, getGleck, getSite } from '@/lib/content';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export function generateMetadata(): Metadata {
  const { title, description } = getSite();
  return {
    title: { default: title, template: '%s | Vatsal Goyal' },
    description,
    icons: { icon: '/icon.png' },
  };
}

export const viewport: Viewport = {
  themeColor: '#000000',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <SiteProvider footer={getSite().footer} version={getSite().version}>
          <ShaderBackground background={getBackground()} />
          <Gleck gleck={getGleck()} />
          <div className="page">{children}</div>
        </SiteProvider>
      </body>
    </html>
  );
}
