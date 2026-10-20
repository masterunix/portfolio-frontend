import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono } from 'next/font/google';

import './globals.css';
import './site.css';
import Feedback from '@/components/Feedback';
import Gleck from '@/components/Gleck';
import ShaderBackground from '@/components/ShaderBackground';
import BrowserNotice from '@/components/BrowserNotice';
import CompatToggle from '@/components/CompatToggle';
import { SiteProvider } from '@/components/Footer';
import { COMPAT_SCRIPT } from '@/lib/compat';
import { getBackground, getGleck, getSite, getSummary } from '@/lib/content';
import { baseOpenGraph } from '@/lib/metadata';

const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export function generateMetadata(): Metadata {
  const { url, title, description } = getSite();
  const name = getSummary().title;
  return {
    metadataBase: new URL(url),
    title: { default: title, template: `%s | ${name}` },
    description,
    applicationName: name,
    authors: [{ name, url }],
    creator: name,
    alternates: { canonical: '/' },
    openGraph: { ...baseOpenGraph(), title, description, url: '/' },
    twitter: { card: 'summary_large_image', title, description },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
    // A hexagon drawn in SVG (public/icon.svg); favicon.ico and the PNGs are rendered from it
    icons: {
      icon: [{ url: '/icon.svg', type: 'image/svg+xml' }, { url: '/favicon.ico', sizes: '16x16 32x32 48x48' }],
      apple: { url: '/apple-icon.png', sizes: '180x180' },
    },
    category: 'technology',
  };
}

export const viewport: Viewport = {
  themeColor: '#000000',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // The compatibility script may set data-compat on <html> before React hydrates
    <html lang="en" className={mono.variable} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: COMPAT_SCRIPT }} />
        <SiteProvider footer={getSite().footer} version={getSite().version}>
          <ShaderBackground background={getBackground()} />
          <Gleck gleck={getGleck()} />
          <div className="corner-right">
            <CompatToggle compatibility={getSite().compatibility} />
            <Feedback feedback={getSite().feedback} />
          </div>
          <BrowserNotice html={getSite().firefoxNotice} />
          <div className="page">{children}</div>
        </SiteProvider>
      </body>
    </html>
  );
}
