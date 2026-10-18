# AGENTS.md

Instructions for AI agents (and people) working on this site: Vatsal Goyal's portfolio,
a Next.js site whose content lives in Markdown files in `content/`.

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
     links, colours, that pictures and PDFs exist) and fails with the file and field if
     something is wrong. Stop `npm run dev` first if it's running, and start it again
     afterwards: a build alongside it can confuse its cache.
   - `npm run dev`, then open every page you changed at http://localhost:3000, on a
     wide window **and** a phone-width one (under 768px the site shows a card list
     instead of hexagons). Check the text, pictures, links and downloads.
3. **Log it.** Move the item from `future.md` to `completed.md`, under today's date
   (newest date first), with a short note of what changed and which files.
4. **Deploying:** never push, merge or deploy unless the user asks, and only after the
   steps above pass. Pushing `main` publishes the site.

## Where things are

| On the site | File |
|---|---|
| Footer lines (© … / "managed by Gleck"), page headings, carousel hints, search descriptions, the site's title | `content/site.md` |
| Home menu tiles and their text ("Summary — Who I am, in short", …), the typewriter lines | `content/home.md` |
| Summary page | `content/summary.md` |
| Live projects (/projects) | `content/projects/<name>.md`, one per project |
| Experience and skills (/skills, and the outer rows of /projects) | `content/skills/<name>.md`, one each |
| Resumes (/resumes) and their PDFs | `content/resumes/<name>.md`; PDFs in `public/media/resumes/` |
| DSA platforms (/dsa middle row) | `content/dsa/platforms/<name>.md`, one each |
| DSA concepts (/dsa top and bottom rows) | `content/dsa/concepts.md` |
| Blog posts | `content/blog/<name>.md` (the file name is the URL) |
| Gleck's notices and link (bottom left) | `content/gleck.md` |
| Background colours | `content/background.md` |

Every folder has a `_template.md` listing all the fields: copy it to add an entry.
Files starting with `_` are ignored. File names are lowercase-with-dashes (`my-project.md`).
In each entry file, the settings go between the two `---` lines at the top and the
description goes below them. `order` sorts entries (lowest first); `draft: true` hides one.

### Pictures and files

- Put them in `public/media/` (`logos/`, `resumes/`, `attachments/`, `blog/`) and refer to
  them by site path: `logo: /media/logos/gleck.png`. The build fails if a path doesn't exist.
- The short text in a tile's icon square (AS, GI, PLM…) is `icon:`. To use a picture
  instead, add `logo:` with an image (square works best, at least 128 × 128 px; PNG, SVG
  or WebP). If the picture ever fails to load, the `icon:` text shows instead.
- A resume's download: `file: /media/resumes/name.pdf`, and `filename:` for the name it
  saves as.

## Code (only when the change isn't content)

See `README.md` for how the code is organised. Notes:

- The site's styles are in `app/site.css`. Keep them out of `app/globals.css`, which only
  sets up Tailwind: Tailwind caches that file in dev and misses edits to it.
- If a style change doesn't show up in `npm run dev`, stop it, delete `.next/dev` and
  start it again.
- The hexagon intro and exit animations are tuned; check them by eye after touching
  `components/Hexagon.tsx`, `components/Carousel.tsx`, `lib/hexTransition.ts` or the
  `.hex` styles.
