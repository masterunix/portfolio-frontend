---
title: How to write a post
description: A guide to the blog's format. It's a draft, so it only shows while running the site locally.
date: 2026-10-18
tags: [guide]
draft: true
---

Every post is one Markdown file in `content/blog/`. The file name is the post's address, so
`my-first-post.md` is published at `/blog/my-first-post`. Use lowercase letters, digits and
dashes.

## The details at the top

Each post starts with its details between two `---` lines. The description shows on the
blog page and in link previews.

```yaml
---
title: My first post               # required
description: One or two sentences. # required
date: 2026-10-18                   # required; newest posts come first
updated: 2026-10-20                # optional: shows "Updated …"
tags: [nextjs, design]             # optional
cover: /media/blog/my-cover.png    # optional: an image in public/
draft: true                        # optional: only shows locally
---
```

A typo in a field name, a date like `18/10/2026` or a cover image that doesn't exist stops the
build with a message saying which post and which field, so a broken post never goes live.

## Writing

Everything after the second `---` is Markdown:

- **Bold**, *italic* and `code`
- [Links](https://github.com/masterunix): ones to other sites open in a new tab
- Lists, like this one
- Images: `![What it shows](/media/blog/diagram.png)`, with the file in `public/media/blog/`

> Quotes look like this.

Code blocks keep their formatting:

```ts
export function greet(name: string) {
  return `Hi, ${name}!`;
}
```

| Tables | work |
|---|---|
| too | ✓ |

## Publishing

Remove `draft: true` (or set it to `false`) and deploy. Files starting with `_` are ignored,
which is handy for notes and templates.
