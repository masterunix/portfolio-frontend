import HomeClient from './HomeClient';
import { getHomeMessages } from '@/lib/content';

export default function Home() {
  return <HomeClient messages={getHomeMessages()} />;
}
