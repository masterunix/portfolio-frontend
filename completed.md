# Completed changes

**Current version: 2.01.02.** With every deployed change, bump `version:` in `content/site.md` and update this line in each `.md` file at the top of the project (AGENTS.md, CLAUDE.md, README.md, future.md, completed.md) to match; the build fails if they disagree.

Changes that have been made and tested, newest first. Agents move items here from
[`future.md`](future.md) once they're done, with a note of what changed.

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
