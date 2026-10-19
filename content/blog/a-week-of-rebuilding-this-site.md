---
title: A week of rebuilding this site
description: What changed on vatsalgoyal.com this week, from dropping the CMS to making it run smoothly on slow laptops.
date: 2026-10-19
tags: [portfolio, nextjs, webgl]
icon: 🛠️
color: "#7C3AED"
---

This site looks mostly the same as it did last week, but almost everything under it has
changed. Here's what I did, and why.

## No more CMS

The old version pulled its content from Strapi, running on a free Render server. Free
servers go to sleep, so the first visit after a quiet spell could be slow while it
woke up. That's a bad first impression for something meant to introduce me.

Now every project, skill, resume and blog post is a Markdown file in the repo. When the
site builds, it checks each file: required fields, links, colours, and that every picture
and PDF actually exists. If something's wrong, the build fails and tells me which file and
which field, so a broken link never makes it live. The Strapi server is gone and its repo
is archived.

The nice side effect is that Gleck, my AI agent, can update the site the same way I do. I
write down what I want in a file called `future.md`, Gleck makes the change, tests it, and
logs it in `completed.md`. The version number in the footer goes up every time.

## Easier to read

I switched the whole site to JetBrains Mono, and the text inside the hexagons now grows
with them instead of staying one fixed size. Before, it looked fine on my MacBook and
oddly zoomed in on a 1080p monitor. The hexagons now keep the same framing on both, and
the honeycomb fills the screen whatever its shape, from an old 4:3 display to an
ultrawide.

Pure white text on a black page is harsh, so normal text is a softer off-white now, and
the glass behind it is a little darker. The animated colours still show through, but the
text doesn't fight with them.

## Logos, popups and a page for recruiters

The letters in the icon squares are mostly logos now. AxeSuite, RCIS and the bakery site
use their own app icons, and the skills use their official logos.

Click any project, job or blog post and it opens in a popup that grows out of its
hexagon. The tile shows a one-line summary, and the popup has the full story with links.
The blog works the same way now, as a carousel.

The Summary tile on the home page glows a little, on purpose. Recruiters don't have time to
click through six pages, so the Summary is everything on one page: what I'm building,
my experience, my skills, my certifications and how to reach me. It follows the same order
as my GitHub profile, with AxeSuite and RCIS first.

## Smaller things

- Gleck's eyes are on every page now, and they blink every few seconds. His notices only
  open by themselves on the home page, but the ^ next to his eyes opens them anywhere.
- The button bar under the carousels follows whichever tile is in the middle, instead of
  sitting on the one you last clicked.
- The favicon is a small hexagon I drew in SVG.
- Search engines get a proper sitemap, a preview image for shared links, and structured
  data saying who I am and where to find me.
- The first version of this site still lives at
  [v1.vatsalgoyal.com](https://v1.vatsalgoyal.com), with a note pointing back here.

## Making it smooth on slow machines

I opened the site on a low-end laptop in Firefox and it stuttered. On my own machine it
was smooth, so I measured it with the graphics card switched off, which is roughly what a
weak laptop feels like.

The culprit was the moving background. It's one shader that decides the colour of every
pixel on the screen, every frame. On a high-resolution display that's millions of pixels,
60 times a second, and without a real graphics card the page dropped to about 24 frames a
second. Hiding the background brought it straight back to 60.

The fix was almost free. The background is made of chunky dithered blocks anyway, so it
can be drawn at half the resolution and scaled up without looking any different. That's a
quarter of the work on a normal screen and a sixteenth on a sharp one. It holds 60 frames a
second now, even in that test.

As a safety net, the page also watches its own frame rate. If a device still can't keep
up, it quietly swaps the blur behind the hexagons for a plain dark tint, which looks almost
the same and costs much less.

## What's next

Mostly writing. The site is in a good place, so the next thing to change here should be
the blog, not the code.
