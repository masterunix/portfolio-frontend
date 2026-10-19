/**
 * /blog: Every post, newest first, in the same hexagon carousel as the projects. A
 * post's Read opens the whole post in a wide popup; each post also has its own page
 * (/blog/<slug>), for links and search engines.
 */
import Carousel from '@/components/Carousel';
import HexPage from '@/components/HexPage';
import Honeycomb from '@/components/Honeycomb';
import MobileList from '@/components/MobileList';
import { getPost, getPosts, getSite } from '@/lib/content';
import { WIDE_GRID } from '@/lib/hexLayout';
import { pageMetadata } from '@/lib/metadata';
import { postTile, type Tile } from '@/lib/tiles';

export const generateMetadata = () => pageMetadata('blog');

/** Empty hexagons for the rows above and below the posts */
const BLANK: Tile[] = Array.from({ length: 4 }, (_, i) => ({ key: `blank-${i}`, title: '' }));

const NO_POSTS: Tile = {
  key: 'no-posts',
  title: 'No posts yet',
  description: 'The first one is on its way.',
  icon: '✍️',
  color: '#a29bfe',
};

export default function BlogPage() {
  const { title, hint } = getSite().pages.blog;
  const posts = getPosts().map((summary) => postTile(getPost(summary.slug)!));

  return (
    <HexPage title={title} mobile={<MobileList title={title} sections={[{ tiles: posts.length ? posts : [NO_POSTS] }]} />}>
      {posts.length ? (
        <Carousel main={posts} supporting={BLANK} label="Posts" hint={hint ?? ''} />
      ) : (
        <Honeycomb grid={WIDE_GRID} cells={[{ cell: [1, 3], tile: NO_POSTS }]} />
      )}
    </HexPage>
  );
}
