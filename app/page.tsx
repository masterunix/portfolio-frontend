import HomeClient from './HomeClient';
import { getHomeMessages } from '@/lib/api';

export default async function Home() {
  let messages = [];
  
  try {
    messages = await getHomeMessages();
    if (!messages || messages.length === 0) {
      throw new Error('No messages found in Strapi');
    }
  } catch (error) {
    console.warn('Failed to fetch home messages (Strapi might be down):', error);
    messages = [
      { id: 1, text: "Hi! I am Vatsal. See what I'm working on.", order: 0 }
    ];
  }

  return <HomeClient messages={messages} />;
}
