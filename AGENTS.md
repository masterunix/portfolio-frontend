# AGENTS.md

**Current version: 2.08.04.** With every deployed change, bump `version:` in `content/site.md` and update this line in each `.md` file at the top of the project (AGENTS.md, CLAUDE.md, README.md, future.md, completed.md) to match; the build fails if they disagree.

Instructions for AI agents (and people) working on this site: Vatsal Goyal's portfolio at
[vatsalgoyal.com](https://www.vatsalgoyal.com), a Next.js site whose content lives in
Markdown files in `content/`. Almost every update is an edit to one of those files. This
guide says which file holds what, how to edit each one, and what not to do.

## First thing, every session

1. Read [`future.md`](future.md).
2. If it lists anything under **To do**, show the items to the user and ask:

   > These updates in the future.md, should I add these, and test?

   Then wait for the answer. Don't start changing things before the user says yes, and
   only do the items they agree to.
3. If it's empty, carry on with whatever the user asks.

## Doing an update

1. **Make the change.** Most updates are content: edit or add a file in `content/` (see
   the map below). Don't change code for a content update.
2. **Test it locally before anything else:**
   - `npm run lint` and `npx tsc --noEmit -p .` pass.
   - `npm run build` passes. The build checks every content file (required fields,
     links, colours, that pictures and PDFs exist, no em dashes) and fails with the file
     and field if something is wrong. Stop `npm run dev` first if it's running, and start
     it again afterwards: a build alongside it can confuse its cache.
   - `npm run dev`, then open every page you changed at http://localhost:3000, on a
     wide window **and** a phone-width one (under 768px the site shows a card list
     instead of hexagons). Check the text, pictures, links and downloads.
3. **Log it.** Move the item from `future.md` to `completed.md`, under today's date
   (newest date first), with a short note of what changed and which files.
4. **Version it.** Bump `version:` in `content/site.md` once per deploy (2.06.02 to
   2.06.03 for small changes; raise the middle number for bigger ones), update the
   "Current version" line at the top of every `.md` file here, and put the new version in
   the `completed.md` entry. It shows in the site's footer.
5. **Deploying:** never push, merge or deploy unless the user asks, and only after the
   steps above pass. Pushing `main` to github.com/masterunix/portfolio-v2 publishes the
   site (Vercel project `portfolio-v2`).

## Writing

Everything on the site is Vatsal talking about his own work, so it should read like a
person wrote it, not a press release or a chatbot.

- **No em dashes (the long dash, U+2014), anywhere.** Use a comma, a colon, brackets or two sentences. The
  build fails on an em dash in any content file. En dashes in ranges (`2022 – 2026`,
  `Sep – Dec 2025`) are fine.
- **Plain, specific words.** Say what was built and what it does: "a week-by-week planner
  with timers and streaks", not "a powerful, seamless productivity solution". Skip
  "leverage", "robust", "cutting-edge", "passionate", "delve", "elevate" and the like.
- **Short sentences, active voice, first person** in the summary and blog ("I built",
  "I'm working on"). Tile text can be a fragment.
- **Facts only.** Don't invent numbers, dates, users, results or job titles. If you don't
  know something, ask, or leave it out. Check links before adding them.
- **No hype punctuation.** One exclamation mark at most, and only where Vatsal would say
  it out loud. No emoji in body text (icons are separate fields).
- **Keep the existing order.** Projects follow the GitHub profile README
  (`~/Desktop/Profile/masterunix/README.md`): AxeSuite, RCIS, PocketLM, FT7, Gleck, then
  the rest. The ⭐ after AxeSuite, RCIS and FT7 marks the main projects; don't add it
  elsewhere without asking.

The same rules apply to commit messages, `completed.md` entries and these docs.

## Where things are

| On the site | File |
|---|---|
| Footer lines (© … / "managed by Gleck"), page headings, carousel hints, search titles and descriptions, the site's address, the feedback button and compatibility toggle (bottom right: email, popup heading, "About" topics, the toggle's tip) | `content/site.md` |
| Home menu tiles and their text ("Summary: The whole site, on one page", and the rest), which one pulses, the typewriter lines | `content/home.md` |
| Summary page (/summary), the one page for recruiters | `content/summary.md` |
| Projects (/projects middle row) | `content/projects/<name>.md`, one per project |
| Experience (/skills middle row) and skills (/skills outer rows, /projects outer rows) | `content/skills/<name>.md`, one each (`row: middle` is experience) |
| Resumes (/resumes) and their PDFs | `content/resumes/<name>.md`; PDFs in `public/media/resumes/` |
| DSA platforms (/dsa middle row) | `content/dsa/platforms/<name>.md`, one each |
| DSA concepts (/dsa top and bottom rows) | `content/dsa/concepts.md` |
| Blog posts (/blog carousel, and each post's own page) | `content/blog/<name>.md` (the file name is the URL) |
| Gleck's notices and link (bottom left; they open by themselves on the home page, ^ opens them anywhere) | `content/gleck.md` |
| Background colours and brightness | `content/background.md` |

## How a content file works

Every file in `content/` has two parts:

```markdown
---
title: AxeSuite ⭐                  ← settings, between the two --- lines (YAML)
summary: "A productivity suite: seven apps, one login."
order: 10
---

The body: Markdown, below the second --- line.
```

**Settings (between the `---` lines):**

- One `name: value` per line. Names are exact: a typo (`tittle:`) fails the build with
  the file and field named.
- **Quote a value** that contains `: ` (a colon and a space), starts with `[`, `{`, `#`,
  `@` or `*`, or is a number that should stay text: `summary: "Two parts: like this"`,
  `icon: "450"`. When unsure, quote it.
- Lists of small items use `- { label: GitHub, href: "https://…" }`, one per line,
  indented two spaces under their name.
- Colours: `"#7eadfc"` (quoted), or a name like `Purple`.
- Dates: `2026-10-19`.
- Pictures and files: a site path starting with `/`, like `/media/logos/gleck.svg`. The
  file must exist in `public/`.
- Lines starting with `#` are comments: they explain the fields and don't show anywhere.

**Body (below the second `---`):** normal Markdown: paragraphs, `## headings`, `- ` lists,
`**bold**`, `[links](https://…)`. The summary and blog also have layout blocks
(`:::callout`, `:::cards`, `:::timeline`, `:::columns`; see the comments at the top of
`content/summary.md`).

**Adding an entry:** copy the folder's `_template.md` to a new lowercase-with-dashes name
(`my-project.md`) and fill it in. The template lists every field, which are required, and
what each does. Files starting with `_` are ignored. `order` sorts entries (lowest first;
leave gaps of 10 so new ones fit between). `draft: true` hides an entry without
deleting it.

## File by file

### `content/projects/<name>.md`

- `title`, `tech` (the stack, one line), `color` are required.
- `summary`: the one or two lines on the tile. The **body** is the full write-up that
  opens in the popup when the hexagon is clicked: a short paragraph, then a `- ` list of
  what it does or how it's built, then links.
- `period` (`Jul 2025`, `Sep – Dec 2025`, `In development`) shows in the popup.
- `github` and `visit` add buttons. Only link public repos and sites that load.
- `icon` (2 to 4 letters) shows when there's no `logo`; see Pictures below.

### `content/skills/<name>.md`

- `row: middle` is **experience** (jobs, internships, certifications): it gets `summary`,
  `period` and a body, like a project, and opens a popup.
- `row: top` or `row: bottom` is a **skill**: a short body (one sentence) and an optional
  `level` (beginner, intermediate, proficient, expert) for the coloured badge.
- `attachments` (experience only): buttons that open files, like a certificate PDF.

### `content/summary.md`

The page recruiters read. It should hold everything important on its own: headline,
"open to work", what Vatsal is building (in the profile README's order), other projects,
experience, education, certifications, skills, coding profiles and contact. When a
project, job or link changes elsewhere, update it here too. `jobTitle` and `school` aren't
shown; they tell search engines who Vatsal is. Update `updated:` when you change it.

### `content/blog/<name>.md`

- The file name is the address: `my-first-post.md` is `/blog/my-first-post`.
- `title`, `description` (one or two sentences, also used in link previews) and `date`
  are required. Optional: `updated`, `tags: [a, b]`, `cover`, `icon`, `color`,
  `draft: true` (shows only in `npm run dev`).
- Write it in the first person, in Vatsal's voice, following the Writing rules above.
  `content/blog/how-to-write-a-post.md` (a draft) shows every option.

### `content/home.md`

- `menu`: the home tiles. Each needs its own `cell: [row, column]`; the build rejects a
  taken or missing cell. `icon` is a built-in name (summary, github, projects, linkedin,
  resumes, skills, dsa, blog, mail) or a picture path. `pulse: true` makes it glow.
- Body: the typewriter lines, one `- ` line each. A line that is only `[text](link)`
  opens the link when clicked.

### `content/gleck.md`

- Body: Gleck's notices, one `- ` line each, newest near the top (after the greeting). Keep
  them to one sentence. To hide one without deleting it, wrap it in `<!--` and `-->`.

### `content/site.md`

- `version` (see "Version it"), `url` (the site's address), `title` and `description`
  (search results), `firefoxNotice` (the one-time popup in Firefox-engine browsers), `pages` (each page's heading, search description and carousel
  hint), and `feedback` (the button at the bottom right: `email`, the popup's `title`, its
  `note` under the corner buttons, and the `topics` in its "About" drop-down; a topic's `page`
  makes it the default there), and `compatibility` (the CPU button beside it that turns
  the blur off: its `label`, the `tip` shown on hover, `auto` for when it came on by
  itself, and its `note`).
- A link to `#mail` anywhere (the home page's Mail Me! tile) opens the same popup as
  "Mail me". Use it instead of a bare `mailto:` link: the popup also offers Gmail and
  Copy address for visitors with no mail app set up.
- Body: the footer lines. `{year}` becomes the current year.

### `content/resumes/`, `content/dsa/`, `content/background.md`

- A resume tile downloads `file` (a PDF in `public/media/resumes/`) as `filename`, or
  opens `link`.
- DSA platforms need `url` (the profile) and ideally a `logo`. `concepts.md` lists ten
  topics: five on top, five below.
- `background.md`: four colours per page, `speed`, and `brightness` (lower makes text
  easier to read).

## Pictures and files

- Put them in `public/media/` (`logos/`, `resumes/`, `attachments/`, `blog/`) and refer to
  them by site path: `logo: /media/logos/gleck.svg`. The build fails if a path doesn't exist.
- The short text in a tile's icon square (AS, GI, PLM…) is `icon:`. To use a picture
  instead, add `logo:` with an image (square works best, at least 128 × 128 px; PNG, SVG
  or WebP). If the picture ever fails to load, the `icon:` text shows instead.
- Two kinds of logo:
  - **A glyph or plain logo** (transparent background): it sits inside the coloured
    square, so pick a `color:` it stands out on. For a tech or brand logo, take the SVG
    from [simpleicons.org](https://simpleicons.org) (free to use), set `fill="#ffffff"`
    (or the brand colour) on its `<svg>`, and use the brand colour as `color:`.
  - **A whole app icon** (with its own rounded background, like `axesuite.png`): add
    `logoFill: true` so it fills the square.
- Don't generate images with AI. Use the project's own logo, an official one, or draw a
  simple SVG.

## Don'ts

- Don't edit code (`app/`, `components/`, `lib/`) for a content change.
- Don't rename a blog post's file once it's published: that breaks its address.
- Don't put em dashes, made-up facts, or links you haven't opened into any file.
- Don't delete an entry to hide it; use `draft: true`.
- Don't put secrets (API keys, tokens, passwords) in `content/` or `public/`: everything
  there is public.
- Don't commit, push or deploy unless asked, and never with a failing build.
- Don't skip the version bump or the `completed.md` entry when you deploy.

## Code (only when the change isn't content)

See `README.md` for how the code is organised. Notes:

- The site's styles are in `app/site.css`. Keep them out of `app/globals.css`, which only
  sets up Tailwind: Tailwind caches that file in dev and misses edits to it.
- If a style change doesn't show up in `npm run dev`, stop it, delete `.next/dev` and
  start it again.
- The hexagon intro and exit animations are tuned; check them by eye after touching
  `components/Hexagon.tsx`, `components/Carousel.tsx`, `lib/hexTransition.ts` or the
  `.hex` styles.
- Performance: the background shader draws at half resolution on purpose
  (`components/ShaderBackground.tsx`); slow devices switch to a cheaper glass
  (compatibility mode, `lib/compat.ts`). Test heavy visual changes with the CPU throttled in DevTools.
