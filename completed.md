# Completed changes

Changes that have been made and tested, newest first. Agents move items here from
[`future.md`](future.md) once they're done, with a note of what changed.

## 2026-10-19

- Moved all content to Markdown in `content/`: projects, skills, resumes, DSA platforms
  and concepts, the home menu and typewriter, Gleck's notices, the footer and page text
  (`site.md`), and the background colours. Each folder has a `_template.md`.
- Imported the live content from the old Strapi CMS, and added the DSA platforms
  (Codeforces, LeetCode, HackerRank, AtCoder) with their logos.
- Added the resume PDF (`public/media/resumes/vatsal-resume.pdf`) to the General resume.
- Carousel button tooltips are now blurred and dark instead of see-through.
- Redesigned the blog index as a readable list of post cards.
- Split the site's styles into `app/site.css` so style edits show up in `npm run dev`.
