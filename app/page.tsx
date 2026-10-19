import HexPage from '@/components/HexPage';
import JsonLd from '@/components/JsonLd';
import Honeycomb from '@/components/Honeycomb';
import MobileList from '@/components/MobileList';
import Typewriter from '@/components/Typewriter';
import { getHome, getSite } from '@/lib/content';
import { homeSchema } from '@/lib/metadata';
import { WIDE_GRID } from '@/lib/hexLayout';
import { menuTile } from '@/lib/tiles';

/** The home grid's intro wave is a little slower than the other pages' */
const HOME_STAGGER = 0.06;

export default function HomePage() {
  const { menu, messages } = getHome();
  const tiles = menu.map(menuTile);
  return (
    <>
    {/* The typewriter is decoration; this is the page's heading for search engines and screen readers */}
    <h1 className="sr-only">{getSite().title}</h1>
    <JsonLd data={homeSchema()} />
    <HexPage
      heading={<Typewriter messages={messages} />}
      mobile={
        <MobileList
          header={<Typewriter messages={messages} className="mobile-title" />}
          back={null}
          sections={[{ tiles }]}
        />
      }
    >
      <Honeycomb grid={WIDE_GRID} cells={menu.map((item, i) => ({ cell: item.cell, tile: tiles[i] }))} stagger={HOME_STAGGER} />
    </HexPage>
    </>
  );
}
