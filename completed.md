# Completed changes

**Current version: 2.05.03.** With every deployed change, bump `version:` in `content/site.md` and update this line in each `.md` file at the top of the project (AGENTS.md, CLAUDE.md, README.md, future.md, completed.md) to match; the build fails if they disagree.

Changes that have been made and tested, newest first. Agents move items here from
[`future.md`](future.md) once they're done, with a note of what changed.

## 2026-10-19 · v2.05.03

- Clicking anywhere on a project, experience or blog hexagon (or its phone card) opens
  its popup; Read more stays as a hint and for keyboards. Its links (GitHub, Visit) still
  go straight to the link (`components/TileDialog.tsx`).

## 2026-10-19 · v2.05.02

- Gleck's widget animates cleanly: it stays mounted on every page and only its width
  changes (60px eyes on other pages, 98px collapsed, 400px open), with the notice list
  sliding open beneath. Notices fade in as they change.
- The "Updates are managed by Gleck" line stays on every page, so the widget no longer
  shifts when you change page.
- The ^ button is always visible on the home page (it replaces the old + badge): it opens
  Gleck, then shows every notice.

## 2026-10-19 · v2.05.01

- New favicon: a dark hexagon with a purple-to-blue outline and a small solid hexagon,
  drawn in SVG (`public/icon.svg`). `app/favicon.ico`, `public/apple-icon.png` and
  `public/icon-192.png` / `icon-512.png` are rendered from it. Removed `public/icon.png`.

## 2026-10-19 · v2.05.00

- Read more on projects and experience: the tile shows `summary:`, and the full details
  (the file's body, in Markdown) open in a popup that grows out of the hexagon and shrinks
  back into it (`components/TileDialog.tsx`). New fields: `summary`, `period`.
- Rewrote every project and experience entry with a summary and details from the resume;
  added experience entries for the 450 House of Sourdough consulting, the JECRC Incubation
  Centre and the Oracle Cloud certifications. Visit links for AxeSuite and AshaKiran.
- The blog is a hexagon carousel like the projects; a post opens in a wide popup, and
  still has its own page. Posts can set `icon` and `color`.
- Gleck's eyes are on every page and blink now and then; his notices only show on the
  home page (`hooks/useBlink.ts`, `components/Gleck.tsx`).
- SEO: site address in `content/site.md`; canonical URLs, Open Graph and X cards on every
  page; a generated preview image; sitemap.xml, robots.txt and a web manifest; schema.org
  data (Person and WebSite on home, ProfilePage on the summary, BlogPosting on posts);
  a real h1 on home; sharper titles and descriptions.
- Summary and projects now follow the GitHub profile README (Profile/masterunix): its
  content and its order (AxeSuite, RCIS, PocketLM, FT7, Gleck, then the rest). New
  projects: FT7, GlobalFreight AI, Flapper, VS Code DSA Setup. The 2026 internship is
  Pratham Software (PSI), Jan – Aug 2026. LinkedIn is linkedin.com/in/vatsalgoyal93.
- Renamed the project to portfolio-v2: the folder (now ~/Desktop/Profile/portfolio-v2),
  the GitHub repo (masterunix/portfolio-v2) and package.json.
- Removed the dead vatsalgoyal.me links; "portfolio v1" links go to v1.vatsalgoyal.com
  (added to the old site's Vercel project; it needs a CNAME in Cloudflare to go live).

## 2026-10-19 · v2.04.00

- Rewrote the Summary page (`content/summary.md`) as everything on one page, for
  recruiters: headline, contact and resume buttons, experience, every project with links,
  skills, certifications, education, coding profiles and contact. Written from the resume
  and the site.
- The home Summary tile now reads "The whole site, on one page" and its icon pulses
  (new `pulse: true` option in `content/home.md`).
- Back links (Back to Home, ← Home, ← Back) use a drawn arrow icon (`components/BackArrow.tsx`).
- Logos load with the page instead of lazily, so carousel tiles never show a blank square.
- GitHub buttons on the public projects: Gleck, PocketLM, JobNest, movie.fy and this site.

## 2026-10-19 · v2.03.00

- Logos instead of letters (all in `public/media/logos/`):
  - Projects: AxeSuite and AshaKiran (their app icons), 450 House of Sourdough (its
    favicon), Gleck (its eyes), movie.fy (Flutter), and this site.
  - Skills: Node.js, React, Next.js, PostgreSQL, Express, PyTorch, LangChain, LangGraph
    and MCP, from Simple Icons, on their brand colours.
- New project: RCIS (`content/projects/rcis.md`), with its logo and a Visit link.
- New `logoFill: true` option for logos that are whole app icons, so they fill the
  icon square (`lib/content.ts`, `components/ItemIcon.tsx`, the templates, AGENTS.md).
- Fixed "LangGraoh" → LangGraph, and the site's own tech line no longer lists Strapi.

## 2026-10-19 · v2.02.01

- Hexagons keep the same framing on 16:9 monitors (1080p, 1440p) as on a MacBook: they
  scale with the window's width, but no further than a 16:10 window of the same height
  would give them (`lib/hexLayout.ts`). Before, 1080p looked zoomed in.
- The home and resumes honeycombs fill the window at any shape (4:3 to ultrawide) with
  empty hexes beyond the grid (`components/Honeycomb.tsx`).
- Hexagon titles are semibold, and titles and icons grow less on big screens (icons top
  out at 54–64px).

## 2026-10-19 · v2.02.00

- Switched the whole site to JetBrains Mono (`app/layout.tsx`).
- Hexagon text is bigger and now scales with the hexagon, so it stays in proportion
  from laptops to large monitors; the smallest text is at least 10–11px. Tooltips,
  the carousel hint, phone cards and the footer's small line are a little bigger too.
- Softer text: body text is off-white (pure white only for headings), the glass behind
  hexagon text is darker, and the background has a new `brightness` setting in
  `content/background.md` (set to 0.8).
- New Summary icon on the home menu (an ID card) in `lib/icons.ts`.
- Icon letters turn dark on very light squares (White, Yellow), so movie.fy, Node.js,
  PostgreSQL, Xebia and Feedback are readable.
- Gleck's "Updates are managed by…" line no longer runs into the footer.

## 2026-10-19 · v2.01.03

- Removed the coloured top edge from the carousel button tooltips (`app/site.css`).

## 2026-10-19 · v2.01.02

- Added the site version (2.01.02) to the footer and a "Current version" line to each
  `.md` file here; the build checks they match `version:` in `content/site.md`.
- Made the footer text easier to read, and gave callout boxes an even border all round.
- Deployed to https://vatsalgoyal.com and checked it live (all pages, the resume
  download, phone and desktop).
- Retired Strapi: archived the `masterunix/portfolio-strapi` GitHub repo and moved its
  folder to `Personal Projects/Deprecated or Complete/`. Still to do: suspend the Strapi
  server on Render (`portfolio-strapi-10vw`).

- Moved all content to Markdown in `content/`: projects, skills, resumes, DSA platforms
  and concepts, the home menu and typewriter, Gleck's notices, the footer and page text
  (`site.md`), and the background colours. Each folder has a `_template.md`.
- Imported the live content from the old Strapi CMS, and added the DSA platforms
  (Codeforces, LeetCode, HackerRank, AtCoder) with their logos.
- Added the resume PDF (`public/media/resumes/vatsal-resume.pdf`) to the General resume.
- Carousel button tooltips are now blurred and dark instead of see-through.
- Redesigned the blog index as a readable list of post cards.
- Split the site's styles into `app/site.css` so style edits show up in `npm run dev`.
