---
# Text used around the site.
#   version              the site's version, shown in the footer. Bump it with every deployed
#                        change, and update the "Current version" line in each .md file at the
#                        top of the project to match (the build checks they agree).
#   url                  the site's address, for search engines and link previews
#   title, description   the site's name and summary (browser tab, search results, link previews)
#   firefoxNotice        the popup shown once in Firefox and browsers built on its engine
#                        (Markdown: **bold** and [links](https://…) work)
#   pages                each page's heading, its search description, and the hint under
#                        the carousel buttons (projects and skills)
#   feedback             the feedback button at the bottom right of every page:
#     email              where "Mail it" sends the message (opens the visitor's mail app)
#     title              the popup's heading
#     note               its line under the corner buttons (wide screens only)
#     topics             the "About" drop-down, in order. A topic with a `page` is picked
#                        by itself on that page (and the pages under it, like /blog/…);
#                        one without a page is the fallback
#   compatibility        the CPU button next to the feedback button, which turns the blur
#                        off for browsers that draw it badly: its `label`, the `tip`
#                        shown on hover, `auto` (added to the tip when it came on by
#                        itself on a slow device), and its `note` under the corner buttons
#
# Below the second --- line: the footer, one line per paragraph. {year} becomes the current
# year. The first line shows everywhere; the others only on wide screens.
version: 2.08.03
url: https://www.vatsalgoyal.com
title: Vatsal Goyal · Full-stack and AI Developer
description: Vatsal Goyal is a full-stack and AI developer in Jaipur, India, building AxeSuite and the RCIS studio. Projects, experience, skills and resume.
firefoxNotice: "Firefox, and browsers that use its engine, have trouble with the blur this website uses. Please use **Chrome** or **Safari** for the best experience. Rest assured, the content is the same across all browsers!"
pages:
  projects:
    title: My Projects & Work
    description: "Projects by Vatsal Goyal, full-stack and AI developer: AxeSuite, RCIS, PocketLM, FT7, Gleck and more web and AI work."
    hint: Use arrow keys to control the projects carousel
  skills:
    title: Experience & Skills
    description: Vatsal Goyal's experience and skills, from internships at Pratham Software and Xebia to consulting, with React, Next.js, Node.js, Python and PyTorch.
    hint: Use arrow keys to navigate experiences
  dsa:
    title: DSA Stats
    description: Vatsal Goyal's competitive programming profiles on LeetCode, Codeforces, HackerRank and AtCoder, plus the core DSA topics.
  resumes:
    title: Explore Resumes
    description: Download Vatsal Goyal's resume, a full-stack developer with experience in web development and AI.
  blog:
    title: Blog
    description: "Notes on what I build and learn: web development, AI/ML and problem solving."
    hint: Use arrow keys to browse the posts
feedback:
  email: vatsalgoyal9999@gmail.com
  title: Send feedback
  note: Found a bug? Tell me by clicking the messages icon.
  topics:
    - { label: Home, page: / }
    - { label: Summary, page: /summary }
    - { label: Projects, page: /projects }
    - { label: Experience & Skills, page: /skills }
    - { label: Resumes, page: /resumes }
    - { label: DSA Stats, page: /dsa }
    - { label: Blog, page: /blog }
    - { label: Something else }
compatibility:
  label: Compatibility mode
  tip: Many browsers have rendering issues with the heavy blur on this site. This toggle turns it off.
  auto: It came on by itself because the page was running slowly. Tap to turn the blur back on.
  note: Website slow? Tap the processor to fix!
---

© {year} Vatsal Goyal. All rights reserved.

This website is managed by [Gleck](https://github.com/masterunix/gleck), my Personal AI Agent.
