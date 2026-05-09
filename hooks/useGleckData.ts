/**
 * useGleckData.ts — Fetches Gleck notices and settings from Strapi.
 *
 * Makes two API calls on mount:
 * 1. GET /api/gleck-notices — active notices sorted by order
 * 2. GET /api/gleck-setting — widget configuration (know more link/text)
 *
 * Returns default fallback values if Strapi is unreachable.
 */

import { useState, useEffect } from 'react';

import { STRAPI_URL } from '@/lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────

/** A single notice item from the Gleck CMS */
interface Notice {
  id: number;
  /** HTML-formatted notice text (sanitized before rendering) */
  text: string;
  /** Optional URL — makes the entire notice clickable */
  link?: string;
  /** Display order (lower = shown first) */
  order: number;
}

/** Widget configuration from the Gleck CMS */
interface Settings {
  /** URL for the "know more" link at the bottom of the widget */
  knowMoreLink: string;
  /** Display text for the "know more" link */
  knowMoreText: string;
}

/** Shape of the raw Strapi notice response item */
interface StrapiNoticeItem {
  id: number;
  text?: string;
  link?: string;
  order?: number;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useGleckData() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [settings, setSettings] = useState<Settings>({
    knowMoreLink: '#',
    knowMoreText: 'Updates are managed by my AI Assistant, Gleck. Click here to know more.'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch active notices, sorted by display order
        const noticesRes = await fetch(
          `${STRAPI_URL}/api/gleck-notices?filters[active][$eq]=true&sort=order:asc`
        );
        const noticesData = await noticesRes.json();

        if (noticesData.data) {
          setNotices(
            noticesData.data.map((item: StrapiNoticeItem) => ({
              id: item.id,
              text: item.text || '',
              link: item.link || undefined,
              order: item.order || 0
            }))
          );
        }

        const settingsRes = await fetch(`${STRAPI_URL}/api/gleck-setting`);
        const settingsData = await settingsRes.json();

        if (settingsData.data) {
          setSettings({
            knowMoreLink: settingsData.data.knowMoreLink || '#',
            knowMoreText:
              settingsData.data.knowMoreText ||
              'Updates are managed by my AI Assistant, Gleck. Click here to know more.'
          });
        }
      } catch (error) {
        console.error('Failed to fetch Gleck data:', error);
      }
    };

    fetchData();
  }, []);

  return { notices, settings };
}
