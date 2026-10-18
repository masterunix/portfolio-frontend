---
# The /summary page. Only `title` is required; leave out anything you don't want.
#
# title:     the big heading
# tagline:   one line under it
# photo:     an image in public/, e.g. /media/me.jpg (shown round)
# location:  e.g. Bengaluru, India
# updated:   a date like 2026-10-18, shown as "Updated Oct 18, 2026"
# facts:     short highlights shown as chips: - { value: 5+ yrs, label: experience }
# links:     buttons under the header: - { label: GitHub, href: https://… }
#
# Below the second --- line is Markdown. On top of normal Markdown (and HTML), you can
# use these blocks; each ends with a line containing just ::: and they don't nest.
#
#   :::callout Optional title    a highlighted box
#   :::cards                     a grid of cards; each starts with ### Card title
#   :::timeline                  a timeline; ### 2021 – 2023 | Role at Company
#   :::columns                   side by side; put a +++ line between columns
title: Hi, I'm Vatsal
tagline: I build for the web, and an AI agent called Gleck that helps run this site.
links:
  - { label: GitHub, href: "https://github.com/masterunix" }
  - { label: LinkedIn, href: "https://www.linkedin.com/in/vatsal-goyal-05a896165" }
  - { label: Email, href: "mailto:vatsalgoyal9999@gmail.com" }
---

Replace this paragraph with a few sentences about who you are, what you work on and what
you're looking for. Everything on this page comes from `content/summary.md`.

:::callout Right now
Replace this with what you're focused on at the moment.
:::

## What I do

:::cards
### Web
Replace this with the kind of web work you do.

### AI agents
[Gleck](https://github.com/masterunix/gleck) is my personal AI agent; it manages this website.

### Something else
Replace this, or delete the card.
:::

## Journey

:::timeline
### 2024 – now | Your current role
Replace this with what you do there.

### 2022 – 2024 | An earlier role
Replace this, or delete the entry.
:::

## More

:::columns
**On this site**

- [Projects](/projects)
- [Experience & skills](/skills)
- [Blog](/blog)

+++

**Elsewhere**

- [GitHub](https://github.com/masterunix)
- [LinkedIn](https://www.linkedin.com/in/vatsal-goyal-05a896165)
:::
