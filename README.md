# Vatsal Goyal — Portfolio

**Current version: 2.05.00.** With every deployed change, bump `version:` in `content/site.md` and update this line in each `.md` file at the top of the project (AGENTS.md, CLAUDE.md, README.md, future.md, completed.md) to match; the build fails if they disagree.

A portfolio site of glass hexagons over an animated background: a honeycomb menu,
scrolling carousels of projects and skills, resumes, coding profiles, a blog and a
summary page. On phones, every page is a list of glass cards instead.

Built with Next.js 16 (App Router), React 19, TypeScript and Tailwind CSS 4, with no
animation or 3D libraries: the hexagons animate with CSS, the carousel with one
animation loop, and the background is a single WebGL shader. All content lives in
`content/` as Markdown files, checked when the site builds; there is no CMS or
database.

## Running it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build; fails on any content mistake
npm run lint
```

The first visit to each page in `npm run dev` compiles it, so it's slower than the
live site, where every page is built ahead of time. If a style change doesn't show up,
stop the dev server, delete `.next/dev` and start it again.

**Working with an AI agent?** [`AGENTS.md`](AGENTS.md) says what to update where and
how to test it. Queue changes in [`future.md`](future.md); finished ones are logged in
[`completed.md`](completed.md).

## How it's put together

Every page is a server component in `app/` that reads its content (`lib/content.ts`),
turns it into **tiles** (`lib/tiles.tsx`) and hands them to a layout:

```
app/
  page.tsx                 Home: the menu (content/home.md) in a honeycomb
  projects/, skills/, blog/
                           Carousels: main tiles in the middle row, more above and below
  dsa/, resumes/           Honeycombs with tiles in chosen cells
  blog/[slug]/, summary/   Text pages in a glass panel (GlassArticle)
  layout.tsx               Background, Gleck, fonts, footer text, site-wide metadata
  sitemap.ts, robots.ts, manifest.ts, opengraph-image.tsx, twitter-image.tsx
                           For search engines and link previews
  site.css                 All the site's styles, by section
  globals.css              Tailwind's setup only (keep styles out: see the file)
components/
  HexPage.tsx              Page frame: mobile list or hex layout, header, footer, outro
  Honeycomb.tsx            A fixed honeycomb of hexagons
  Carousel.tsx             The endless three-row carousel (+ useCarousel)
  Hexagon.tsx, HexShell.tsx
                           A glass hexagon; its intro/outro is CSS (.hex)
  HexTile.tsx              A tile inside a hexagon
  TileDialog.tsx           Read more: a tile's details in a popup that grows out of its hexagon
  MobileList.tsx           A tile list for narrow screens (server-rendered)
  transition.tsx           The outro context and SmartLink, the one link component
  GlassArticle.tsx, Gleck.tsx, ShaderBackground.tsx, Typewriter.tsx, Footer.tsx, ItemIcon.tsx,
  BackArrow.tsx, JsonLd.tsx
lib/
  content.ts               Reads and checks content/
  markdown.ts              Markdown → HTML, with the layout blocks
  tiles.tsx                Content → tiles
  hexLayout.ts             Honeycomb geometry
  hexTransition.ts         Intro/outro timing
  metadata.ts              Page metadata and structured data (schema.org) for search engines
  icons.ts, format.ts
content/                   The site's content (below)
public/media/              Logos, resumes and attachments the content points to
```

**Tiles.** A tile is an icon, a title, a few lines of text, and either one link
(the whole tile) or some buttons. Projects, experience and blog posts also have
details: Read more opens them in a popup (`TileDialog`). The same tile renders as a hexagon (`HexTile`) or
a card (`MobileList`), so every page looks and behaves alike.

**Mobile and desktop.** `HexPage` renders the mobile list on the server, so the
content is in the page's HTML, and CSS hides it on screens 768px and wider. There,
the hex layout mounts in the browser, since it's sized from the window.

**Transitions.** Hexagons wave in from the top-left. Following a link to another page
plays the outro, the same wave fading out, then navigates. Hexes fade in through a
CSS variable rather than opacity, so the glass blur fades in with the outline
(details in `components/HexShell.tsx` and `lib/hexTransition.ts`). Links to other
sites, files and email work like normal links.

## Content

Everything the site shows is in `content/`, as Markdown files. Edit one and it shows on
reload in dev, and on the next deploy in production. There is no CMS or database.

| File | Shows on |
|---|---|
| `content/site.md` | the footer, page headings, carousel hints, search descriptions |
| `content/home.md` | the home menu (tile text, links, icons, positions) and the typewriter lines |
| `content/summary.md` | /summary |
| `content/projects/<name>.md` | /projects, one file per project: `summary` on the tile, the body in its Read more popup |
| `content/skills/<name>.md` | /skills (and the outer rows of /projects), one per skill or role; roles have Read more like projects |
| `content/resumes/<name>.md` | /resumes, one per resume; PDFs in `public/media/resumes/` |
| `content/dsa/platforms/<name>.md` | /dsa middle row, one per platform |
| `content/dsa/concepts.md` | /dsa top and bottom rows |
| `content/blog/<name>.md` | /blog's carousel (a post opens in a popup) and /blog/&lt;name&gt; |
| `content/gleck.md` | Gleck's notices, bottom left of the home page (other pages show just his eyes) |
| `content/background.md` | the animated background's colours |

An entry file has its settings between two `---` lines at the top and its description
below them. Each folder's `_template.md` lists every field (files starting with `_` are
skipped); the single files explain theirs in comments at the top. Entries sort by
`order` (lowest first); `draft: true` hides one. Pictures, PDFs and other files go in
`public/media/` and are referenced by site path (`logo: /media/logos/leetcode.png`); a
tile's `logo:` replaces the letters in its icon square.

`lib/content.ts` checks every file when it loads: required fields, allowed values,
number ranges, colours, links, and that each picture and file exists. A mistake shows as
an error naming the file and field (in the dev overlay, or as a failed build), so a
broken logo or link can't reach the live site.

### Markdown pages

The bodies of blog posts, projects, experience and the summary are full Markdown (and HTML), plus layout blocks, each ended by a
line containing just `:::`:

```markdown
:::callout Right now            ← a highlighted box (the title is optional)
Working on …
:::

:::cards                        ← a grid; each card starts with ### Title
### Web
…
:::

:::timeline                     ← ### When | What
### 2024 – now | Engineer at Acme
…
:::

:::columns                      ← side by side, split by +++
left
+++
right
:::
```

An unknown block, an unclosed one or a missing image fails like any other content mistake.

## Deploying

`npm run build` renders every page ahead of time. Deploy on Vercel or any Node host;
`next.config.ts` ships `content/` with the server in case a page renders on demand.

## License

© 2025 – 2026 Vatsal Goyal. All rights reserved.
