import { useState, useEffect } from 'react';

const STRAPI = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

interface Notice {
  id: number;
  text: string;
  link?: string;
  order: number;
}

interface Settings {
  knowMoreLink: string;
  knowMoreText: string;
}

/**
 * useGleckData — Fetches Gleck notices and settings from Strapi
 * 
 * @returns Object containing notices array and settings object
 */
export function useGleckData() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [settings, setSettings] = useState<Settings>({
    knowMoreLink: '#',
    knowMoreText: 'Updates are managed by my AI Assistant, Gleck. Click here to know more.'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch active notices
        const noticesRes = await fetch(
          `${STRAPI}/api/gleck-notices?filters[active][$eq]=true&sort=order:asc`
        );
        const noticesData = await noticesRes.json();

        if (noticesData.data) {
          setNotices(
            noticesData.data.map((item: any) => ({
              id: item.id,
              text: item.text || '',
              link: item.link || undefined,
              order: item.order || 0
            }))
          );
        }

        // Fetch settings
        const settingsRes = await fetch(`${STRAPI}/api/gleck-setting`);
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
