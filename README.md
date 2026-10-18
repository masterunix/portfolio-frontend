# Vatsal Goyal — Portfolio

A portfolio site of glass hexagons over an animated background: a honeycomb menu,
scrolling carousels of projects and skills, resumes, coding profiles, a blog and a
summary page. On phones, every page is a list of glass cards instead.

Built with Next.js 16 (App Router), React 19, TypeScript and Tailwind CSS 4, with no
animation or 3D libraries: the hexagons animate with CSS, the carousel with one
animation loop, and the background is a single WebGL shader. All content lives in
`content/` as YAML and Markdown files, checked when the site builds; there is no CMS
or database.

## Running it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build; fails on any content mistake
npm run lint
```

The first visit to each page in `npm run dev` compiles it, so it's slower than the
live site, where every page is built ahead of time. If a change to `app/globals.css`
doesn't show up after restarting the dev server (it can miss edits made while it was
stopped, or during an install), delete `.next/dev` and start it again.

## How it's put together

Every page is a server component in `app/` that reads its content (`lib/content.ts`),
turns it into **tiles** (`lib/tiles.tsx`) and hands them to a layout:

```
app/
  page.tsx                 Home: the menu (lib/navigation.tsx) in a honeycomb
  projects/, skills/       Carousels: main tiles in the middle row, skills above and below
  dsa/, resumes/, blog/    Honeycombs with tiles in chosen cells
  blog/[slug]/, summary/   Text pages in a glass panel (GlassArticle)
  layout.tsx               Background, Gleck, fonts
  globals.css              All shared styles, by section
components/
  HexPage.tsx              Page frame: mobile list or hex layout, header, footer, outro
  Honeycomb.tsx            A fixed honeycomb of hexagons
  Carousel.tsx             The endless three-row carousel (+ useCarousel)
  Hexagon.tsx, HexShell.tsx
                           A glass hexagon; its intro/outro is CSS (.hex)
  HexTile.tsx              A tile inside a hexagon
  MobileList.tsx           A tile list for narrow screens (server-rendered)
  transition.tsx           The outro context and SmartLink, the one link component
  GlassArticle.tsx, Gleck.tsx, ShaderBackground.tsx, Typewriter.tsx, Footer.tsx, ItemIcon.tsx
lib/
  content.ts               Reads and checks content/
  tiles.tsx                Content → tiles
  hexLayout.ts             Honeycomb geometry
  hexTransition.ts         Intro/outro timing
content/                   The site's content (below)
public/media/              Logos, resumes and attachments the content points to
scripts/export-strapi.mjs  One-time export from the old Strapi CMS
```

**Tiles.** A tile is an icon, a title, a few lines of text, and either one link
(the whole tile) or some buttons. The same tile renders as a hexagon (`HexTile`) or
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

Everything the site shows is in `content/`, one YAML file per collection. Edit a file and
it shows on reload in dev, and on the next deploy in production. There is no CMS or
database to run.

| File | Shows on |
|---|---|
| `content/projects.yaml` | /projects (middle row, mobile cards) |
| `content/skills.yaml` | /skills; also the outer rows of /projects |
| `content/resumes.yaml` | /resumes |
| `content/dsa-platforms.yaml` | /dsa (middle row) |
| `content/dsa-concepts.yaml` | /dsa (top and bottom rows) |
| `content/home-messages.yaml` | the typewriter on the home page |
| `content/gleck-notices.yaml` | Gleck's widget, bottom left |
| `content/settings/gleck.yaml` | Gleck's "know more" link |
| `content/background-themes.yaml` | the animated background |
| `content/blog/<slug>.md` | /blog and /blog/&lt;slug&gt; (Markdown, see `how-to-write-a-post.md`) |
| `content/summary.md` | /summary (Markdown) |

The comments at the top of each file list its fields. Logos, PDFs and other files go in
`public/media/` and are referenced by their site path (`logo: /media/logos/leetcode.png`).

`lib/content.ts` checks every entry when it loads: required fields, allowed values,
number ranges, colours, links, and that each media path exists and is the right kind of
file. A mistake shows as an error naming the file, entry and field (in the dev overlay,
or as a failed build), so a broken logo or link can't reach the live site.

Entries sort by `order` (lowest first); `draft: true` hides one.

### Markdown pages

Blog posts and the summary are Markdown with their details between two `---` lines at
the top. Besides normal Markdown (and HTML), they can use layout blocks, each ended by a
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

### Importing from Strapi

The content was exported from the old Strapi CMS with:

```bash
node scripts/export-strapi.mjs https://your-strapi.example.com   # default: http://localhost:1337
```

It overwrites `content/*.yaml` (not `settings/`) and downloads the media into
`public/media/`, printing every cleanup it makes (links without https://, placeholder
text in link fields, hashed file names).

## Deploying

`npm run build` renders every page ahead of time. Deploy on Vercel or any Node host;
`next.config.ts` ships `content/` with the server in case a page renders on demand.

## License

© 2025 – 2026 Vatsal Goyal. All rights reserved.
