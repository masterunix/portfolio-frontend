/**
 * opengraph-image.tsx — The picture link previews show (LinkedIn, X, WhatsApp, Slack…),
 * drawn at build time from content/summary.md: the name, the tagline and the address,
 * in JetBrains Mono over the site's colours. Every page uses it unless it sets its own.
 */
import { ImageResponse } from 'next/og';

import { getSite, getSummary } from '@/lib/content';

export const alt = 'Vatsal Goyal, full-stack developer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** JetBrains Mono from Google Fonts, just the letters used; the default font if that fails */
async function loadFont(weight: number, text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@${weight}&text=${encodeURIComponent(text)}`)).text();
    const url = /src: url\((.+?)\) format\('(?:opentype|truetype)'\)/.exec(css)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

/** A pointy-top hexagon outline, as an SVG path, centred on (x, y) */
function hexPath(x: number, y: number, r: number): string {
  const points = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return `${(x + r * Math.cos(a)).toFixed(1)},${(y + r * Math.sin(a)).toFixed(1)}`;
  });
  return `M${points.join('L')}Z`;
}

export default async function OpenGraphImage() {
  const { title: name, tagline = '', jobTitle = '' } = getSummary();
  const host = new URL(getSite().url).host.replace(/^www\./, '');
  const text = `${name}${tagline}${jobTitle}${host}`;
  const [bold, regular] = await Promise.all([loadFont(700, text), loadFont(400, text)]);

  // A honeycomb drifting off the right edge, like the site's pages
  const hexes: string[] = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 4; col++) {
      hexes.push(hexPath(760 + col * 150 + (row % 2) * 75, 40 + row * 130, 82));
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: '#05050a',
          color: '#e4e4ea',
          fontFamily: bold ? 'JetBrains Mono' : undefined,
        }}
      >
        <div style={{ position: 'absolute', left: -160, top: -220, width: 700, height: 700, borderRadius: 9999, background: 'radial-gradient(circle, rgba(118,75,162,0.55), rgba(118,75,162,0) 70%)', display: 'flex' }} />
        <div style={{ position: 'absolute', right: -120, bottom: -260, width: 760, height: 760, borderRadius: 9999, background: 'radial-gradient(circle, rgba(240,147,251,0.35), rgba(240,147,251,0) 70%)', display: 'flex' }} />
        <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: 'absolute', left: 0, top: 0 }}>
          {hexes.map((d) => <path key={d} d={d} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />)}
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 80px', width: 820 }}>
          <div style={{ fontSize: 26, color: '#b4a8ff', letterSpacing: 2, textTransform: 'uppercase', display: 'flex' }}>{jobTitle}</div>
          <div style={{ fontSize: 84, fontWeight: 700, color: '#ffffff', marginTop: 18, lineHeight: 1.05, display: 'flex' }}>{name}</div>
          <div style={{ fontSize: 30, marginTop: 28, lineHeight: 1.4, color: 'rgba(228,228,234,0.85)', display: 'flex' }}>{tagline}</div>
          <div style={{ fontSize: 26, marginTop: 44, color: '#ffffff', display: 'flex' }}>{host}</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        ...(bold ? [{ name: 'JetBrains Mono', data: bold, weight: 700 as const, style: 'normal' as const }] : []),
        ...(regular ? [{ name: 'JetBrains Mono', data: regular, weight: 400 as const, style: 'normal' as const }] : []),
      ],
    },
  );
}
