import HexPage from '@/components/HexPage';
import Honeycomb from '@/components/Honeycomb';
import MobileList from '@/components/MobileList';
import Typewriter from '@/components/Typewriter';
import { getHomeMessages } from '@/lib/content';
import { WIDE_GRID } from '@/lib/hexLayout';
import { HOME_MENU } from '@/lib/navigation';

/** The home grid's intro wave is a little slower than the other pages' */
const HOME_STAGGER = 0.06;

export default function HomePage() {
  const messages = getHomeMessages();
  return (
    <HexPage
      heading={<Typewriter messages={messages} />}
      mobile={
        <MobileList
          header={<Typewriter messages={messages} className="mobile-title" />}
          back={null}
          sections={[{ tiles: HOME_MENU.map((item) => item.tile) }]}
        />
      }
    >
      <Honeycomb grid={WIDE_GRID} cells={HOME_MENU} stagger={HOME_STAGGER} />
    </HexPage>
  );
}
